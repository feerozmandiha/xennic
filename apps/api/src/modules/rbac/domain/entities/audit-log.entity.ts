export class AuditLogEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string | null,
    public readonly userId: string | null,
    public readonly ipAddress: string | null,
    public readonly userAgent: string | null,
    public readonly action: string,
    public readonly entity: string | null,
    public readonly entityId: string | null,
    public readonly oldValues: Record<string, unknown> | null,
    public readonly newValues: Record<string, unknown> | null,
    public readonly metadata: Record<string, unknown> | null,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    workspaceId?: string;
    userId?: string;
    ipAddress?: string;
    userAgent?: string;
    action: string;
    entity?: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
  }): AuditLogEntity {
    return new AuditLogEntity(
      crypto.randomUUID(),
      data.workspaceId || null,
      data.userId || null,
      data.ipAddress || null,
      data.userAgent || null,
      data.action,
      data.entity || null,
      data.entityId || null,
      data.oldValues || null,
      data.newValues || null,
      data.metadata || null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string | null;
    userId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    action: string;
    entity: string | null;
    entityId: string | null;
    oldValues: Record<string, unknown> | null;
    newValues: Record<string, unknown> | null;
    metadata: Record<string, unknown> | null;
    createdAt: Date;
  }): AuditLogEntity {
    return new AuditLogEntity(
      data.id,
      data.workspaceId,
      data.userId,
      data.ipAddress,
      data.userAgent,
      data.action,
      data.entity,
      data.entityId,
      data.oldValues,
      data.newValues,
      data.metadata,
      data.createdAt,
    );
  }
}