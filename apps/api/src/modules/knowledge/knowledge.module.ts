import { Module } from '@nestjs/common';

import { KnowledgeController } from './presentation/controllers/knowledge.controller.js';
import { KnowledgeStandardsController } from './presentation/controllers/knowledge-standards.controller.js';
import { PublicKnowledgeController } from './presentation/controllers/public-knowledge.controller.js';
import { TaxonomyController } from './presentation/controllers/taxonomy.controller.js';
import { KnowledgeService } from './application/services/knowledge.service.js';
import { KnowledgeRepository } from './infrastructure/repositories/knowledge.repository.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [
    WorkspaceModule,
    RbacModule,
  ],
  controllers: [KnowledgeController, KnowledgeStandardsController, PublicKnowledgeController, TaxonomyController],
  providers: [
    KnowledgeService,
    {
      provide: 'IKnowledgeRepository',
      useClass: KnowledgeRepository,
    },
  ],
  exports: [KnowledgeService],
})
export class KnowledgeModule {}
