import { Injectable, Inject, Logger } from '@nestjs/common';
import type { IBillingRepository } from '../../domain/interfaces/billing.repository.interface.js';
import { InvoiceEntity } from '../../domain/entities/invoice.entity.js';
import { PaymentEntity, type PaymentGateway } from '../../domain/entities/payment.entity.js';
import { TransactionEntity } from '../../domain/entities/transaction.entity.js';
import { SubscriptionService } from '../../../subscription/application/services/subscription.service.js';
import type { PlanEntity } from '../../../subscription/domain/entities/plan.entity.js';

@Injectable()
export class SubscriptionBillingService {
  private readonly logger = new Logger(SubscriptionBillingService.name);

  constructor(
    @Inject('IBillingRepository')
    private readonly billingRepository: IBillingRepository,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async chargeForSubscription(
    workspaceId: string,
    subscriptionId: string,
    plan: PlanEntity,
    paymentGateway: PaymentGateway = 'zarinpal',
  ): Promise<{
    invoice: InvoiceEntity;
    payment: PaymentEntity;
  }> {
    const monthlyPrice = plan.monthlyPrice;
    const taxRate = parseFloat(process.env.TAX_RATE ?? '0.09');
    const taxAmount = Math.round(monthlyPrice * taxRate);
    const totalAmount = monthlyPrice + taxAmount;

    const invoice = await this._createSubscriptionInvoice(
      workspaceId, plan, monthlyPrice, taxAmount, totalAmount,
    );

    const payment = PaymentEntity.create({
      workspaceId,
      invoiceId: invoice.id,
      gateway: paymentGateway,
      amount: totalAmount,
    });
    await this.billingRepository.savePayment(payment);

    const transaction = TransactionEntity.create({
      workspaceId,
      paymentId: payment.id,
      type: 'subscription_renewal',
      amount: totalAmount,
      metadata: {
        subscriptionId,
        planSlug: plan.slug,
        planName: plan.name,
        periodStart: new Date().toISOString(),
      },
    });
    transaction.complete();
    await this.billingRepository.saveTransaction(transaction);

    await this.billingRepository.saveInvoice(invoice);
    await this.billingRepository.savePayment(payment);

    this.logger.log(`Charged workspace ${workspaceId} for plan ${plan.slug}: ${totalAmount}`);

    return { invoice, payment };
  }

  async processSubscriptionRenewal(
    workspaceId: string,
    subscriptionId: string,
  ): Promise<{ invoice: InvoiceEntity; payment: PaymentEntity } | null> {
    try {
      const plan = await this.subscriptionService.getActivePlan(workspaceId);
      if (plan.isFree()) {
        this.logger.log(`Workspace ${workspaceId} is on free plan — skipping charge`);
        return null;
      }

      return this.chargeForSubscription(workspaceId, subscriptionId, plan);
    } catch (err) {
      this.logger.error(`Failed to process renewal for workspace ${workspaceId}: ${(err as Error).message}`);
      throw err;
    }
  }

  async getSubscriptionPaymentHistory(
    workspaceId: string,
  ): Promise<{
    invoice: InvoiceEntity;
    payment: PaymentEntity | null;
  }[]> {
    const invoices = await this.billingRepository.findAllInvoicesByWorkspace(workspaceId, 0, 100);
    const result: { invoice: InvoiceEntity; payment: PaymentEntity | null }[] = [];

    for (const invoice of invoices) {
      const payments = await this.billingRepository.findPaymentsByInvoice(invoice.id);
      result.push({
        invoice,
        payment: payments[0] ?? null,
      });
    }

    return result;
  }

  private async _createSubscriptionInvoice(
    workspaceId: string,
    plan: PlanEntity,
    subtotal: number,
    taxAmount: number,
    totalAmount: number,
  ): Promise<InvoiceEntity> {
    const invoiceNumber = await this._generateInvoiceNumber(workspaceId);
    const invoice = InvoiceEntity.create({
      workspaceId,
      invoiceNumber,
      currency: 'USD',
      subtotal,
      taxAmount,
      totalAmount,
      dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
    return invoice;
  }

  private async _generateInvoiceNumber(workspaceId: string): Promise<string> {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.billingRepository.countInvoicesByWorkspace(workspaceId);
    const shortId = workspaceId.slice(0, 4).toUpperCase();
    return `SUB-${shortId}-${datePart}-${(count + 1).toString().padStart(4, '0')}`;
  }
}
