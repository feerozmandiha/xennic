import type { InvoiceEntity } from '../entities/invoice.entity.js';
import type { PaymentEntity } from '../entities/payment.entity.js';
import type { TransactionEntity } from '../entities/transaction.entity.js';
import type { PaymentMethodEntity } from '../entities/payment-method.entity.js';

export interface IBillingRepository {
  // ── Invoices ─────────────────────────────────────────────────────────────
  saveInvoice(invoice: InvoiceEntity): Promise<void>;
  findInvoiceById(id: string): Promise<InvoiceEntity | null>;
  findInvoiceByNumber(number: string): Promise<InvoiceEntity | null>;
  findAllInvoicesByWorkspace(
    workspaceId: string,
    offset?: number,
    limit?: number,
  ): Promise<InvoiceEntity[]>;
  countInvoicesByWorkspace(workspaceId: string): Promise<number>;

  // ── Payments ─────────────────────────────────────────────────────────────
  savePayment(payment: PaymentEntity): Promise<void>;
  findPaymentById(id: string): Promise<PaymentEntity | null>;
  findPaymentsByInvoice(invoiceId: string): Promise<PaymentEntity[]>;
  findPaymentByAuthority(authority: string): Promise<PaymentEntity | null>;
  findAllPaymentsByWorkspace(
    workspaceId: string,
    offset?: number,
    limit?: number,
  ): Promise<PaymentEntity[]>;
  countPaymentsByWorkspace(workspaceId: string): Promise<number>;

  // ── Transactions ─────────────────────────────────────────────────────────
  saveTransaction(transaction: TransactionEntity): Promise<void>;
  findTransactionsByPayment(paymentId: string): Promise<TransactionEntity[]>;
  findAllTransactionsByWorkspace(
    workspaceId: string,
    offset?: number,
    limit?: number,
  ): Promise<TransactionEntity[]>;

  // ── Payment Methods ──────────────────────────────────────────────────────
  savePaymentMethod(method: PaymentMethodEntity): Promise<void>;
  findPaymentMethodById(id: string): Promise<PaymentMethodEntity | null>;
  findPaymentMethodsByWorkspace(workspaceId: string): Promise<PaymentMethodEntity[]>;
  findDefaultPaymentMethod(workspaceId: string): Promise<PaymentMethodEntity | null>;
  unsetAllDefaultMethods(workspaceId: string): Promise<void>;
  deletePaymentMethod(id: string): Promise<void>;

  // ── Dashboard / Stats ────────────────────────────────────────────────────
  getInvoiceTotalsByWorkspace(workspaceId: string): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
  }>;
}
