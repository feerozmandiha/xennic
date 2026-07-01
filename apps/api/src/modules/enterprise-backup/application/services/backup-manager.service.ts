import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IBackupManager } from '../../domain/interfaces/backup-interfaces.js';
import type { Backup } from '../../domain/types/backup.types.js';
import { BackupStatus, BackupType, BackupTarget } from '../../domain/types/backup.types.js';

@Injectable()
export class BackupManagerService implements IBackupManager {
  private readonly logger = new Logger(BackupManagerService.name);
  private backups = new Map<string, Backup>();

  async create(type: BackupType, target: BackupTarget, metadata?: Record<string, unknown>, workspaceId?: string): Promise<string> {
    const id = randomUUID();
    const backup: Backup = {
      id, type, target, status: BackupStatus.RUNNING,
      size: 0, location: `/backups/${workspaceId ?? 'default'}/${id}`,
      checksum: '', startedAt: new Date(),
      metadata: metadata ?? {}, retentionDays: 90, workspaceId,
    };
    this.backups.set(id, backup);
    this.logger.log(`Backup started: ${id} (${type})`);

    void this.simulateBackup(id);
    return id;
  }

  async getStatus(backupId: string): Promise<Backup | null> {
    return this.backups.get(backupId) ?? null;
  }

  async list(filters?: { type?: BackupType; status?: BackupStatus; page?: number; limit?: number }): Promise<{ items: Backup[]; total: number }> {
    let items = Array.from(this.backups.values());
    if (filters?.type) items = items.filter((b) => b.type === filters.type);
    if (filters?.status) items = items.filter((b) => b.status === filters.status);
    items.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
    const total = items.length;
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), total };
  }

  async cancel(backupId: string): Promise<void> {
    const backup = this.backups.get(backupId);
    if (!backup) throw new Error(`Backup not found: ${backupId}`);
    backup.status = BackupStatus.FAILED;
    this.logger.warn(`Backup cancelled: ${backupId}`);
  }

  private async simulateBackup(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 200));
    const backup = this.backups.get(id);
    if (backup && backup.status === BackupStatus.RUNNING) {
      backup.status = BackupStatus.COMPLETED;
      backup.size = Math.floor(Math.random() * 1000000) + 1000;
      backup.checksum = randomUUID().slice(0, 16);
      backup.completedAt = new Date();
    }
  }
}
