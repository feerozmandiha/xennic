import { BatchProcessorService } from '../application/services/batch-processor.service.js';
import type { BatchOperation } from '../domain/types/performance.types.js';

describe('BatchProcessorService', () => {
  let service: BatchProcessorService;

  beforeEach(() => {
    service = new BatchProcessorService();
  });

  it('processes a batch operation', async () => {
    const op: BatchOperation<number, string> = {
      items: [1, 2, 3], batchSize: 2, concurrency: 2,
    };
    const result = await service.process(op, async (n) => `item-${n}`);
    expect(result.results).toEqual(['item-1', 'item-2', 'item-3']);
    expect(result.completedCount).toBe(3);
    expect(result.failedCount).toBe(0);
  });

  it('reports errors for failing operations', async () => {
    const op: BatchOperation<number, string> = {
      items: [1, 2, 3], batchSize: 1, concurrency: 1,
    };
    const result = await service.process(op, async (n) => {
      if (n === 2) throw new Error('fail');
      return `ok-${n}`;
    });
    expect(result.completedCount).toBe(2);
    expect(result.failedCount).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].error).toBe('fail');
  });

  it('calls progress callback', async () => {
    const progress: number[] = [];
    const op: BatchOperation<number, string> = {
      items: [1, 2, 3, 4], batchSize: 2, concurrency: 2,
      onProgress: (c, t) => progress.push(c),
    };
    await service.process(op, async (n) => `r-${n}`);
    expect(progress.length).toBeGreaterThanOrEqual(1);
    expect(progress[progress.length - 1]).toBe(4);
  });

  it('maps items with concurrency', async () => {
    const results = await service.map([1, 2, 3], async (n) => n * 2, 2);
    expect(results).toEqual([2, 4, 6]);
  });

  it('chunks arrays', () => {
    const chunks = service.chunk([1, 2, 3, 4, 5], 2);
    expect(chunks).toEqual([[1, 2], [3, 4], [5]]);
  });

  it('handles empty operation', async () => {
    const op: BatchOperation<number, string> = {
      items: [], batchSize: 10, concurrency: 1,
    };
    const result = await service.process(op, async (n) => `${n}`);
    expect(result.results).toEqual([]);
    expect(result.completedCount).toBe(0);
    expect(result.failedCount).toBe(0);
  });

  it('reports total time', async () => {
    const op: BatchOperation<number, string> = {
      items: [1], batchSize: 1, concurrency: 1,
    };
    const result = await service.process(op, async (n) => {
      await new Promise((r) => setTimeout(r, 10));
      return `${n}`;
    });
    expect(result.totalTime).toBeGreaterThanOrEqual(10);
  });
});
