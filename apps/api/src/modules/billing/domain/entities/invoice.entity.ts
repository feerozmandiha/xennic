export type InvoiceStatus = 'pending' | 'paid' | 'overdue' | 'cancelled' | 'refunded';

export class InvoiceEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly invoiceNumber: string,
    private _status: InvoiceStatus,
    public readonly currency: string,
    public readonly subtotal: number,
    public readonly taxAmount: number,
    public readonly totalAmount: number,
    public readonly issuedAt: Date,
    public dueAt: Date | null,
    public paidAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    invoiceNumber: string;
    currency?: string;
    subtotal: number;
    taxAmount?: number;
    totalAmount: number;
    dueAt?: Date | null;
  }): InvoiceEntity {
    const now = new Date();
    return new InvoiceEntity(
      crypto.randomUUID(),
      data.workspaceId,
      data.invoiceNumber,
      'pending',
      data.currency ?? 'USD',
      data.subtotal,
      data.taxAmount ?? 0,
      data.totalAmount,
      now,
      data.dueAt ?? null,
      null,
      now,
      now,
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    invoiceNumber: string;
    status: string;
    currency: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    issuedAt: Date;
    dueAt: Date | null;
    paidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): InvoiceEntity {
    return new InvoiceEntity(
      data.id, data.workspaceId, data.invoiceNumber,
      data.status as InvoiceStatus,
      data.currency, data.subtotal, data.taxAmount, data.totalAmount,
      data.issuedAt, data.dueAt, data.paidAt,
      data.createdAt, data.updatedAt,
    );
  }

  get status(): InvoiceStatus { return this._status; }

  markAsPaid(): void {
    if (this._status === 'paid') throw new Error('Invoice is already paid');
    if (this._status === 'cancelled') throw new Error('Cannot pay a cancelled invoice');
    if (this._status === 'refunded') throw new Error('Cannot pay a refunded invoice');
    this._status = 'paid';
    this.paidAt = new Date();
    this.updatedAt = new Date();
  }

  markAsOverdue(): void {
    if (this._status !== 'pending') throw new Error('Only pending invoices can become overdue');
    this._status = 'overdue';
    this.updatedAt = new Date();
  }

  cancel(): void {
    if (this._status === 'paid') throw new Error('Cannot cancel a paid invoice — issue refund instead');
    if (this._status === 'cancelled') throw new Error('Invoice is already cancelled');
    this._status = 'cancelled';
    this.updatedAt = new Date();
  }

  refund(): void {
    if (this._status !== 'paid') throw new Error('Only paid invoices can be refunded');
    this._status = 'refunded';
    this.updatedAt = new Date();
  }

  isPaid(): boolean { return this._status === 'paid'; }
  isPending(): boolean { return this._status === 'pending'; }
  isOverdue(): boolean { return this._status === 'overdue'; }
  isCancelled(): boolean { return this._status === 'cancelled'; }
}
