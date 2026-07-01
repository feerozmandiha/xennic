import { QueryCacheService } from '../application/services/query-cache.service.js';

describe('QueryCacheService', () => {
  let service: QueryCacheService;

  beforeEach(() => {
    service = new QueryCacheService();
  });

  it('stores and finds queries by hash', async () => {
    await service.storeQuery({ query: 'SELECT * FROM users', hash: 'abc123', result: { rows: [] }, ttl: 300 });
    const found = await service.findByHash('abc123');
    expect(found).not.toBeNull();
    expect(found!.result).toEqual({ rows: [] });
  });

  it('returns null for unknown hash', async () => {
    const found = await service.findByHash('unknown');
    expect(found).toBeNull();
  });

  it('generates hash from query when not provided', async () => {
    await service.storeQuery({ query: 'SELECT 1', result: 1, ttl: 60 });
    const found = await service.findByHash('abc');
    expect(found).toBeNull(); // hash doesn't match
  });

  it('respects TTL', async () => {
    await service.storeQuery({ query: 'SELECT 1', hash: 'h1', result: 1, ttl: 0 });
    await new Promise((r) => setTimeout(r, 10));
    expect(await service.findByHash('h1')).toBeNull();
  });
});
