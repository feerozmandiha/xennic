import { Injectable } from '@nestjs/common';
import { BaseCacheService } from './base-cache.service.js';
import type { IMetadataCache } from '../../domain/interfaces/cache-interfaces.js';
import type { MetadataCacheEntry } from '../../domain/types/cache.types.js';

@Injectable()
export class MetadataCacheService extends BaseCacheService implements IMetadataCache {
  protected namespace = 'metadata';

  async getMetadata(entityId: string, entityType: string): Promise<Record<string, unknown> | null> {
    return this.get<Record<string, unknown>>(`${entityType}:${entityId}`);
  }

  async storeMetadata(entry: MetadataCacheEntry): Promise<void> {
    await this.set(`${entry.entityType}:${entry.entityId}`, entry.metadata, entry.ttl);
  }
}
