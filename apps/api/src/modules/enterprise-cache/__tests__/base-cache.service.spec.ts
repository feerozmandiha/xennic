import { BaseCacheService } from '../application/services/base-cache.service.js';

class TestCache extends BaseCacheService {
  protected namespace = 'test';
}

describe('BaseCacheService', () => {
  let service: TestCache;

  beforeEach(() => {
    service = new TestCache();
  });

  it('sets and gets a value', async () => {
    await service.set('key1', { foo: 'bar' });
    const val = await service.get('key1');
    expect(val).toEqual({ foo: 'bar' });
  });

  it('returns null for missing key', async () => {
    const val = await service.get('nonexistent');
    expect(val).toBeNull();
  });

  it('respects TTL expiry', async () => {
    await service.set('ephemeral', 'value', 0);
    await new Promise((r) => setTimeout(r, 10));
    const val = await service.get('ephemeral');
    expect(val).toBeNull();
  });

  it('deletes a key', async () => {
    await service.set('temp', 'value');
    await service.del('temp');
    expect(await service.get('temp')).toBeNull();
  });

  it('clears all entries', async () => {
    await service.set('a', 1);
    await service.set('b', 2);
    await service.clear();
    expect(await service.get('a')).toBeNull();
    expect(await service.get('b')).toBeNull();
  });

  it('reports stats', async () => {
    await service.set('x', 1);
    await service.get('x');
    await service.get('missing');
    const stats = await service.stats();
    expect(stats.hits).toBe(1);
    expect(stats.misses).toBe(1);
    expect(stats.hitRate).toBe(0.5);
    expect(stats.size).toBe(1);
    expect(stats.memoryUsage).toBeGreaterThan(0);
  });

  it('uses namespaced keys', async () => {
    await service.set('key', 'val');
    expect(await service.get('key')).toBe('val');
  });

  it('handles concurrent set and get', async () => {
    await Promise.all([service.set('c1', 'v1'), service.set('c2', 'v2')]);
    const [r1, r2] = await Promise.all([service.get('c1'), service.get('c2')]);
    expect(r1).toBe('v1');
    expect(r2).toBe('v2');
  });

  it('overwrites existing key', async () => {
    await service.set('key', 'old');
    await service.set('key', 'new');
    expect(await service.get('key')).toBe('new');
  });

  it('resets stats after clear', async () => {
    await service.set('k', 'v');
    await service.get('k');
    await service.clear();
    const stats = await service.stats();
    expect(stats.hits).toBe(0);
    expect(stats.misses).toBe(0);
  });
});
