export class SessionEntity {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly workspaceId: string | null,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public expiresAt: Date,
    public lastActivityAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
    workspaceId?: string,
  ): SessionEntity {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes

    return new SessionEntity(
      crypto.randomUUID(),
      userId,
      workspaceId || null,
      ipAddress || null,
      userAgent || null,
      expiresAt,
      now,
      now,
    );
  }

  static reconstitute(data: {
    id: string;
    userId: string;
    workspaceId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    expiresAt: Date;
    lastActivityAt: Date;
    createdAt: Date;
  }): SessionEntity {
    return new SessionEntity(
      data.id,
      data.userId,
      data.workspaceId,
      data.ipAddress,
      data.userAgent,
      data.expiresAt,
      data.lastActivityAt,
      data.createdAt,
    );
  }

  extend(): void {
    this.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    this.lastActivityAt = new Date();
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }
}