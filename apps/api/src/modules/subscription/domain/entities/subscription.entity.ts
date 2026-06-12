export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export class SubscriptionEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly planId: string,
    public readonly planSlug: string,      // cached for quick access
    private _status: SubscriptionStatus,
    public readonly startsAt: Date,
    public expiresAt: Date | null,
    public cancelledAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    workspaceId: string;
    planId: string;
    planSlug: string;
    startsAt?: Date;
    expiresAt?: Date | null;
  }): SubscriptionEntity {
    const now = new Date();
    return new SubscriptionEntity(
      crypto.randomUUID(),
      data.workspaceId,
      data.planId,
      data.planSlug,
      'active',
      data.startsAt ?? now,
      data.expiresAt ?? null,
      null,
      now,
      now,
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    planId: string;
    planSlug: string;
    status: string;
    startsAt: Date;
    expiresAt: Date | null;
    cancelledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }): SubscriptionEntity {
    return new SubscriptionEntity(
      data.id, data.workspaceId, data.planId, data.planSlug,
      data.status as SubscriptionStatus,
      data.startsAt, data.expiresAt, data.cancelledAt,
      data.createdAt, data.updatedAt,
    );
  }

  // ── getters ──────────────────────────────────────────────────────────────

  get status(): SubscriptionStatus { return this._status; }

  // ── business methods ─────────────────────────────────────────────────────

  cancel(): void {
    if (this._status === 'cancelled') {
      throw new Error('Subscription is already cancelled');
    }
    this._status    = 'cancelled';
    this.cancelledAt = new Date();
    this.updatedAt   = new Date();
  }

  isActive(): boolean {
    if (this._status !== 'active') return false;
    if (this.expiresAt && this.expiresAt < new Date()) return false;
    return true;
  }

  isCancelled(): boolean  { return this._status === 'cancelled'; }
  isExpired(): boolean    {
    return this.expiresAt !== null && this.expiresAt < new Date();
  }
}
