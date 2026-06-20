import { createHash, randomBytes } from 'crypto';

export type ApiKeyStatus = 'active' | 'revoked' | 'expired';

export class ApiKeyEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly name: string,
    public readonly keyHash: string,
    private _lastUsedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly createdAt: Date,
    private _status: ApiKeyStatus,
  ) {}

  static create(data: {
    workspaceId: string;
    name: string;
    expiresAt?: Date;
  }): { entity: ApiKeyEntity; rawKey: string } {
    const rawKey = `xennic_sk_${randomBytes(32).toString('hex')}`;
    const keyHash = createHash('sha256').update(rawKey).digest('hex');

    const entity = new ApiKeyEntity(
      crypto.randomUUID(),
      data.workspaceId,
      data.name,
      keyHash,
      null,
      data.expiresAt ?? null,
      new Date(),
      'active',
    );

    return { entity, rawKey };
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    name: string;
    keyHash: string;
    lastUsedAt: Date | null;
    expiresAt: Date | null;
    createdAt: Date;
    status?: string;
  }): ApiKeyEntity {
    return new ApiKeyEntity(
      data.id,
      data.workspaceId,
      data.name,
      data.keyHash,
      data.lastUsedAt,
      data.expiresAt,
      data.createdAt,
      (data.status as ApiKeyStatus) ?? 'active',
    );
  }

  get status(): ApiKeyStatus { return this._status; }
  get lastUsedAt(): Date | null { return this._lastUsedAt; }

  markAsUsed(): void {
    this._lastUsedAt = new Date();
  }

  revoke(): void {
    this._status = 'revoked';
  }

  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  isActive(): boolean {
    return this._status === 'active' && !this.isExpired();
  }

  get maskedKey(): string {
    return `${this.id.slice(0, 8)}...${this.keyHash.slice(0, 4)}`;
  }

  static hashKey(rawKey: string): string {
    return createHash('sha256').update(rawKey).digest('hex');
  }
}
