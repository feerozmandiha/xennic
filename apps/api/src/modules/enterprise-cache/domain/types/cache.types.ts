export enum CacheStrategy {
  LRU = 'lru',
  TTL = 'ttl',
  LFU = 'lfu',
}

export interface CacheOptions {
  ttl: number;
  strategy: CacheStrategy;
  maxSize: number;
  namespace: string;
}

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  ttl: number;
  createdAt: number;
  expiresAt: number;
  hits: number;
  size: number;
}

export interface SemanticCacheEntry {
  query: string;
  embedding: number[];
  result: unknown;
  similarity: number;
  ttl: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  hitRate: number;
  memoryUsage: number;
}

export interface EmbeddingCacheEntry {
  text: string;
  model: string;
  embedding: number[];
  dimensions: number;
}

export interface QueryCacheEntry {
  query: string;
  result: unknown;
  hash: string;
  ttl: number;
}

export interface OntologyCacheEntry {
  concept: string;
  relationships: string[];
  lastAccessed: number;
}

export interface MetadataCacheEntry {
  entityId: string;
  entityType: string;
  metadata: Record<string, unknown>;
  ttl: number;
}

export interface ResponseCacheEntry {
  requestHash: string;
  response: unknown;
  statusCode: number;
  headers: Record<string, string>;
  ttl: number;
}
