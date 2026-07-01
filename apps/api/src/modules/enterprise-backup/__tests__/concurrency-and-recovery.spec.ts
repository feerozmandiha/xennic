import { BackupManagerService } from '../application/services/backup-manager.service.js';
import { BackupType, BackupTarget, BackupStatus } from '../domain/types/backup.types.js';

describe('Backup - Concurrency & Recovery', () => {
  let service: BackupManagerService;

  beforeEach(() => { service = new BackupManagerService(); });

  it('handles many concurrent backup creations', async () => {
    const ids = await Promise.all(
      Array.from({ length: 10 }, (_, i) =>
        service.create(
          i % 2 === 0 ? BackupType.FULL : BackupType.INCREMENTAL,
          BackupTarget.BOTH,
          { tag: `backup-${i}` },
        ),
      ),
    );
    expect(ids).toHaveLength(10);
    ids.forEach((id) => expect(id).toBeDefined());
  });

  it('handles concurrent cancel and status checks', async () => {
    const id = await service.create(BackupType.FULL, BackupTarget.DATABASE);
    await Promise.all([
      service.cancel(id).catch(() => {}),
      service.getStatus(id),
      service.getStatus(id),
    ]);
    const backup = await service.getStatus(id);
    expect(backup).not.toBeNull();
  });

  it('handles create then immediate list', async () => {
    const id = await service.create(BackupType.FULL, BackupTarget.BOTH, {}, 'ws-list');
    const result = await service.list({});
    const match = result.items.find((b) => b.id === id);
    expect(match).toBeDefined();
  });

  it('handles empty list', async () => {
    const result = await service.list({});
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
  });
});
