import { BatchProcessorService } from '../application/services/batch-processor.service.js';
import { LazyLoaderService } from '../application/services/lazy-loader.service.js';
import { QueryOptimizerService } from '../application/services/query-optimizer.service.js';

describe('Performance - Concurrency & Stress', () => {
  describe('BatchProcessorService stress', () => {
    let service: BatchProcessorService;

    beforeEach(() => { service = new BatchProcessorService(); });

    it('processes many items', async () => {
      const items = Array.from({ length: 100 }, (_, i) => i);
      const op = { items, batchSize: 10, concurrency: 5 };
      const result = await service.process(op, async (n) => n * 2);
      expect(result.completedCount).toBe(100);
      expect(result.failedCount).toBe(0);
    });

    it('handles high concurrency', async () => {
      const items = Array.from({ length: 50 }, (_, i) => i);
      const op = { items, batchSize: 5, concurrency: 10 };
      const result = await service.process(op, async (n) => `r-${n}`);
      expect(result.results).toHaveLength(50);
    });

    it('recovers from partial failures', async () => {
      const items = Array.from({ length: 10 }, (_, i) => i);
      const op = { items, batchSize: 3, concurrency: 2 };
      const result = await service.process(op, async (n) => {
        if (n % 3 === 0) throw new Error(`err-${n}`);
        return n;
      });
      expect(result.completedCount).toBe(6);
      expect(result.failedCount).toBe(4);
    });

    it('handles chunk edge cases', () => {
      expect(service.chunk([], 5)).toEqual([]);
      expect(service.chunk([1], 5)).toEqual([[1]]);
      expect(service.chunk([1, 2, 3], 2)).toEqual([[1, 2], [3]]);
    });
  });

  describe('LazyLoaderService stress', () => {
    let service: LazyLoaderService;

    beforeEach(() => { service = new LazyLoaderService(); });

    it('handles concurrent loads of same key', async () => {
      let callCount = 0;
      const loader = async () => { callCount++; return 'shared'; };
      const results = await Promise.all(
        Array.from({ length: 10 }, () => service.load('shared-key', loader, 60)),
      );
      results.forEach((r) => expect(r).toBe('shared'));
    });

    it('handles many unique keys', async () => {
      const results = await Promise.all(
        Array.from({ length: 50 }, (_, i) =>
          service.load(`key-${i}`, async () => i, 60),
        ),
      );
      results.forEach((r, i) => expect(r).toBe(i));
    });

    it('clear during concurrent loads', async () => {
      const results = await Promise.all([
        service.load('a', async () => '1', 60),
        service.clear(),
        service.load('b', async () => '2', 60),
      ]);
      expect(results).toContain('1');
      expect(results).toContain('2');
    });
  });

  describe('QueryOptimizerService edge cases', () => {
    let service: QueryOptimizerService;

    beforeEach(() => { service = new QueryOptimizerService(); });

    it('handles complex query with multiple hints', () => {
      const result = service.optimize('SELECT * FROM big_table WHERE status = ?', {
        useIndex: 'idx_status', maxRows: 1000, useCache: false,
      });
      expect(result).toContain('INDEX(idx_status)');
      expect(result).toContain('NO_CACHE');
      expect(result).toContain('LIMIT 1000');
    });

    it('explains query with JOINs', async () => {
      const result = await service.explain('SELECT u.* FROM users u JOIN orders o ON u.id = o.user_id WHERE o.total > 100');
      expect(result.tables).toContain('users');
      expect(result.tables).toContain('orders');
    });

    it('suggests index for query with specific WHERE', async () => {
      const suggestions = await service.suggestIndex('SELECT * FROM products WHERE category = ? AND price > ?');
      expect(suggestions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
