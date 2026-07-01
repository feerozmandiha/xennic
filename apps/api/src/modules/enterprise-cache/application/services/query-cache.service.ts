import { Injectable } from '@nestjs/common';
import { BaseCacheService } from './base-cache.service.js';
import type { IQueryCache } from '../../domain/interfaces/cache-interfaces.js';
import type { QueryCacheEntry } from '../../domain/types/cache.types.js';
import { createHash } from 'node:crypto';

@Injectable()
export class QueryCacheService extends BaseCacheService implements IQueryCache {
  protected namespace = 'query';

  async findByHash(hash: string): Promise<QueryCacheEntry | null> {
    return this.get<QueryCacheEntry>(hash);
  }

  async storeQuery(entry: QueryCacheEntry): Promise<void> {
    const hash = entry.hash || createHash('sha256').update(entry.query).digest('hex').slice(0, 16);
    await this.set(hash, { ...entry, hash }, entry.ttl);
  }
}
