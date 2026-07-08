import { Injectable, Logger } from '@nestjs/common';
import { CacheManagerService } from '../../application/services/cache-manager.service.js';
import type { CacheNamespace } from '../../domain/interfaces/cache-manager.interface.js';

export interface CacheInvalidationEvent {
  namespace: CacheNamespace;
  key?: string;
  tag?: string;
  pattern?: string;
  timestamp: string;
  reason: string;
}

@Injectable()
export class CacheInvalidationService {
  private readonly logger = new Logger(CacheInvalidationService.name);

  constructor(private readonly cacheManager: CacheManagerService) {}

  async handleInvalidation(event: CacheInvalidationEvent): Promise<number> {
    this.logger.log(`Processing cache invalidation: ${event.reason} (${event.namespace})`);

    if (event.key) {
      await this.cacheManager.delete(event.namespace, event.key);
      return 1;
    }
    if (event.tag) {
      return this.cacheManager.invalidateByTag(event.namespace, event.tag);
    }
    if (event.pattern) {
      return this.cacheManager.invalidateByPattern(event.namespace, event.pattern);
    }
    return this.cacheManager.invalidateByNamespace(event.namespace);
  }
}
