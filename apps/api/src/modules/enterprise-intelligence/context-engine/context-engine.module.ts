import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { ContextBuilderService } from './application/context-builder.service.js';
import { ContextAssemblerService } from './application/context-assembler.service.js';
import { ContextCacheService } from './application/context-cache.service.js';
import { PrismaContextStore } from './infrastructure/persistence/prisma-context-store.js';

@Global()
@Module({
  providers: [
    ContextBuilderService,
    ContextAssemblerService,
    ContextCacheService,
    { provide: 'IContextRepository', useClass: PrismaContextStore },
    { provide: 'IContextAssembler', useClass: ContextAssemblerService },
  ],
  exports: [
    ContextBuilderService,
    ContextAssemblerService,
    ContextCacheService,
    'IContextRepository',
    'IContextAssembler',
  ],
})
export class ContextEngineModule implements OnModuleInit {
  private readonly logger = new Logger(ContextEngineModule.name);

  onModuleInit(): void {
    this.logger.log('Context Engine Module initialized');
  }
}
