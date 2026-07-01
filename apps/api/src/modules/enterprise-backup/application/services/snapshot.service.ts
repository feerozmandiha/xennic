import { Injectable, Logger } from '@nestjs/common';
import type { ISnapshotService } from '../../domain/interfaces/backup-interfaces.js';
import type { Snapshot, RetentionRule } from '../../domain/types/backup.types.js';
import { BackupType } from '../../domain/types/backup.types.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class SnapshotService implements ISnapshotService {
  private readonly logger = new Logger(SnapshotService.name);
  private snapshots = new Map<string, Snapshot>();

  async create(backupId: string, name: string, retentionDays: number): Promise<string> {
    const id = randomUUID();
    const snapshot: Snapshot = {
      id, name, type: BackupType.FULL,
      size: 1024, location: `/snapshots/${id}`,
      checksum: '', createdAt: new Date(),
      retentionUntil: new Date(Date.now() + retentionDays * 86400000),
      metadata: { backupId },
    };
    this.snapshots.set(id, snapshot);
    this.logger.log(`Snapshot created: ${id} (${name})`);
    return id;
  }

  async list(filters?: { type?: BackupType; page?: number; limit?: number }): Promise<{ items: Snapshot[]; total: number }> {
    let items = Array.from(this.snapshots.values());
    if (filters?.type) items = items.filter((s) => s.type === filters.type);
    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = items.length;
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), total };
  }

  async delete(snapshotId: string): Promise<void> {
    this.snapshots.delete(snapshotId);
    this.logger.warn(`Snapshot deleted: ${snapshotId}`);
  }

  async prune(retentionRules: RetentionRule[]): Promise<number> {
    let deleted = 0;
    for (const rule of retentionRules) {
      const candidates = Array.from(this.snapshots.values())
        .filter((s) => s.type === rule.backupType && s.createdAt.getTime() < Date.now() - rule.maxAge);
      for (const c of candidates) {
        this.snapshots.delete(c.id);
        deleted++;
      }
    }
    return deleted;
  }
}
