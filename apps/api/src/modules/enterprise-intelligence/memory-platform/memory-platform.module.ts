import { Module, Global, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MemoryService } from './application/memory.service.js';
import { MemoryIndexerService } from './application/memory-indexer.service.js';
import { MemoryExpirationService } from './application/memory-expiration.service.js';
import { PrismaMemoryStore } from './infrastructure/persistence/prisma-memory-store.js';
import { PrismaMemoryIndex } from './infrastructure/persistence/prisma-memory-index.js';

@Global()
@Module({
  providers: [
    MemoryService,
    MemoryIndexerService,
    MemoryExpirationService,
    { provide: 'IMemoryStore', useClass: PrismaMemoryStore },
    { provide: 'IMemoryIndex', useClass: PrismaMemoryIndex },
  ],
  exports: [
    MemoryService,
    MemoryIndexerService,
    MemoryExpirationService,
  ],
})
export class MemoryPlatformModule implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MemoryPlatformModule.name);
  private readonly EXPIRATION_INTERVAL_MS = 60000;

  constructor(
    private readonly expirationService: MemoryExpirationService,
  ) {}

  onModuleInit(): void {
    this.expirationService.scheduleInterval(this.EXPIRATION_INTERVAL_MS);
    this.logger.log('Memory Platform Module initialized');
  }

  onModuleDestroy(): void {
    this.expirationService.stopInterval();
    this.logger.log('Memory Platform Module destroyed');
  }
}
