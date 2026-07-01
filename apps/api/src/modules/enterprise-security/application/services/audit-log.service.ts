import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IAuditLogService } from '../../domain/interfaces/security-interfaces.js';
import type { AuditLogEntry, AuditLogQuery } from '../../domain/types/security.types.js';

@Injectable()
export class AuditLogService implements IAuditLogService {
  private readonly logger = new Logger(AuditLogService.name);
  private logs: AuditLogEntry[] = [];

  async record(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<void> {
    const log: AuditLogEntry = {
      ...entry,
      id: randomUUID(),
      timestamp: new Date(),
    };
    this.logs.push(log);
    if (entry.severity === 'critical' || entry.severity === 'error') {
      this.logger.warn(`Audit: [${entry.severity}] ${entry.action} by ${entry.actorId} on ${entry.resourceType}:${entry.resourceId}`);
    }
  }

  async query(query: AuditLogQuery): Promise<{ items: AuditLogEntry[]; total: number }> {
    let filtered = [...this.logs];
    if (query.actorId) filtered = filtered.filter((l) => l.actorId === query.actorId);
    if (query.resourceType) filtered = filtered.filter((l) => l.resourceType === query.resourceType);
    if (query.resourceId) filtered = filtered.filter((l) => l.resourceId === query.resourceId);
    if (query.action) filtered = filtered.filter((l) => l.action === query.action);
    if (query.severity) filtered = filtered.filter((l) => l.severity === query.severity);
    if (query.workspaceId) filtered = filtered.filter((l) => l.workspaceId === query.workspaceId);
    if (query.fromDate) filtered = filtered.filter((l) => l.timestamp >= query.fromDate!);
    if (query.toDate) filtered = filtered.filter((l) => l.timestamp <= query.toDate!);
    const total = filtered.length;
    const start = (query.page - 1) * query.limit;
    return { items: filtered.slice(start, start + query.limit), total };
  }

  async getById(id: string): Promise<AuditLogEntry | null> {
    return this.logs.find((l) => l.id === id) ?? null;
  }

  async export(workspaceId: string, fromDate: Date, toDate: Date): Promise<AuditLogEntry[]> {
    return this.logs.filter(
      (l) => l.workspaceId === workspaceId && l.timestamp >= fromDate && l.timestamp <= toDate,
    );
  }
}
