import { Module } from '@nestjs/common';

import { KnowledgeController } from './presentation/controllers/knowledge.controller.js';
import { KnowledgeContentController } from './presentation/controllers/knowledge-content.controller.js';
import { KnowledgeStandardsController } from './presentation/controllers/knowledge-standards.controller.js';
import { PublicKnowledgeController } from './presentation/controllers/public-knowledge.controller.js';
import { TaxonomyController } from './presentation/controllers/taxonomy.controller.js';
import { KnowledgeService } from './application/services/knowledge.service.js';
import { KnowledgeContentService } from './application/services/knowledge-content.service.js';
import { KnowledgeRepository } from './infrastructure/repositories/knowledge.repository.js';
import { KnowledgeContentRepository } from './infrastructure/repositories/knowledge-content.repository.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [WorkspaceModule, RbacModule],
  controllers: [
    KnowledgeController,
    KnowledgeContentController,
    KnowledgeStandardsController,
    PublicKnowledgeController,
    TaxonomyController,
  ],
  providers: [
    KnowledgeService,
    KnowledgeContentService,
    {
      provide: 'IKnowledgeRepository',
      useClass: KnowledgeRepository,
    },
    {
      provide: 'IKnowledgeContentRepository',
      useClass: KnowledgeContentRepository,
    },
  ],
  exports: [KnowledgeService, KnowledgeContentService],
})
export class KnowledgeModule {}
