import { BackupManagerService } from '../application/services/backup-manager.service.js';
import { BackupType, BackupTarget, BackupStatus } from '../domain/types/backup.types.js';

describe('BackupManagerService', () => {
  let service: BackupManagerService;

  beforeEach(() => {
    service = new BackupManagerService();
  });

  it('creates a backup and returns id', async () => {
    const id = await service.create(BackupType.FULL, BackupTarget.BOTH);
    expect(id).toBeDefined();
  });

  it('returns status for backup', async () => {
    const id = await service.create(BackupType.FULL, BackupTarget.DATABASE);
    const backup = await service.getStatus(id);
    expect(backup).not.toBeNull();
    expect(backup!.id).toBe(id);
    expect(backup!.type).toBe(BackupType.FULL);
  });

  it('returns null for unknown backup', async () => {
    expect(await service.getStatus('unknown')).toBeNull();
  });

  it('completes backup asynchronously', async () => {
    const id = await service.create(BackupType.INCREMENTAL, BackupTarget.FILES);
    // Initially running
    let backup = await service.getStatus(id);
    expect(backup!.status).toBe(BackupStatus.RUNNING);
    // Wait for completion
    await new Promise((r) => setTimeout(r, 300));
    backup = await service.getStatus(id);
    expect(backup!.status).toBe(BackupStatus.COMPLETED);
    expect(backup!.size).toBeGreaterThan(0);
    expect(backup!.checksum).toBeDefined();
  });

  it('lists backups', async () => {
    await service.create(BackupType.FULL, BackupTarget.DATABASE, {}, 'ws-1');
    await service.create(BackupType.INCREMENTAL, BackupTarget.FILES, {}, 'ws-1');
    const result = await service.list({});
    expect(result.total).toBe(2);
  });

  it('lists backups with type filter', async () => {
    await service.create(BackupType.FULL, BackupTarget.BOTH);
    await service.create(BackupType.DIFFERENTIAL, BackupTarget.DATABASE);
    const result = await service.list({ type: BackupType.FULL });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].type).toBe(BackupType.FULL);
  });

  it('cancels a running backup', async () => {
    const id = await service.create(BackupType.FULL, BackupTarget.BOTH);
    await service.cancel(id);
    const backup = await service.getStatus(id);
    expect(backup!.status).toBe(BackupStatus.FAILED);
  });

  it('throws on cancel for unknown backup', async () => {
    await expect(service.cancel('unknown')).rejects.toThrow('Backup not found');
  });

  it('paginates list results', async () => {
    for (let i = 0; i < 5; i++) await service.create(BackupType.FULL, BackupTarget.BOTH);
    const result = await service.list({ page: 1, limit: 2 });
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(5);
  });
});
