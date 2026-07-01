import { DynamicConfigService } from '../application/services/dynamic-config.service.js';

describe('DynamicConfigService', () => {
  let service: DynamicConfigService;

  beforeEach(() => {
    service = new DynamicConfigService();
  });

  it('sets and gets a config override', async () => {
    await service.set('feature.x', true);
    const val = await service.get('feature.x');
    expect(val).toBe(true);
  });

  it('returns null for unknown key', async () => {
    expect(await service.get('unknown')).toBeNull();
  });

  it('returns default when key not found', async () => {
    const val = await service.getWithDefault('missing', 'fallback');
    expect(val).toBe('fallback');
  });

  it('returns actual value over default', async () => {
    await service.set('timeout', 5000);
    const val = await service.getWithDefault('timeout', 1000);
    expect(val).toBe(5000);
  });

  it('deletes a key', async () => {
    await service.set('temp', 'data');
    await service.delete('temp');
    expect(await service.get('temp')).toBeNull();
  });

  it('watches a key and triggers callback', async () => {
    const changes: unknown[] = [];
    await service.watch('watched-key', (v) => changes.push(v));
    await service.set('watched-key', 'new-value');
    // Small delay for async watcher execution
    await new Promise((r) => setTimeout(r, 10));
    expect(changes).toContain('new-value');
  });

  it('lists entries with tags', async () => {
    await service.set('a', 1);
    const entries = await service.list(['production']);
    expect(entries.length).toBeGreaterThanOrEqual(1);
    expect(entries[0].tags).toContain('production');
  });
});
