export type PaymentGatewayType = 'zarinpal' | 'payping';

export class PaymentMethodEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly userId: string,
    public readonly gateway: PaymentGatewayType,
    public readonly gatewayCustomerId: string | null,
    public readonly maskedNumber: string | null,
    public readonly cardHolderName: string | null,
    private _isDefault: boolean,
    public readonly expiresAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(data: {
    workspaceId: string;
    userId: string;
    gateway: PaymentGatewayType;
    gatewayCustomerId?: string | null;
    maskedNumber?: string | null;
    cardHolderName?: string | null;
    isDefault?: boolean;
    expiresAt?: Date | null;
  }): PaymentMethodEntity {
    const now = new Date();
    return new PaymentMethodEntity(
      crypto.randomUUID(),
      data.workspaceId,
      data.userId,
      data.gateway,
      data.gatewayCustomerId ?? null,
      data.maskedNumber ?? null,
      data.cardHolderName ?? null,
      data.isDefault ?? false,
      data.expiresAt ?? null,
      now, now, null,
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    userId: string;
    gateway: string;
    gatewayCustomerId: string | null;
    maskedNumber: string | null;
    cardHolderName: string | null;
    isDefault: boolean;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): PaymentMethodEntity {
    return new PaymentMethodEntity(
      data.id, data.workspaceId, data.userId,
      data.gateway as PaymentGatewayType,
      data.gatewayCustomerId, data.maskedNumber, data.cardHolderName,
      data.isDefault, data.expiresAt,
      data.createdAt, data.updatedAt, data.deletedAt,
    );
  }

  get isDefault(): boolean { return this._isDefault; }

  setAsDefault(): void {
    this._isDefault = true;
    this.updatedAt = new Date();
  }

  unsetDefault(): void {
    this._isDefault = false;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  isDeleted(): boolean { return this.deletedAt !== null; }
}
