import { Injectable, Logger } from '@nestjs/common';
import type { IBatchProcessor } from '../../domain/interfaces/performance-interfaces.js';
import type { BatchOperation, BatchResult } from '../../domain/types/performance.types.js';

@Injectable()
export class BatchProcessorService implements IBatchProcessor {
  private readonly logger = new Logger(BatchProcessorService.name);

  async process<TInput, TOutput>(operation: BatchOperation<TInput, TOutput>, fn: (item: TInput) => Promise<TOutput>): Promise<BatchResult<TOutput>> {
    const results: TOutput[] = [];
    const errors: Array<{ index: number; error: string }> = [];
    const startedAt = Date.now();
    let completed = 0;

    for (let i = 0; i < operation.items.length; i += operation.batchSize) {
      const batch = operation.items.slice(i, i + operation.batchSize);
      const batchPromises = batch.map((item) => fn(item).catch((err) => { throw err; }));
      const settled = await Promise.allSettled(batchPromises);
      for (const result of settled) {
        if (result.status === 'fulfilled') { results.push(result.value); completed++; }
        else { errors.push({ index: i + completed, error: result.reason?.message ?? String(result.reason) }); }
      }
      operation.onProgress?.(completed, operation.items.length);
    }

    return {
      results, errors, totalTime: Date.now() - startedAt,
      completedCount: completed, failedCount: errors.length,
    };
  }

  async map<TInput, TOutput>(items: TInput[], fn: (item: TInput) => Promise<TOutput>, concurrency = 4): Promise<TOutput[]> {
    const results: TOutput[] = [];
    const chunks = this.chunk(items, concurrency);
    for (const chunk of chunks) {
      const batch = await Promise.all(chunk.map(fn));
      results.push(...batch);
    }
    return results;
  }

  chunk<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
    return chunks;
  }
}
