import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';

export interface AuditEntry {
  action: string;
  entity: string;
  entityId: string;
  userId: string;
  workspaceId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditRepository {
  async record(entry: AuditEntry): Promise<void> {
    await prisma.audit_logs.create({
      data: {
        id: crypto.randomUUID(),
        action: entry.action,
        entity: entry.entity,
        entity_id: entry.entityId,
        user_id: entry.userId,
        workspace_id: entry.workspaceId || null,
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
        old_values: entry.oldValues || undefined,
        new_values: entry.newValues || undefined,
        metadata: entry.metadata || undefined,
        created_at: new Date(),
      },
    });
  }

  async findByEntity(entity: string, entityId: string): Promise<AuditEntry[]> {
    const logs = await prisma.audit_logs.findMany({
      where: { entity, entity_id: entityId },
      orderBy: { created_at: 'desc' },
    });
    return logs.map(this.mapToEntry);
  }

  async findByUser(userId: string, limit = 50): Promise<AuditEntry[]> {
    const logs = await prisma.audit_logs.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
    return logs.map(this.mapToEntry);
  }

  async findByWorkspace(workspaceId: string, limit = 50): Promise<AuditEntry[]> {
    const logs = await prisma.audit_logs.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'desc' },
      take: limit,
    });
    return logs.map(this.mapToEntry);
  }

  private mapToEntry(log: any): AuditEntry {
    return {
      action: log.action,
      entity: log.entity || '',
      entityId: log.entity_id || '',
      userId: log.user_id || '',
      workspaceId: log.workspace_id || undefined,
      ipAddress: log.ip_address || undefined,
      userAgent: log.user_agent || undefined,
      oldValues: log.old_values || undefined,
      newValues: log.new_values || undefined,
      metadata: log.metadata || undefined,
    };
  }
}
