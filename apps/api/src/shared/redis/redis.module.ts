import { Global, Module, type OnModuleInit, type OnModuleDestroy } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { RedisService } from './redis.service.js';
import { CacheService } from './cache.service.js';
import { DistributedLockService } from './distributed-lock.service.js';
import { SessionStoreService } from './session-store.service.js';
import { CacheInterceptor } from './cache.decorator.js';

@Global()
@Module({
  providers: [
    RedisService,
    CacheService,
    DistributedLockService,
    SessionStoreService,
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
  exports: [RedisService, CacheService, DistributedLockService, SessionStoreService],
})
export class RedisModule {}
