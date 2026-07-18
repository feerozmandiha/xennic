import { Module, OnModuleInit, Logger, Global } from '@nestjs/common';
import { CacheManagerService } from './application/services/cache-manager.service.js';
import { CacheInvalidationService } from './infrastructure/distributed/cache-invalidation.service.js';

@Global()
@Module({
  providers: [CacheManagerService, CacheInvalidationService],
  exports: [CacheManagerService, CacheInvalidationService],
})
export class EnterpriseCacheModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseCacheModule.name);

  onModuleInit(): void {
    this.logger.log('Enterprise Cache Module initialized: cache manager + invalidation ready');
  }
}
