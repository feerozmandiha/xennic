import { Injectable, Logger } from '@nestjs/common';
import type { ContextSnapshot } from '../domain/context-snapshot.vo.js';
import type { ContextScope } from '../../shared/types/index.js';

interface CacheEntry {
  snapshot: ContextSnapshot;
  expiresAt: number;
}

@Injectable()
export class ContextCacheService {
  private readonly logger = new Logger(ContextCacheService.name);
  private readonly cache = new Map<string, CacheEntry>();

  get(key: string): ContextSnapshot | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.snapshot;
  }

  set(key: string, snapshot: ContextSnapshot, ttl: number): void {
    this.cache.set(key, {
      snapshot,
      expiresAt: Date.now() + ttl * 1000,
    });
  }

  invalidate(scope: ContextScope, scopeId: string): void {
    const key = `${scope}:${scopeId}`;
    this.cache.delete(key);
    this.logger.debug(`Cache invalidated for ${key}`);
  }

  invalidateSource(scope: ContextScope, scopeId: string, source: string): void {
    const key = `${scope}:${scopeId}`;
    this.cache.delete(key);
    this.logger.debug(`Cache invalidated for ${key} (source: ${source})`);
  }

  clear(): void {
    this.cache.clear();
    this.logger.debug('Cache cleared');
  }
}
