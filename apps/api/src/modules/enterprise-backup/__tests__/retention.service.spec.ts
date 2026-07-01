import { RetentionService } from '../application/services/retention.service.js';
import { BackupType } from '../domain/types/backup.types.js';
import type { RetentionRule } from '../domain/types/backup.types.js';

describe('RetentionService', () => {
  let service: RetentionService;

  beforeEach(() => {
    service = new RetentionService();
  });

  it('sets a retention rule', async () => {
    const id = await service.setRule({
      name: 'daily-full', backupType: BackupType.FULL,
      maxAge: 86400000, maxCount: 7, priority: 1, enabled: true,
    });
    expect(id).toBeDefined();
  });

  it('lists retention rules', async () => {
    await service.setRule({
      name: 'r1', backupType: BackupType.FULL,
      maxAge: 1, maxCount: 1, priority: 1, enabled: true,
    });
    const rules = await service.getRules();
    expect(rules).toHaveLength(1);
  });

  it('deletes a retention rule', async () => {
    const id = await service.setRule({
      name: 'temp', backupType: BackupType.INCREMENTAL,
      maxAge: 1, maxCount: 1, priority: 0, enabled: true,
    });
    await service.deleteRule(id);
    expect(await service.getRules()).toHaveLength(0);
  });

  it('applies retention and returns stats', async () => {
    const result = await service.apply();
    expect(result).toEqual({ deleted: 0, freed: 0 });
  });
});
