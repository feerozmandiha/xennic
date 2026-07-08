export const ICACHE_MANAGER = 'ICacheManager' as const;
export const ICACHE_INVALIDATION = 'ICacheInvalidation' as const;

export type CacheNamespace = 'semantic' | 'prompt' | 'embedding' | 'session' | 'memory' | 'config' | 'search';

export interface CacheEntry<T = unknown> {
  key: string;
  value: T;
  namespace: CacheNamespace;
  ttlMs: number;
  createdAt: string;
  expiresAt: string;
  tags: string[];
}

export interface CacheOptions {
  ttlMs?: number;
  tags?: string[];
  skipCache?: boolean;
}

export interface ICacheManager {
  get<T>(namespace: CacheNamespace, key: string): Promise<T | null>;
  set<T>(namespace: CacheNamespace, key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(namespace: CacheNamespace, key: string): Promise<boolean>;
  clear(namespace?: CacheNamespace): Promise<void>;
  getByTag(namespace: CacheNamespace, tag: string): Promise<string[]>;
}

export interface ICacheInvalidation {
  invalidateByTag(namespace: CacheNamespace, tag: string): Promise<number>;
  invalidateByNamespace(namespace: CacheNamespace): Promise<number>;
  invalidateByPattern(namespace: CacheNamespace, pattern: string): Promise<number>;
}
