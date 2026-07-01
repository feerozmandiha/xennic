import { FeatureFlagService } from '../application/services/feature-flag.service.js';
import type { FeatureFlagRule } from '../domain/types/config.types.js';

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  beforeEach(() => {
    service = new FeatureFlagService();
  });

  it('enables and checks a flag', async () => {
    await service.enable('new-dashboard');
    expect(await service.isEnabled('new-dashboard')).toBe(true);
  });

  it('disables a flag', async () => {
    await service.enable('flag');
    await service.disable('flag');
    expect(await service.isEnabled('flag')).toBe(false);
  });

  it('returns false for unregistered flag', async () => {
    expect(await service.isEnabled('nonexistent')).toBe(false);
  });

  it('evaluates context rules - eq', async () => {
    await service.enable('beta');
    await service.addRule('beta', { attribute: 'workspaceId', operator: 'eq', value: 'ws-42' });
    expect(await service.isEnabled('beta', { workspaceId: 'ws-42' })).toBe(true);
    expect(await service.isEnabled('beta', { workspaceId: 'other' })).toBe(false);
  });

  it('evaluates context rules - in', async () => {
    await service.enable('preview');
    await service.addRule('preview', { attribute: 'userId', operator: 'in', value: ['u1', 'u2'] });
    expect(await service.isEnabled('preview', { userId: 'u1' })).toBe(true);
    expect(await service.isEnabled('preview', { userId: 'u3' })).toBe(false);
  });

  it('evaluates context rules - gt', async () => {
    await service.enable('tier');
    await service.addRule('tier', { attribute: 'tier', operator: 'gt', value: 2 });
    expect(await service.isEnabled('tier', { tier: 3 })).toBe(true);
    expect(await service.isEnabled('tier', { tier: 1 })).toBe(false);
  });

  it('evaluates context rules - lt', async () => {
    await service.enable('early');
    await service.addRule('early', { attribute: 'age', operator: 'lt', value: 30 });
    expect(await service.isEnabled('early', { age: 25 })).toBe(true);
    expect(await service.isEnabled('early', { age: 35 })).toBe(false);
  });

  it('evaluates context rules - contains', async () => {
    await service.enable('country');
    await service.addRule('country', { attribute: 'region', operator: 'contains', value: 'US' });
    expect(await service.isEnabled('country', { region: 'US-EAST' })).toBe(true);
    expect(await service.isEnabled('country', { region: 'EU-WEST' })).toBe(false);
  });

  it('evaluates context rules - neq', async () => {
    await service.enable('not-test');
    await service.addRule('not-test', { attribute: 'env', operator: 'neq', value: 'test' });
    expect(await service.isEnabled('not-test', { env: 'production' })).toBe(true);
    expect(await service.isEnabled('not-test', { env: 'test' })).toBe(false);
  });

  it('evaluates context rules - nin', async () => {
    await service.enable('exclude');
    await service.addRule('exclude', { attribute: 'userId', operator: 'nin', value: ['blocked-1', 'blocked-2'] });
    expect(await service.isEnabled('exclude', { userId: 'allowed' })).toBe(true);
    expect(await service.isEnabled('exclude', { userId: 'blocked-1' })).toBe(false);
  });

  it('removes a rule', async () => {
    await service.enable('test');
    await service.addRule('test', { attribute: 'env', operator: 'eq', value: 'dev' });
    await service.addRule('test', { attribute: 'env', operator: 'eq', value: 'staging' });
    await service.removeRule('test', 0);
    expect(await service.isEnabled('test', { env: 'dev' })).toBe(false);
    expect(await service.isEnabled('test', { env: 'staging' })).toBe(true);
  });

  it('throws on remove rule for unknown flag', async () => {
    await expect(service.removeRule('unknown', 0)).rejects.toThrow('Feature flag not found');
  });

  it('throws on add rule for unknown flag', async () => {
    await expect(service.addRule('unknown', { attribute: 'x', operator: 'eq', value: 'y' })).rejects.toThrow('Feature flag not found');
  });

  it('lists all flags', async () => {
    await service.enable('flag-a');
    await service.enable('flag-b');
    const flags = await service.list();
    expect(flags.length).toBeGreaterThanOrEqual(2);
  });

  it('returns false when flag disabled even with matching rules', async () => {
    // Disabled flag with a rule that would match
    const flag = { key: 'disabled-but-matches', enabled: false, rules: [{ attribute: 'env', operator: 'eq' as const, value: 'prod' }] };
    await (service as any).flags.set('disabled-but-matches', flag);
    expect(await service.isEnabled('disabled-but-matches', { env: 'prod' })).toBe(false);
  });
});
