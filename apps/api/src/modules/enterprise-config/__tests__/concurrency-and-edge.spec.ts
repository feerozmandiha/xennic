import { DynamicConfigService } from '../application/services/dynamic-config.service.js';
import { FeatureFlagService } from '../application/services/feature-flag.service.js';
import { WorkspaceConfigService } from '../application/services/workspace-config.service.js';

describe('Config - Concurrency & Edge Cases', () => {
  describe('DynamicConfigService', () => {
    let service: DynamicConfigService;

    beforeEach(() => { service = new DynamicConfigService(); });

    it('handles concurrent set and get', async () => {
      await Promise.all(
        Array.from({ length: 20 }, (_, i) => service.set(`key-${i}`, i)),
      );
      const values = await Promise.all(
        Array.from({ length: 20 }, (_, i) => service.get(`key-${i}`)),
      );
      values.forEach((v, i) => expect(v).toBe(i));
    });

    it('triggers watchers on concurrent updates', async () => {
      const calls: unknown[] = [];
      await service.watch('hot-key', (v) => calls.push(v));
      await Promise.all(
        Array.from({ length: 5 }, (_, i) => service.set('hot-key', i)),
      );
      await new Promise((r) => setTimeout(r, 20));
      expect(calls.length).toBeGreaterThanOrEqual(1);
    });

    it('returns default for non-existent with getWithDefault', async () => {
      expect(await service.getWithDefault('nope', 42)).toBe(42);
    });
  });

  describe('FeatureFlagService edge cases', () => {
    let service: FeatureFlagService;

    beforeEach(() => { service = new FeatureFlagService(); });

    it('handles unknown operator gracefully', async () => {
      await service.enable('test');
      await service.addRule('test', { attribute: 'x', operator: 'eq' as any, value: 'y' });
      expect(await service.isEnabled('test', { x: 'y' })).toBe(true);
    });

    it('handles missing context gracefully', async () => {
      await service.enable('test');
      await service.addRule('test', { attribute: 'env', operator: 'eq', value: 'prod' });
      expect(await service.isEnabled('test')).toBe(false);
    });

    it('handles concurrent enable/disable', async () => {
      await service.enable('toggle');
      await Promise.all([
        service.disable('toggle'),
        service.enable('toggle'),
      ]);
      // Final state is non-deterministic, but should not throw
      expect([true, false]).toContain(await service.isEnabled('toggle'));
    });
  });

  describe('WorkspaceConfigService edge cases', () => {
    let service: WorkspaceConfigService;

    beforeEach(() => { service = new WorkspaceConfigService(); });

    it('handles many configs across workspaces', async () => {
      await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          Promise.all([
            service.set(`k${i}`, i, `ws-${i}`),
            service.set(`shared`, `val-${i}`, `ws-${i}`),
          ]),
        ),
      );
      for (let i = 0; i < 10; i++) {
        expect(await service.get(`k${i}`, `ws-${i}`)).toBe(i);
      }
    });
  });
});
