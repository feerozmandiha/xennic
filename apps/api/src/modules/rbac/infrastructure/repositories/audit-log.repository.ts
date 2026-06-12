import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IAuditLogRepository } from '../../domain/interfaces/audit-log.repository.interface.js';
import { AuditLogEntity } from '../../domain/entities/audit-log.entity.js';

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {

  // ─── save ───────────────────────────────────────────────────────────────────

  async save(log: AuditLogEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "audit_logs" (
          id, workspace_id, user_id, ip_address, user_agent,
          action, entity, entity_id, old_values, new_values, metadata, created_at
        ) VALUES (
          ${log.id},
          ${log.workspaceId},
          ${log.userId},
          ${log.ipAddress},
          ${log.userAgent},
          ${log.action},
          ${log.entity},
          ${log.entityId},
          ${log.oldValues ? JSON.stringify(log.oldValues) : null}::jsonb,
          ${log.newValues ? JSON.stringify(log.newValues) : null}::jsonb,
          ${log.metadata  ? JSON.stringify(log.metadata)  : null}::jsonb,
          ${log.createdAt}
        )
      `;
    } catch (err) {
      // Audit log hatası uygulamayı durdurmamalı — sadece log
      const error = err as Error;
      console.error('AuditLogRepository.save failed:', error.message);
    }
  }

  // ─── findAll ─────────────────────────────────────────────────────────────────

  async findAll(filters?: {
    userId?: string;
    workspaceId?: string;
    action?: string;
    startDate?: Date;
    endDate?: Date;
    offset?: number;
    limit?: number;
  }): Promise<AuditLogEntity[]> {
    const offset = filters?.offset ?? 0;
    const limit  = filters?.limit  ?? 50;

    try {
      // ساخت پویای کوئری بر اساس فیلترها
      let rows: any[];

      if (filters?.userId && filters?.workspaceId && filters?.action) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "audit_logs"
          WHERE user_id = ${filters.userId}
            AND workspace_id = ${filters.workspaceId}
            AND action = ${filters.action}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (filters?.workspaceId && filters?.action) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "audit_logs"
          WHERE workspace_id = ${filters.workspaceId}
            AND action = ${filters.action}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (filters?.userId && filters?.action) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "audit_logs"
          WHERE user_id = ${filters.userId}
            AND action = ${filters.action}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (filters?.workspaceId) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "audit_logs"
          WHERE workspace_id = ${filters.workspaceId}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (filters?.userId) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "audit_logs"
          WHERE user_id = ${filters.userId}
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "audit_logs"
          ORDER BY created_at DESC
          LIMIT ${limit} OFFSET ${offset}
        `;
      }

      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('AuditLogRepository.findAll error:', error.message);
      return [];
    }
  }

  // ─── findByUserId ────────────────────────────────────────────────────────────

  async findByUserId(userId: string, limit = 50): Promise<AuditLogEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "audit_logs"
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('AuditLogRepository.findByUserId error:', error.message);
      return [];
    }
  }

  // ─── findByWorkspaceId ───────────────────────────────────────────────────────

  async findByWorkspaceId(workspaceId: string, limit = 50): Promise<AuditLogEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "audit_logs"
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('AuditLogRepository.findByWorkspaceId error:', error.message);
      return [];
    }
  }

  // ─── count ───────────────────────────────────────────────────────────────────

  async count(filters?: {
    userId?: string;
    workspaceId?: string;
    action?: string;
  }): Promise<number> {
    try {
      let result: any[];

      if (filters?.workspaceId && filters?.userId) {
        result = await prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM "audit_logs"
          WHERE workspace_id = ${filters.workspaceId}
            AND user_id = ${filters.userId}
        `;
      } else if (filters?.workspaceId) {
        result = await prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM "audit_logs"
          WHERE workspace_id = ${filters.workspaceId}
        `;
      } else if (filters?.userId) {
        result = await prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM "audit_logs"
          WHERE user_id = ${filters.userId}
        `;
      } else {
        result = await prisma.$queryRaw<any[]>`
          SELECT COUNT(*) as count FROM "audit_logs"
        `;
      }

      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }

  // ─── mapper ──────────────────────────────────────────────────────────────────

  private _map(row: any): AuditLogEntity {
    return AuditLogEntity.reconstitute({
      id:          row.id,
      workspaceId: row.workspace_id ?? null,
      userId:      row.user_id      ?? null,
      ipAddress:   row.ip_address   ?? null,
      userAgent:   row.user_agent   ?? null,
      action:      row.action,
      entity:      row.entity       ?? null,
      entityId:    row.entity_id    ?? null,
      oldValues:   row.old_values   ?? null,
      newValues:   row.new_values   ?? null,
      metadata:    row.metadata     ?? null,
      createdAt:   row.created_at,
    });
  }
}
