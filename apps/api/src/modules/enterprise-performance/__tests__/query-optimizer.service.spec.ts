import { QueryOptimizerService } from '../application/services/query-optimizer.service.js';

describe('QueryOptimizerService', () => {
  let service: QueryOptimizerService;

  beforeEach(() => {
    service = new QueryOptimizerService();
  });

  it('optimizes a query with index hint', () => {
    const result = service.optimize('SELECT * FROM users', { useIndex: 'idx_users_email' });
    expect(result).toContain('INDEX(idx_users_email)');
  });

  it('optimizes a query with limit', () => {
    const result = service.optimize('SELECT * FROM logs', { maxRows: 100 });
    expect(result).toContain('LIMIT 100');
  });

  it('optimizes a query with no_cache hint', () => {
    const result = service.optimize('SELECT * FROM cache', { useCache: false });
    expect(result).toContain('NO_CACHE');
  });

  it('returns original query when no hints', () => {
    const result = service.optimize('SELECT 1');
    expect(result).toBe('SELECT 1');
  });

  it('explains a query', async () => {
    const result = await service.explain('SELECT * FROM users WHERE active = true');
    expect(result.query).toBeDefined();
    expect(result.complexity).toBeGreaterThanOrEqual(0);
    expect(result.tables).toContain('users');
  });

  it('suggests indexes for a query', async () => {
    const suggestions = await service.suggestIndex('SELECT * FROM orders WHERE status = ?');
    expect(suggestions.length).toBeGreaterThanOrEqual(1);
    expect(suggestions[0]).toContain('orders');
  });

  it('handles empty query', () => {
    const result = service.optimize('');
    expect(result).toBe('');
  });

  it('handles queries without WHERE clause', async () => {
    const result = await service.explain('SELECT * FROM users');
    expect(result.tables).toContain('users');
  });
});
