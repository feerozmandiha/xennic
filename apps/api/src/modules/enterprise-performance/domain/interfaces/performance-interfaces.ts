import type { BatchOperation, BatchResult, StreamOptions, CompressionOptions, MemoryProfile, QueryOptimizationHint } from '../types/performance.types.js';

export interface IBatchProcessor {
  process<TInput, TOutput>(operation: BatchOperation<TInput, TOutput>, fn: (item: TInput) => Promise<TOutput>): Promise<BatchResult<TOutput>>;
  map<TInput, TOutput>(items: TInput[], fn: (item: TInput) => Promise<TOutput>, concurrency?: number): Promise<TOutput[]>;
  chunk<T>(array: T[], size: number): T[][];
}

export interface ILazyLoader {
  load<T>(id: string, loader: () => Promise<T>, ttl?: number): Promise<T>;
  preload<T>(ids: string[], loader: (id: string) => Promise<T>): Promise<void>;
  invalidate(id: string): void;
  clear(): void;
}

export interface IQueryOptimizer {
  optimize(query: string, hints?: QueryOptimizationHint): string;
  explain(query: string): Promise<Record<string, unknown>>;
  suggestIndex(query: string): Promise<string[]>;
}
