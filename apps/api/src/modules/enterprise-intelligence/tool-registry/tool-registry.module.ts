import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { ToolRegistryService } from './application/tool-registry.service.js';
import { ToolExecutorService } from './application/tool-executor.service.js';
import { ToolCapabilityService } from './application/tool-capability.service.js';
import { PrismaToolRegistry } from './infrastructure/persistence/prisma-tool-registry.js';

@Global()
@Module({
  providers: [
    ToolRegistryService,
    ToolExecutorService,
    ToolCapabilityService,
    { provide: 'IToolRegistry', useClass: PrismaToolRegistry },
  ],
  exports: [
    ToolRegistryService,
    ToolExecutorService,
    ToolCapabilityService,
  ],
})
export class ToolRegistryModule implements OnModuleInit {
  private readonly logger = new Logger(ToolRegistryModule.name);

  onModuleInit(): void {
    this.logger.log('Tool Registry Module initialized');
  }
}
