import { Injectable } from '@nestjs/common';
import { BaseCacheService } from './base-cache.service.js';
import type { IEmbeddingCache } from '../../domain/interfaces/cache-interfaces.js';
import type { EmbeddingCacheEntry } from '../../domain/types/cache.types.js';
import { createHash } from 'node:crypto';

@Injectable()
export class EmbeddingCacheService extends BaseCacheService implements IEmbeddingCache {
  protected namespace = 'embedding';

  async getEmbedding(text: string, model: string): Promise<number[] | null> {
    const key = `${model}:${createHash('md5').update(text).digest('hex')}`;
    const entry = await this.get<EmbeddingCacheEntry>(key);
    return entry?.embedding ?? null;
  }

  async storeEmbedding(entry: EmbeddingCacheEntry): Promise<void> {
    const key = `${entry.model}:${createHash('md5').update(entry.text).digest('hex')}`;
    await this.set(key, entry, 86400);
  }
}
