import { LazyLoaderService } from '../application/services/lazy-loader.service.js';

describe('LazyLoaderService', () => {
  let service: LazyLoaderService;

  beforeEach(() => {
    service = new LazyLoaderService();
  });

  it('loads data using loader function', async () => {
    const result = await service.load('item-1', async () => 'loaded-data');
    expect(result).toBe('loaded-data');
  });

  it('caches data with TTL', async () => {
    let callCount = 0;
    const loader = async () => { callCount++; return `data-${callCount}`; };
    const r1 = await service.load('cached', loader, 60);
    const r2 = await service.load('cached', loader, 60);
    expect(r1).toBe('data-1');
    expect(r2).toBe('data-1');
    expect(callCount).toBe(1);
  });

  it('does not cache without TTL', async () => {
    let callCount = 0;
    const loader = async () => { callCount++; return callCount; };
    await service.load('nocache', loader);
    await service.load('nocache', loader);
    expect(callCount).toBe(2);
  });

  it('preloads multiple items', async () => {
    const loaded = new Set<string>();
    await service.preload(['a', 'b', 'c'], async (id) => { loaded.add(id); return id; });
    expect(loaded).toEqual(new Set(['a', 'b', 'c']));
  });

  it('invalidates a cached item', async () => {
    let callCount = 0;
    const loader = async () => { callCount++; return callCount; };
    await service.load('invalidated', loader, 60);
    service.invalidate('invalidated');
    await service.load('invalidated', loader, 60);
    expect(callCount).toBe(2);
  });

  it('clears all cached items', async () => {
    await service.load('a', async () => '1', 60);
    await service.load('b', async () => '2', 60);
    service.clear();
    // After clear, loader should be called again
    let callCount = 0;
    await service.load('a', async () => { callCount++; return 'fresh'; }, 60);
    expect(callCount).toBe(1);
  });

  it('expires items after TTL', async () => {
    await service.load('expires', async () => 'old', 0); // 0 TTL = instant expiry in our implementation
    // Actually with TTL=0, the load function doesn't cache (expiresAt = Date.now() + 0)
    await new Promise((r) => setTimeout(r, 5));
    const val = await service.load('expires', async () => 'fresh', 0);
    expect(val).toBe('fresh');
  });
});
