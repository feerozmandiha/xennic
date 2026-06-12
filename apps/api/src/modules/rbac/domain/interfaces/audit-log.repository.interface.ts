import { AuditLogEntity } from '../entities/audit-log.entity.js';

export interface IAuditLogRepository {
  save(log: AuditLogEntity): Promise<void>;
  findAll(filters?: {
    userId?: string;
    workspaceId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    offset?: number;
    limit?: number;
  }): Promise<AuditLogEntity[]>;
  findByUserId(userId: string, limit?: number): Promise<AuditLogEntity[]>;
  findByWorkspaceId(workspaceId: string, limit?: number): Promise<AuditLogEntity[]>;
  count(filters?: { userId?: string; workspaceId?: string; action?: string }): Promise<number>;
}