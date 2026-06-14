export type TransactionType = 'payment' | 'refund' | 'subscription_renewal' | 'adjustment' | 'fee';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export class TransactionEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly paymentId: string,
    public readonly type: TransactionType,
    public readonly amount: number,
    private _status: TransactionStatus,
    public readonly metadata: Record<string, unknown>,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    paymentId: string;
    type: TransactionType;
    amount: number;
    metadata?: Record<string, unknown>;
  }): TransactionEntity {
    return new TransactionEntity(
      crypto.randomUUID(),
      data.workspaceId,
      data.paymentId,
      data.type,
      data.amount,
      'pending',
      data.metadata ?? {},
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    paymentId: string;
    type: string;
    amount: number;
    status: string;
    metadata: Record<string, unknown>;
    createdAt: Date;
  }): TransactionEntity {
    return new TransactionEntity(
      data.id, data.workspaceId, data.paymentId,
      data.type as TransactionType,
      data.amount,
      data.status as TransactionStatus,
      data.metadata, data.createdAt,
    );
  }

  get status(): TransactionStatus { return this._status; }

  complete(): void {
    if (this._status !== 'pending') throw new Error('Only pending transactions can be completed');
    this._status = 'completed';
  }

  fail(): void {
    if (this._status === 'completed') throw new Error('Cannot fail a completed transaction');
    this._status = 'failed';
  }

  isCompleted(): boolean { return this._status === 'completed'; }
}
