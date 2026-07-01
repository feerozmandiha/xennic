import { RestoreService } from '../application/services/restore.service.js';
import { BackupTarget, BackupStatus } from '../domain/types/backup.types.js';

describe('RestoreService', () => {
  let service: RestoreService;

  beforeEach(() => {
    service = new RestoreService();
  });

  it('starts a restore and returns id', async () => {
    const id = await service.restore('backup-1');
    expect(id).toBeDefined();
  });

  it('returns restore status', async () => {
    const id = await service.restore('backup-2');
    const status = await service.getStatus(id);
    expect(status).not.toBeNull();
    expect(status!.backupId).toBe('backup-2');
    expect(status!.status).toBe(BackupStatus.RUNNING);
  });

  it('returns null for unknown restore', async () => {
    expect(await service.getStatus('unknown')).toBeNull();
  });

  it('completes restore asynchronously', async () => {
    const id = await service.restore('backup-3');
    await new Promise((r) => setTimeout(r, 200));
    const status = await service.getStatus(id);
    expect(status!.status).toBe(BackupStatus.COMPLETED);
  });

  it('cancels a restore', async () => {
    const id = await service.restore('backup-4');
    await service.cancel(id);
    expect((await service.getStatus(id))!.status).toBe(BackupStatus.FAILED);
  });

  it('accepts target parameter', async () => {
    const id = await service.restore('backup-5', BackupTarget.FILES);
    expect(id).toBeDefined();
  });
});
