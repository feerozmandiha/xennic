import { Injectable, Logger } from '@nestjs/common';
import type { IRestoreService } from '../../domain/interfaces/backup-interfaces.js';
import type { RestorePoint } from '../../domain/types/backup.types.js';
import { BackupStatus, BackupTarget } from '../../domain/types/backup.types.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RestoreService implements IRestoreService {
  private readonly logger = new Logger(RestoreService.name);
  private restorePoints = new Map<string, RestorePoint>();

  async restore(backupId: string, target?: BackupTarget): Promise<string> {
    const id = randomUUID();
    const point: RestorePoint = {
      id, backupId, status: BackupStatus.RUNNING,
      target: target ?? BackupTarget.DATABASE, startedAt: new Date(),
    };
    this.restorePoints.set(id, point);
    this.logger.log(`Restore started: ${id} (backup: ${backupId})`);

    void this.simulateRestore(id);
    return id;
  }

  async getStatus(restoreId: string): Promise<RestorePoint | null> {
    return this.restorePoints.get(restoreId) ?? null;
  }

  async cancel(restoreId: string): Promise<void> {
    const point = this.restorePoints.get(restoreId);
    if (!point) throw new Error(`Restore not found: ${restoreId}`);
    point.status = BackupStatus.FAILED;
  }

  private async simulateRestore(id: string): Promise<void> {
    await new Promise((r) => setTimeout(r, 100));
    const point = this.restorePoints.get(id);
    if (point && point.status === BackupStatus.RUNNING) {
      point.status = BackupStatus.COMPLETED;
      point.completedAt = new Date();
    }
  }
}
