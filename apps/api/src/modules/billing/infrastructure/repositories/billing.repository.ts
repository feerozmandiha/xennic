import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IBillingRepository } from '../../domain/interfaces/billing.repository.interface.js';
import { InvoiceEntity } from '../../domain/entities/invoice.entity.js';
import { PaymentEntity } from '../../domain/entities/payment.entity.js';
import { TransactionEntity } from '../../domain/entities/transaction.entity.js';
import { PaymentMethodEntity } from '../../domain/entities/payment-method.entity.js';

@Injectable()
export class BillingRepository implements IBillingRepository {

  // ══════════════════════════════════════════════════════════════════════════
  // INVOICES
  // ══════════════════════════════════════════════════════════════════════════

  async saveInvoice(invoice: InvoiceEntity): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "invoices" WHERE id = ${invoice.id} LIMIT 1
      `;
      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "invoices" SET
            status       = ${invoice.status},
            paid_at      = ${invoice.paidAt},
            due_at       = ${invoice.dueAt},
            updated_at   = ${invoice.updatedAt}
          WHERE id = ${invoice.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "invoices" (id, workspace_id, invoice_number, status, currency, subtotal, tax_amount, total_amount, issued_at, due_at, paid_at, created_at, updated_at)
          VALUES (${invoice.id}, ${invoice.workspaceId}, ${invoice.invoiceNumber}, ${invoice.status},
                  ${invoice.currency}, ${invoice.subtotal}, ${invoice.taxAmount}, ${invoice.totalAmount},
                  ${invoice.issuedAt}, ${invoice.dueAt}, ${invoice.paidAt}, ${invoice.createdAt}, ${invoice.updatedAt})
        `;
      }
    } catch (err) {
      throw new Error(`BillingRepository.saveInvoice failed: ${(err as Error).message}`);
    }
  }

  async findInvoiceById(id: string): Promise<InvoiceEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "invoices" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapInvoice(rows[0]);
    } catch { return null; }
  }

  async findInvoiceByNumber(number: string): Promise<InvoiceEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "invoices" WHERE invoice_number = ${number} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapInvoice(rows[0]);
    } catch { return null; }
  }

  async findAllInvoicesByWorkspace(
    workspaceId: string, offset = 0, limit = 20,
  ): Promise<InvoiceEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "invoices"
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map(r => this._mapInvoice(r));
    } catch { return []; }
  }

  async countInvoicesByWorkspace(workspaceId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::text as count FROM "invoices" WHERE workspace_id = ${workspaceId}
      `;
      return Number(result[0]?.count ?? 0);
    } catch { return 0; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENTS
  // ══════════════════════════════════════════════════════════════════════════

  async savePayment(payment: PaymentEntity): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "payments" WHERE id = ${payment.id} LIMIT 1
      `;
      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "payments" SET
            status           = ${payment.status},
            reference_number = ${payment.gatewayReference},
            paid_at          = ${payment.paidAt}
          WHERE id = ${payment.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "payments" (id, workspace_id, invoice_id, gateway, reference_number, amount, status, paid_at, created_at)
          VALUES (${payment.id}, ${payment.workspaceId}, ${payment.invoiceId}, ${payment.gateway},
                  ${payment.gatewayReference}, ${payment.amount}, ${payment.status},
                  ${payment.paidAt}, ${payment.createdAt})
        `;
      }
    } catch (err) {
      throw new Error(`BillingRepository.savePayment failed: ${(err as Error).message}`);
    }
  }

  async findPaymentById(id: string): Promise<PaymentEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "payments" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapPayment(rows[0]);
    } catch { return null; }
  }

  async findPaymentsByInvoice(invoiceId: string): Promise<PaymentEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "payments" WHERE invoice_id = ${invoiceId} ORDER BY created_at DESC
      `;
      return rows.map(r => this._mapPayment(r));
    } catch { return []; }
  }

  async findAllPaymentsByWorkspace(
    workspaceId: string, offset = 0, limit = 20,
  ): Promise<PaymentEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "payments"
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map(r => this._mapPayment(r));
    } catch { return []; }
  }

  async countPaymentsByWorkspace(workspaceId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*)::text as count FROM "payments" WHERE workspace_id = ${workspaceId}
      `;
      return Number(result[0]?.count ?? 0);
    } catch { return 0; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSACTIONS
  // ══════════════════════════════════════════════════════════════════════════

  async saveTransaction(transaction: TransactionEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "transactions" (id, workspace_id, payment_id, type, amount, status, metadata, created_at)
        VALUES (${transaction.id}, ${transaction.workspaceId}, ${transaction.paymentId},
                ${transaction.type}, ${transaction.amount}, ${transaction.status},
                ${JSON.stringify(transaction.metadata)}::jsonb, ${transaction.createdAt})
      `;
    } catch (err) {
      throw new Error(`BillingRepository.saveTransaction failed: ${(err as Error).message}`);
    }
  }

  async findTransactionsByPayment(paymentId: string): Promise<TransactionEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "transactions" WHERE payment_id = ${paymentId} ORDER BY created_at DESC
      `;
      return rows.map(r => this._mapTransaction(r));
    } catch { return []; }
  }

  async findAllTransactionsByWorkspace(
    workspaceId: string, offset = 0, limit = 20,
  ): Promise<TransactionEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "transactions"
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map(r => this._mapTransaction(r));
    } catch { return []; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENT METHODS
  // ══════════════════════════════════════════════════════════════════════════

  async savePaymentMethod(method: PaymentMethodEntity): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "payment_methods" WHERE id = ${method.id} LIMIT 1
      `;
      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "payment_methods" SET
            is_default       = ${method.isDefault},
            updated_at       = ${method.updatedAt},
            deleted_at       = ${method.deletedAt}
          WHERE id = ${method.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "payment_methods" (id, workspace_id, user_id, gateway, gateway_customer_id, masked_number, card_holder_name, is_default, expires_at, created_at, updated_at)
          VALUES (${method.id}, ${method.workspaceId}, ${method.userId}, ${method.gateway},
                  ${method.gatewayCustomerId}, ${method.maskedNumber}, ${method.cardHolderName},
                  ${method.isDefault}, ${method.expiresAt}, ${method.createdAt}, ${method.updatedAt})
        `;
      }
    } catch (err) {
      throw new Error(`BillingRepository.savePaymentMethod failed: ${(err as Error).message}`);
    }
  }

  async findPaymentMethodById(id: string): Promise<PaymentMethodEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "payment_methods" WHERE id = ${id} AND deleted_at IS NULL LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapPaymentMethod(rows[0]);
    } catch { return null; }
  }

  async findPaymentMethodsByWorkspace(workspaceId: string): Promise<PaymentMethodEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "payment_methods"
        WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
        ORDER BY is_default DESC, created_at DESC
      `;
      return rows.map(r => this._mapPaymentMethod(r));
    } catch { return []; }
  }

  async findDefaultPaymentMethod(workspaceId: string): Promise<PaymentMethodEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "payment_methods"
        WHERE workspace_id = ${workspaceId} AND is_default = true AND deleted_at IS NULL
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapPaymentMethod(rows[0]);
    } catch { return null; }
  }

  async unsetAllDefaultMethods(workspaceId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "payment_methods" SET is_default = false WHERE workspace_id = ${workspaceId}
      `;
    } catch {} // silent
  }

  async deletePaymentMethod(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "payment_methods" SET deleted_at = NOW() WHERE id = ${id}
      `;
    } catch (err) {
      throw new Error(`BillingRepository.deletePaymentMethod failed: ${(err as Error).message}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DASHBOARD / STATS
  // ══════════════════════════════════════════════════════════════════════════

  async getInvoiceTotalsByWorkspace(workspaceId: string): Promise<{
    totalInvoiced: number;
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
  }> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT
          COALESCE(SUM(total_amount) FILTER (WHERE status != 'cancelled'), 0)::text as total_invoiced,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'paid'), 0)::text as total_paid,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'pending'), 0)::text as total_pending,
          COALESCE(SUM(total_amount) FILTER (WHERE status = 'overdue'), 0)::text as total_overdue
        FROM "invoices"
        WHERE workspace_id = ${workspaceId}
      `;
      const r = rows[0];
      return {
        totalInvoiced: Number(r?.total_invoiced ?? 0),
        totalPaid:     Number(r?.total_paid ?? 0),
        totalPending:  Number(r?.total_pending ?? 0),
        totalOverdue:  Number(r?.total_overdue ?? 0),
      };
    } catch {
      return { totalInvoiced: 0, totalPaid: 0, totalPending: 0, totalOverdue: 0 };
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAPPERS
  // ══════════════════════════════════════════════════════════════════════════

  private _mapInvoice(row: any): InvoiceEntity {
    return InvoiceEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      invoiceNumber: row.invoice_number,
      status: row.status,
      currency: row.currency,
      subtotal: Number(row.subtotal),
      taxAmount: Number(row.tax_amount),
      totalAmount: Number(row.total_amount),
      issuedAt: row.issued_at,
      dueAt: row.due_at ?? null,
      paidAt: row.paid_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }

  private _mapPayment(row: any): PaymentEntity {
    return PaymentEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      invoiceId: row.invoice_id,
      gateway: row.gateway,
      referenceNumber: row.reference_number ?? null,
      status: row.status,
      amount: Number(row.amount),
      paidAt: row.paid_at ?? null,
      createdAt: row.created_at,
    });
  }

  private _mapTransaction(row: any): TransactionEntity {
    let metadata: Record<string, unknown> = {};
    try { metadata = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : (row.metadata ?? {}); } catch {}
    return TransactionEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      paymentId: row.payment_id,
      type: row.type,
      amount: Number(row.amount),
      status: row.status,
      metadata,
      createdAt: row.created_at,
    });
  }

  private _mapPaymentMethod(row: any): PaymentMethodEntity {
    return PaymentMethodEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      userId: row.user_id,
      gateway: row.gateway,
      gatewayCustomerId: row.gateway_customer_id ?? null,
      maskedNumber: row.masked_number ?? null,
      cardHolderName: row.card_holder_name ?? null,
      isDefault: row.is_default,
      expiresAt: row.expires_at ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      deletedAt: row.deleted_at ?? null,
    });
  }
}
