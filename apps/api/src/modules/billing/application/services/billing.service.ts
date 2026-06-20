import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import type { IBillingRepository } from '../../domain/interfaces/billing.repository.interface.js';
import { InvoiceEntity } from '../../domain/entities/invoice.entity.js';
import { PaymentEntity, type PaymentGateway } from '../../domain/entities/payment.entity.js';
import { TransactionEntity } from '../../domain/entities/transaction.entity.js';
import { PaymentMethodEntity } from '../../domain/entities/payment-method.entity.js';
import type { IPaymentGateway } from '../../infrastructure/gateways/payment-gateway.interface.js';

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);

  constructor(
    @Inject('IBillingRepository')
    private readonly billingRepository: IBillingRepository,
    @Inject('ZARINPAL_GATEWAY')
    private readonly zarinpalGateway: IPaymentGateway,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // INVOICES
  // ══════════════════════════════════════════════════════════════════════════

  async createInvoice(data: {
    workspaceId: string;
    subtotal: number;
    taxAmount?: number;
    totalAmount: number;
    currency?: string;
    dueAt?: Date | null;
  }): Promise<InvoiceEntity> {
    const invoiceNumber = await this._generateInvoiceNumber(data.workspaceId);
    const invoice = InvoiceEntity.create({
      ...data,
      invoiceNumber,
    });
    await this.billingRepository.saveInvoice(invoice);
    return invoice;
  }

  async getInvoice(id: string, workspaceId: string): Promise<InvoiceEntity> {
    const invoice = await this.billingRepository.findInvoiceById(id);
    if (!invoice) throw new NotFoundException(`Invoice "${id}" not found`);
    if (invoice.workspaceId !== workspaceId) throw new ForbiddenException('Access denied');
    return invoice;
  }

  async getInvoicesByWorkspace(
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: InvoiceEntity[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.billingRepository.findAllInvoicesByWorkspace(workspaceId, offset, limit),
      this.billingRepository.countInvoicesByWorkspace(workspaceId),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markInvoicePaid(id: string, workspaceId: string): Promise<InvoiceEntity> {
    const invoice = await this.getInvoice(id, workspaceId);
    invoice.markAsPaid();
    await this.billingRepository.saveInvoice(invoice);
    return invoice;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENTS
  // ══════════════════════════════════════════════════════════════════════════

  async createPayment(data: {
    workspaceId: string;
    invoiceId: string;
    gateway: PaymentGateway;
    amount: number;
  }): Promise<PaymentEntity> {
    const invoice = await this.getInvoice(data.invoiceId, data.workspaceId);
    if (!invoice.isPending()) throw new ConflictException('Invoice is not pending');

    const payment = PaymentEntity.create(data);
    await this.billingRepository.savePayment(payment);
    return payment;
  }

  async requestGatewayPayment(
    paymentId: string,
    workspaceId: string,
    callbackUrl: string,
  ): Promise<{ redirectUrl: string; authority: string }> {
    const payment = await this.getPayment(paymentId, workspaceId);
    if (!payment.isPending()) throw new ConflictException('Payment is not pending');

    payment.markAsProcessing();
    await this.billingRepository.savePayment(payment);

    const result = await this.zarinpalGateway.requestPayment({
      amount: payment.amount,
      currency: 'IRR',
      description: `Invoice payment #${paymentId}`,
      callbackUrl,
      orderId: payment.invoiceId,
      metadata: { paymentId: payment.id },
    });

    if (!result.success) {
      payment.fail();
      await this.billingRepository.savePayment(payment);
      throw new Error(`Payment gateway error: ${result.message}`);
    }

    payment.setAuthority(result.authority);
    await this.billingRepository.savePayment(payment);

    this.logger.log(`Payment ${paymentId} → Zarinpal authority: ${result.authority}`);

    return { redirectUrl: result.redirectUrl!, authority: result.authority };
  }

  async verifyGatewayPayment(
    authority: string,
    amount: number,
  ): Promise<PaymentEntity> {
    const verification = await this.zarinpalGateway.verifyPayment(authority, amount);
    if (!verification.success) {
      throw new Error(`Payment verification failed: ${verification.message}`);
    }

    const payment = await this._findPaymentByAuthority(authority, amount);
    this._completePayment(payment, authority, verification);

    return payment;
  }

  async verifyByAuthority(authority: string): Promise<{ payment: PaymentEntity; workspaceId: string }> {
    const payment = await this.billingRepository.findPaymentByAuthority(authority);
    if (!payment) throw new NotFoundException('Payment not found for this authority');
    if (!payment.isPending() && payment.status !== 'processing') {
      throw new ConflictException('Payment is not pending or processing');
    }

    const verification = await this.zarinpalGateway.verifyPayment(authority, payment.amount);
    if (!verification.success) {
      this.logger.warn(`Zarinpal verify failed for authority ${authority}: ${verification.message}`);
      throw new Error(`Payment verification failed: ${verification.message}`);
    }

    this._completePayment(payment, authority, verification);

    return { payment, workspaceId: payment.workspaceId };
  }

  private async _findPaymentByAuthority(authority: string, amount: number): Promise<PaymentEntity> {
    let payment = await this.billingRepository.findPaymentByAuthority(authority);
    if (!payment) {
      const payments = await this.billingRepository.findAllPaymentsByWorkspace('');
      payment = payments.find(p => p.isPending() && p.amount === amount) ?? null;
      if (!payment) throw new NotFoundException('Payment not found for verification');
    }
    return payment;
  }

  private async _completePayment(
    payment: PaymentEntity,
    authority: string,
    verification: { referenceId: string; cardNumber?: string; message?: string },
  ): Promise<void> {
    payment.confirm(verification.referenceId);

    const invoice = await this.billingRepository.findInvoiceById(payment.invoiceId);
    if (invoice) {
      invoice.markAsPaid();
      await this.billingRepository.saveInvoice(invoice);
    }

    await this.billingRepository.savePayment(payment);

    const transaction = TransactionEntity.create({
      workspaceId: payment.workspaceId,
      paymentId: payment.id,
      type: 'payment',
      amount: payment.amount,
      metadata: {
        authority,
        referenceId: verification.referenceId,
        cardNumber: verification.cardNumber,
      },
    });
    transaction.complete();
    await this.billingRepository.saveTransaction(transaction);

    this.logger.log(`Payment ${payment.id} completed — ref: ${verification.referenceId}`);
  }

  async getPayment(id: string, workspaceId: string): Promise<PaymentEntity> {
    const payment = await this.billingRepository.findPaymentById(id);
    if (!payment) throw new NotFoundException(`Payment "${id}" not found`);
    if (payment.workspaceId !== workspaceId) throw new ForbiddenException('Access denied');
    return payment;
  }

  async getPaymentsByWorkspace(
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: PaymentEntity[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.billingRepository.findAllPaymentsByWorkspace(workspaceId, offset, limit),
      this.billingRepository.countPaymentsByWorkspace(workspaceId),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSACTIONS
  // ══════════════════════════════════════════════════════════════════════════

  async getTransactionsByWorkspace(
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: TransactionEntity[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const offset = (page - 1) * limit;
    const data = await this.billingRepository.findAllTransactionsByWorkspace(workspaceId, offset, limit);
    // Transactions don't have a count method yet, estimate from payments count
    const total = await this.billingRepository.countPaymentsByWorkspace(workspaceId);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENT METHODS
  // ══════════════════════════════════════════════════════════════════════════

  async addPaymentMethod(data: {
    workspaceId: string;
    userId: string;
    gateway: PaymentGateway;
    gatewayCustomerId?: string;
    maskedNumber?: string;
    cardHolderName?: string;
    isDefault?: boolean;
  }): Promise<PaymentMethodEntity> {
    if (data.isDefault) {
      await this.billingRepository.unsetAllDefaultMethods(data.workspaceId);
    }
    const method = PaymentMethodEntity.create(data);
    await this.billingRepository.savePaymentMethod(method);
    return method;
  }

  async getPaymentMethods(workspaceId: string): Promise<PaymentMethodEntity[]> {
    return this.billingRepository.findPaymentMethodsByWorkspace(workspaceId);
  }

  async deletePaymentMethod(id: string, workspaceId: string): Promise<void> {
    const method = await this.billingRepository.findPaymentMethodById(id);
    if (!method) throw new NotFoundException(`Payment method "${id}" not found`);
    if (method.workspaceId !== workspaceId) throw new ForbiddenException('Access denied');
    await this.billingRepository.deletePaymentMethod(id);
  }

  async setDefaultPaymentMethod(id: string, workspaceId: string): Promise<PaymentMethodEntity> {
    const method = await this.billingRepository.findPaymentMethodById(id);
    if (!method) throw new NotFoundException(`Payment method "${id}" not found`);
    if (method.workspaceId !== workspaceId) throw new ForbiddenException('Access denied');
    await this.billingRepository.unsetAllDefaultMethods(workspaceId);
    method.setAsDefault();
    await this.billingRepository.savePaymentMethod(method);
    return method;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════

  async getDashboard(workspaceId: string): Promise<{
    invoices: { total: number; paid: number; pending: number; overdue: number };
    recentPayments: PaymentEntity[];
  }> {
    const totals = await this.billingRepository.getInvoiceTotalsByWorkspace(workspaceId);
    const recentPayments = await this.billingRepository.findAllPaymentsByWorkspace(workspaceId, 0, 5);
    return {
      invoices: {
        total: totals.totalInvoiced,
        paid: totals.totalPaid,
        pending: totals.totalPending,
        overdue: totals.totalOverdue,
      },
      recentPayments,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  private async _generateInvoiceNumber(workspaceId: string): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.billingRepository.countInvoicesByWorkspace(workspaceId);
    const shortId = workspaceId.slice(0, 4).toUpperCase();
    return `INV-${shortId}-${datePart}-${(count + 1).toString().padStart(4, '0')}`;
  }
}
