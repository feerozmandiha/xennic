export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded';

export type PaymentGateway = 'zarinpal' | 'payping';

export class PaymentEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly invoiceId: string,
    public readonly gateway: PaymentGateway,
    private _gatewayReference: string | null,
    private _authority: string | null,
    private _status: PaymentStatus,
    public readonly amount: number,
    public paidAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    invoiceId: string;
    gateway: PaymentGateway;
    amount: number;
  }): PaymentEntity {
    return new PaymentEntity(
      crypto.randomUUID(),
      data.workspaceId,
      data.invoiceId,
      data.gateway,
      null,
      null,
      'pending',
      data.amount,
      null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    invoiceId: string;
    gateway: string;
    authority: string | null;
    referenceNumber: string | null;
    status: string;
    amount: number;
    paidAt: Date | null;
    createdAt: Date;
  }): PaymentEntity {
    return new PaymentEntity(
      data.id, data.workspaceId, data.invoiceId,
      data.gateway as PaymentGateway,
      data.referenceNumber,
      data.authority,
      data.status as PaymentStatus,
      data.amount, data.paidAt, data.createdAt,
    );
  }

  get status(): PaymentStatus { return this._status; }
  get gatewayReference(): string | null { return this._gatewayReference; }
  get authority(): string | null { return this._authority; }

  setAuthority(authority: string): void {
    this._authority = authority;
  }

  confirm(referenceNumber: string): void {
    if (this._status !== 'pending' && this._status !== 'processing') {
      throw new Error('Only pending/processing payments can be confirmed');
    }
    this._status = 'paid';
    this._gatewayReference = referenceNumber;
    this.paidAt = new Date();
  }

  fail(): void {
    if (this._status === 'paid') throw new Error('Cannot fail an already paid payment');
    this._status = 'failed';
  }

  markAsProcessing(): void {
    if (this._status !== 'pending') throw new Error('Only pending payments can start processing');
    this._status = 'processing';
  }

  refund(): void {
    if (this._status !== 'paid') throw new Error('Only paid payments can be refunded');
    this._status = 'refunded';
  }

  isPaid(): boolean { return this._status === 'paid'; }
  isFailed(): boolean { return this._status === 'failed'; }
  isPending(): boolean { return this._status === 'pending'; }
}
