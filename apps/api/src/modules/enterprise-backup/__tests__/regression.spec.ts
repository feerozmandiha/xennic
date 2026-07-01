/**
 * Regression tests for backup module
 */
import { BackupManagerService } from '../application/services/backup-manager.service.js';
import { RestoreService } from '../application/services/restore.service.js';
import { RetentionService } from '../application/services/retention.service.js';
import { BackupType, BackupTarget, BackupStatus } from '../domain/types/backup.types.js';

describe('Backup - Regression contracts', () => {
  it('backup create returns string id', async () => {
    const service = new BackupManagerService();
    const id = await service.create(BackupType.FULL, BackupTarget.BOTH);
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('backup status contains required fields', async () => {
    const service = new BackupManagerService();
    const id = await service.create(BackupType.FULL, BackupTarget.DATABASE);
    const backup = await service.getStatus(id);
    expect(backup).toMatchObject({
      id, type: BackupType.FULL, status: expect.any(String),
    });
  });

  it('restore create returns string id', async () => {
    const service = new RestoreService();
    const id = await service.restore('backup-ref');
    expect(typeof id).toBe('string');
  });

  it('retention rule set returns string id', async () => {
    const service = new RetentionService();
    const id = await service.setRule({
      name: 'regression-test', backupType: BackupType.FULL,
      maxAge: 7, maxCount: 5, priority: 0, enabled: true,
    });
    expect(typeof id).toBe('string');
  });
});
