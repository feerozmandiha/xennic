import { BaseCacheService } from '../application/services/base-cache.service.js';

class ConcurrencyTestCache extends BaseCacheService {
  protected namespace = 'concurrency-test';
}

describe('Cache - Concurrency, TTL & Edge Cases', () => {
  let service: ConcurrencyTestCache;

  beforeEach(() => { service = new ConcurrencyTestCache(); });

  it('handles concurrent sets and gets', async () => {
    const writers = Array.from({ length: 20 }, (_, i) => service.set(`k${i}`, `v${i}`));
    await Promise.all(writers);
    const readers = Array.from({ length: 20 }, (_, i) => service.get(`k${i}`));
    const results = await Promise.all(readers);
    results.forEach((r, i) => expect(r).toBe(`v${i}`));
  });

  it('handles concurrent read-write contention on same key', async () => {
    const ops = Array.from({ length: 10 }, (_, i) => service.set('contended', `v${i}`));
    await Promise.all(ops);
    const val = await service.get('contended');
    expect(val).toBeDefined();
  });

  it('handles rapid TTL expiry', async () => {
    await service.set('fast-expire', 'x', 0);
    await new Promise((r) => setTimeout(r, 5));
    expect(await service.get('fast-expire')).toBeNull();
  });

  it('handles large JSON values', async () => {
    const big = { data: 'x'.repeat(50000), nested: { arr: Array.from({ length: 1000 }, (_, i) => i) } };
    await service.set('big', big);
    const retrieved = await service.get<typeof big>('big');
    expect(retrieved!.data).toHaveLength(50000);
    expect(retrieved!.nested.arr).toHaveLength(1000);
  });

  it('handles delete of non-existent key', async () => {
    await expect(service.del('nonexistent')).resolves.not.toThrow();
  });

  it('handles clear with empty store', async () => {
    await expect(service.clear()).resolves.not.toThrow();
  });

  it('stats are consistent after many operations', async () => {
    for (let i = 0; i < 100; i++) {
      await service.set(`k${i}`, i);
      if (i % 2 === 0) await service.get(`k${i}`);
      else await service.get(`missing-${i}`);
    }
    const stats = await service.stats();
    expect(stats.hits + stats.misses).toBe(100);
    expect(stats.size).toBe(100);
    expect(stats.hitRate).toBeCloseTo(0.5, 1);
  });

  it('overwrites with different value type', async () => {
    await service.set('poly', 'string');
    await service.set('poly', 42);
    expect(await service.get('poly')).toBe(42);
    await service.set('poly', { obj: true });
    expect(await service.get('poly')).toEqual({ obj: true });
  });

  it('handles null values', async () => {
    await service.set('null-key', null);
    const val = await service.get('null-key');
    expect(val).toBeNull();
  });

  it('uses correct prefix isolation', async () => {
    class CacheA extends BaseCacheService { protected namespace = 'a'; }
    class CacheB extends BaseCacheService { protected namespace = 'b'; }
    const a = new CacheA();
    const b = new CacheB();
    await a.set('key', 'from-a');
    await b.set('key', 'from-b');
    expect(await a.get('key')).toBe('from-a');
    expect(await b.get('key')).toBe('from-b');
  });
});
