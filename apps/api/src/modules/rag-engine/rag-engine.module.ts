import { Module } from '@nestjs/common';
import { KnowledgeFactoryModule } from '../knowledge-factory/knowledge-factory.module.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';

import { HybridRetrievalService } from './application/services/hybrid-retrieval.service.js';
import { CitationEngineService } from './application/services/citation-engine.service.js';
import { EvidenceChainService } from './application/services/evidence-chain.service.js';
import { ContextBuilder } from './application/services/context-builder.service.js';
import { PromptBuilder } from './application/services/prompt-builder.service.js';
import { ResponseValidator } from './application/services/response-validator.service.js';
import { ConflictResolver } from './application/services/conflict-resolver.service.js';
import { ConfidenceEngine } from './application/services/confidence-engine.service.js';
import { EngineeringGuardrails } from './application/services/engineering-guardrails.service.js';
import { RagOrchestratorService } from './application/services/rag-orchestrator.service.js';

import { RagController } from './presentation/controllers/rag.controller.js';

@Module({
  imports: [KnowledgeFactoryModule, WorkspaceModule],
  controllers: [RagController],
  providers: [
    { provide: 'IHybridRetrievalService', useClass: HybridRetrievalService },
    HybridRetrievalService,
    { provide: 'ICitationEngine', useClass: CitationEngineService },
    CitationEngineService,
    EvidenceChainService,
    { provide: 'IContextBuilder', useClass: ContextBuilder },
    ContextBuilder,
    { provide: 'IPromptBuilder', useClass: PromptBuilder },
    PromptBuilder,
    { provide: 'IResponseValidator', useClass: ResponseValidator },
    ResponseValidator,
    { provide: 'IConflictResolver', useClass: ConflictResolver },
    ConflictResolver,
    { provide: 'IConfidenceEngine', useClass: ConfidenceEngine },
    ConfidenceEngine,
    { provide: 'IEngineeringGuardrails', useClass: EngineeringGuardrails },
    EngineeringGuardrails,
    RagOrchestratorService,
  ],
  exports: [
    RagOrchestratorService,
    'IHybridRetrievalService',
    'ICitationEngine',
    'IContextBuilder',
    'IPromptBuilder',
    'IResponseValidator',
    'IConflictResolver',
    'IConfidenceEngine',
    'IEngineeringGuardrails',
  ],
})
export class RagEngineModule {}
