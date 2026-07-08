import { Injectable, Logger } from '@nestjs/common';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  version: string;
}

@Injectable()
export class CalculationCacheService {
  private readonly logger = new Logger(CalculationCacheService.name);
  private readonly stores = new Map<string, Map<string, CacheEntry<unknown>>>();
  private readonly DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
  private hits = 0;
  private misses = 0;

  constructor() {
    this.stores.set('formula', new Map());
    this.stores.set('unit', new Map());
    this.stores.set('definition', new Map());
    this.stores.set('ai', new Map());
    this.stores.set('result', new Map());
  }

  get<T>(store: string, key: string): T | null {
    const cache = this.stores.get(store);
    if (!cache) return null;

    const entry = cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      cache.delete(key);
      this.misses++;
      return null;
    }

    this.hits++;
    return entry.value;
  }

  set<T>(store: string, key: string, value: T, ttlMs?: number, version?: string): void {
    const cache = this.stores.get(store);
    if (!cache) return;

    cache.set(key, {
      value,
      expiresAt: Date.now() + (ttlMs ?? this.DEFAULT_TTL_MS),
      version: version ?? '1.0.0',
    });
  }

  invalidate(store: string, key?: string): void {
    const cache = this.stores.get(store);
    if (!cache) return;

    if (key) {
      cache.delete(key);
    } else {
      cache.clear();
    }
  }

  invalidateAll(): void {
    for (const cache of this.stores.values()) {
      cache.clear();
    }
    this.hits = 0;
    this.misses = 0;
  }

  invalidateByVersion(store: string, version: string): number {
    const cache = this.stores.get(store);
    if (!cache) return 0;

    let count = 0;
    for (const [key, entry] of cache.entries()) {
      if (entry.version !== version) {
        cache.delete(key);
        count++;
      }
    }
    return count;
  }

  getCacheSize(store?: string): Record<string, number> {
    if (store) {
      return { [store]: this.stores.get(store)?.size ?? 0 };
    }
    const sizes: Record<string, number> = {};
    for (const [name, cache] of this.stores.entries()) {
      sizes[name] = cache.size;
    }
    return sizes;
  }

  getHitRate(): number {
    const total = this.hits + this.misses;
    return total === 0 ? 0 : this.hits / total;
  }

  getHits(): number { return this.hits; }
  getMisses(): number { return this.misses; }

  // Convenience methods
  getFormula<T>(key: string): T | null { return this.get<T>('formula', key); }
  setFormula<T>(key: string, value: T, ttlMs?: number): void { this.set('formula', key, value, ttlMs); }
  invalidateFormula(key?: string): void { this.invalidate('formula', key); }

  getUnit<T>(key: string): T | null { return this.get<T>('unit', key); }
  setUnit<T>(key: string, value: T, ttlMs?: number): void { this.set('unit', key, value, ttlMs); }
  invalidateUnit(key?: string): void { this.invalidate('unit', key); }

  getDefinition<T>(key: string): T | null { return this.get<T>('definition', key); }
  setDefinition<T>(key: string, value: T, ttlMs?: number): void { this.set('definition', key, value, ttlMs); }
  invalidateDefinition(key?: string): void { this.invalidate('definition', key); }

  getAiResult<T>(key: string): T | null { return this.get<T>('ai', key); }
  setAiResult<T>(key: string, value: T, ttlMs?: number): void { this.set('ai', key, value, ttlMs); }
  invalidateAiResult(key?: string): void { this.invalidate('ai', key); }

  getResult<T>(key: string): T | null { return this.get<T>('result', key); }
  setResult<T>(key: string, value: T, ttlMs?: number): void { this.set('result', key, value, ttlMs); }
  invalidateResult(key?: string): void { this.invalidate('result', key); }
}
