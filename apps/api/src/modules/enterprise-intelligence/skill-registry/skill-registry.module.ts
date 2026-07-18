import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { SkillRegistryService } from './application/skill-registry.service.js';
import { SkillComposerService } from './application/skill-composer.service.js';
import { SkillExecutorService } from './application/skill-executor.service.js';
import { PrismaSkillRegistry } from './infrastructure/persistence/prisma-skill-registry.js';

@Global()
@Module({
  providers: [
    SkillRegistryService,
    SkillComposerService,
    SkillExecutorService,
    { provide: 'ISkillRegistry', useClass: PrismaSkillRegistry },
  ],
  exports: [SkillRegistryService, SkillComposerService, SkillExecutorService],
})
export class SkillRegistryModule implements OnModuleInit {
  private readonly logger = new Logger(SkillRegistryModule.name);

  onModuleInit(): void {
    this.logger.log('Skill Registry Module initialized');
  }
}
