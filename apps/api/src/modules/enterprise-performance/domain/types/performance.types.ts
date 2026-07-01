export interface BatchOperation<TInput, TOutput> {
  items: TInput[];
  batchSize: number;
  concurrency: number;
  onProgress?: (completed: number, total: number) => void;
}

export interface BatchResult<TOutput> {
  results: TOutput[];
  errors: Array<{ index: number; error: string }>;
  totalTime: number;
  completedCount: number;
  failedCount: number;
}

export interface StreamOptions {
  chunkSize: number;
  highWaterMark: number;
  objectMode: boolean;
}

export interface CompressionOptions {
  algorithm: 'gzip' | 'brotli' | 'deflate';
  level: number;
  threshold: number;
}

export interface MemoryProfile {
  heapUsed: number;
  heapTotal: number;
  external: number;
  arrayBuffers: number;
  rss: number;
}

export interface QueryOptimizationHint {
  useIndex?: string;
  useCache?: boolean;
  timeout?: number;
  maxRows?: number;
}
