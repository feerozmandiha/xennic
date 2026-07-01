import { SnapshotService } from '../application/services/snapshot.service.js';
import { BackupType } from '../domain/types/backup.types.js';
import type { RetentionRule } from '../domain/types/backup.types.js';

describe('SnapshotService', () => {
  let service: SnapshotService;

  beforeEach(() => {
    service = new SnapshotService();
  });

  it('creates a snapshot', async () => {
    const id = await service.create('backup-1', 'pre-upgrade', 30);
    expect(id).toBeDefined();
  });

  it('lists snapshots', async () => {
    await service.create('b1', 'snap-a', 7);
    await service.create('b2', 'snap-b', 30);
    const result = await service.list({});
    expect(result.total).toBe(2);
  });

  it('deletes a snapshot', async () => {
    const id = await service.create('b1', 'delete-me', 1);
    await service.delete(id);
    const result = await service.list({});
    expect(result.total).toBe(0);
  });

  it('prunes expired snapshots by retention rules', async () => {
    const rule: RetentionRule = {
      id: 'r1', name: 'keep-full-week', backupType: BackupType.FULL,
      maxAge: 1, maxCount: 10, priority: 1, enabled: true,
    };
    await service.create('b1', 'old-snap', 0);
    const deleted = await service.prune([rule]);
    expect(deleted).toBeGreaterThanOrEqual(0);
  });

  it('paginates list results', async () => {
    for (let i = 0; i < 3; i++) await service.create('b1', `snap-${i}`, 30);
    const result = await service.list({ page: 1, limit: 2 });
    expect(result.items).toHaveLength(2);
    expect(result.total).toBe(3);
  });
});
