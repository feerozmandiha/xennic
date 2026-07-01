import { Logger } from '@nestjs/common';
import type { CacheEntry, CacheStats } from '../../domain/types/cache.types.js';
import { CacheStrategy } from '../../domain/types/cache.types.js';

export abstract class BaseCacheService {
  protected abstract readonly namespace: string;
  protected readonly logger = new Logger(BaseCacheService.name);
  protected _store = new Map<string, CacheEntry>();
  protected hits = 0;
  protected misses = 0;

  async get<T>(key: string): Promise<T | null> {
    const entry = this._store.get(this.prefix(key));
    if (!entry) { this.misses++; return null; }
    if (Date.now() > entry.expiresAt) { this._store.delete(this.prefix(key)); this.misses++; return null; }
    entry.hits++;
    this.hits++;
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttl = 300): Promise<void> {
    const now = Date.now();
    this._store.set(this.prefix(key), {
      key: this.prefix(key), value, ttl, createdAt: now, expiresAt: now + ttl * 1000, hits: 0,
      size: JSON.stringify(value).length,
    });
  }

  async del(key: string): Promise<void> {
    this._store.delete(this.prefix(key));
  }

  async clear(): Promise<void> {
    this._store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  async stats(): Promise<CacheStats> {
    const total = this.hits + this.misses;
    return {
      hits: this.hits, misses: this.misses, size: this._store.size,
      hitRate: total > 0 ? this.hits / total : 0,
      memoryUsage: Array.from(this._store.values()).reduce((s, e) => s + e.size, 0),
    };
  }

  protected prefix(key: string): string {
    return `${this.namespace}:${key}`;
  }
}
