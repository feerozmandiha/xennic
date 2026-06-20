import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IBillingRepository } from '../../domain/interfaces/billing.repository.interface.js';
import { InvoiceEntity } from '../../domain/entities/invoice.entity.js';
import { PaymentEntity } from '../../domain/entities/payment.entity.js';
import { TransactionEntity } from '../../domain/entities/transaction.entity.js';
import { PaymentMethodEntity } from '../../domain/entities/payment-method.entity.js';
import { Prisma } from '@prisma/client';

@Injectable()
export class BillingRepository implements IBillingRepository {

  // ══════════════════════════════════════════════════════════════════════════
  // INVOICES
  // ══════════════════════════════════════════════════════════════════════════

  async saveInvoice(invoice: InvoiceEntity): Promise<void> {
    try {
      const data = {
        invoice_number: invoice.invoiceNumber,
        workspace_id: invoice.workspaceId,
        status: invoice.status,
        currency: invoice.currency,
        subtotal: invoice.subtotal,
        tax_amount: invoice.taxAmount,
        total_amount: invoice.totalAmount,
        issued_at: invoice.issuedAt,
        due_at: invoice.dueAt,
        paid_at: invoice.paidAt,
        updated_at: invoice.updatedAt,
      };
      await prisma.invoices.upsert({
        where: { id: invoice.id },
        create: {
          id: invoice.id,
          ...data,
          created_at: invoice.createdAt,
        },
        update: data,
      });
    } catch (err) {
      throw new Error(`BillingRepository.saveInvoice failed: ${(err as Error).message}`);
    }
  }

  async findInvoiceById(id: string): Promise<InvoiceEntity | null> {
    try {
      const row = await prisma.invoices.findUnique({ where: { id } });
      if (!row) return null;
      return this._mapInvoice(row);
    } catch { return null; }
  }

  async findInvoiceByNumber(number: string): Promise<InvoiceEntity | null> {
    try {
      const row = await prisma.invoices.findUnique({ where: { invoice_number: number } });
      if (!row) return null;
      return this._mapInvoice(row);
    } catch { return null; }
  }

  async findAllInvoicesByWorkspace(
    workspaceId: string, offset = 0, limit = 20,
  ): Promise<InvoiceEntity[]> {
    try {
      const rows = await prisma.invoices.findMany({
        where: { workspace_id: workspaceId },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      });
      return rows.map(r => this._mapInvoice(r));
    } catch { return []; }
  }

  async countInvoicesByWorkspace(workspaceId: string): Promise<number> {
    try {
      return await prisma.invoices.count({ where: { workspace_id: workspaceId } });
    } catch { return 0; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENTS
  // ══════════════════════════════════════════════════════════════════════════

  async savePayment(payment: PaymentEntity): Promise<void> {
    try {
      const data = {
        workspace_id: payment.workspaceId,
        invoice_id: payment.invoiceId,
        gateway: payment.gateway,
        authority: payment.authority,
        reference_number: payment.gatewayReference,
        amount: payment.amount,
        status: payment.status,
        paid_at: payment.paidAt,
      };
      await prisma.payments.upsert({
        where: { id: payment.id },
        create: { id: payment.id, ...data, created_at: payment.createdAt },
        update: data,
      });
    } catch (err) {
      throw new Error(`BillingRepository.savePayment failed: ${(err as Error).message}`);
    }
  }

  async findPaymentById(id: string): Promise<PaymentEntity | null> {
    try {
      const row = await prisma.payments.findUnique({ where: { id } });
      if (!row) return null;
      return this._mapPayment(row);
    } catch { return null; }
  }

  async findPaymentsByInvoice(invoiceId: string): Promise<PaymentEntity[]> {
    try {
      const rows = await prisma.payments.findMany({
        where: { invoice_id: invoiceId },
        orderBy: { created_at: 'desc' },
      });
      return rows.map(r => this._mapPayment(r));
    } catch { return []; }
  }

  async findPaymentByAuthority(authority: string): Promise<PaymentEntity | null> {
    try {
      const row = await prisma.payments.findFirst({ where: { authority } });
      if (!row) return null;
      return this._mapPayment(row);
    } catch { return null; }
  }

  async findAllPaymentsByWorkspace(
    workspaceId: string, offset = 0, limit = 20,
  ): Promise<PaymentEntity[]> {
    try {
      const rows = await prisma.payments.findMany({
        where: { workspace_id: workspaceId },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      });
      return rows.map(r => this._mapPayment(r));
    } catch { return []; }
  }

  async countPaymentsByWorkspace(workspaceId: string): Promise<number> {
    try {
      return await prisma.payments.count({ where: { workspace_id: workspaceId } });
    } catch { return 0; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // TRANSACTIONS
  // ══════════════════════════════════════════════════════════════════════════

  async saveTransaction(transaction: TransactionEntity): Promise<void> {
    try {
      await prisma.transactions.create({
        data: {
          id: transaction.id,
          workspace_id: transaction.workspaceId,
          payment_id: transaction.paymentId,
          type: transaction.type,
          amount: transaction.amount,
          status: transaction.status,
          metadata: transaction.metadata as Prisma.InputJsonValue,
          created_at: transaction.createdAt,
        },
      });
    } catch (err) {
      throw new Error(`BillingRepository.saveTransaction failed: ${(err as Error).message}`);
    }
  }

  async findTransactionsByPayment(paymentId: string): Promise<TransactionEntity[]> {
    try {
      const rows = await prisma.transactions.findMany({
        where: { payment_id: paymentId },
        orderBy: { created_at: 'desc' },
      });
      return rows.map(r => this._mapTransaction(r));
    } catch { return []; }
  }

  async findAllTransactionsByWorkspace(
    workspaceId: string, offset = 0, limit = 20,
  ): Promise<TransactionEntity[]> {
    try {
      const rows = await prisma.transactions.findMany({
        where: { workspace_id: workspaceId },
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
      });
      return rows.map(r => this._mapTransaction(r));
    } catch { return []; }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PAYMENT METHODS
  // ══════════════════════════════════════════════════════════════════════════

  async savePaymentMethod(method: PaymentMethodEntity): Promise<void> {
    try {
      const data = {
        workspace_id: method.workspaceId,
        user_id: method.userId,
        gateway: method.gateway,
        gateway_customer_id: method.gatewayCustomerId,
        masked_number: method.maskedNumber,
        card_holder_name: method.cardHolderName,
        is_default: method.isDefault,
        expires_at: method.expiresAt,
        updated_at: method.updatedAt,
        deleted_at: method.deletedAt,
      };
      await prisma.payment_methods.upsert({
        where: { id: method.id },
        create: { id: method.id, ...data, created_at: method.createdAt },
        update: data,
      });
    } catch (err) {
      throw new Error(`BillingRepository.savePaymentMethod failed: ${(err as Error).message}`);
    }
  }

  async findPaymentMethodById(id: string): Promise<PaymentMethodEntity | null> {
    try {
      const row = await prisma.payment_methods.findFirst({
        where: { id, deleted_at: null },
      });
      if (!row) return null;
      return this._mapPaymentMethod(row);
    } catch { return null; }
  }

  async findPaymentMethodsByWorkspace(workspaceId: string): Promise<PaymentMethodEntity[]> {
    try {
      const rows = await prisma.payment_methods.findMany({
        where: { workspace_id: workspaceId, deleted_at: null },
        orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
      });
      return rows.map(r => this._mapPaymentMethod(r));
    } catch { return []; }
  }

  async findDefaultPaymentMethod(workspaceId: string): Promise<PaymentMethodEntity | null> {
    try {
      const row = await prisma.payment_methods.findFirst({
        where: { workspace_id: workspaceId, is_default: true, deleted_at: null },
      });
      if (!row) return null;
      return this._mapPaymentMethod(row);
    } catch { return null; }
  }

  async unsetAllDefaultMethods(workspaceId: string): Promise<void> {
    try {
      await prisma.payment_methods.updateMany({
        where: { workspace_id: workspaceId },
        data: { is_default: false },
      });
    } catch { /* silent */ }
  }

  async deletePaymentMethod(id: string): Promise<void> {
    try {
      await prisma.payment_methods.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
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
      const rows = await prisma.invoices.findMany({
        where: { workspace_id: workspaceId },
        select: { status: true, total_amount: true },
      });
      let totalInvoiced = 0;
      let totalPaid = 0;
      let totalPending = 0;
      let totalOverdue = 0;
      for (const r of rows) {
        const amount = Number(r.total_amount);
        if (r.status === 'cancelled') continue;
        totalInvoiced += amount;
        if (r.status === 'paid') totalPaid += amount;
        else if (r.status === 'pending') totalPending += amount;
        else if (r.status === 'overdue') totalOverdue += amount;
      }
      return { totalInvoiced, totalPaid, totalPending, totalOverdue };
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
      authority: row.authority ?? null,
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
