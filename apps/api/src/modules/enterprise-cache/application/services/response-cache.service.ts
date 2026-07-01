import { Injectable } from '@nestjs/common';
import { BaseCacheService } from './base-cache.service.js';
import type { IResponseCache } from '../../domain/interfaces/cache-interfaces.js';
import type { ResponseCacheEntry } from '../../domain/types/cache.types.js';

@Injectable()
export class ResponseCacheService extends BaseCacheService implements IResponseCache {
  protected namespace = 'response';

  async getResponse(requestHash: string): Promise<ResponseCacheEntry | null> {
    return this.get<ResponseCacheEntry>(requestHash);
  }

  async storeResponse(entry: ResponseCacheEntry): Promise<void> {
    await this.set(entry.requestHash, entry, entry.ttl);
  }
}
