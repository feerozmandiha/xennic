import { Module, forwardRef } from '@nestjs/common';

import { MinioService } from '../storage/infrastructure/minio/minio.service.js';
import { EventModule } from '../../shared/events/index.js';

import { IntakeService } from './application/services/intake.service.js';
import { ClassificationService } from './application/services/classification.service.js';
import { MetadataExtractionService } from './application/services/metadata-extraction.service.js';
import { ChunkingService } from './application/services/chunking.service.js';
import { EmbeddingService } from './application/services/embedding.service.js';
import { SearchService, EMBEDDING_SERVICE, QDRANT_SERVICE, SEARCH_REPOSITORY } from './application/services/search.service.js';
import { ExtractionService } from './application/services/extraction.service.js';
import { OntologyResolverService } from './application/services/ontology-resolver.service.js';
import { NormalizationService } from './application/services/normalization.service.js';
import { ValidationService } from './application/services/validation.service.js';
import { CitationService } from './application/services/citation.service.js';
import { KnowledgePublisherService } from './application/services/knowledge-publisher.service.js';
import { AuditService } from './application/services/audit.service.js';
import { PipelineOrchestratorService } from './application/services/pipeline-orchestrator.service.js';
import { VersionManagerService } from './application/services/version-manager.service.js';
import { FullTextSearchService } from './application/services/fulltext-search.service.js';
import { PublisherService } from './application/services/publisher.service.js';
import { FingerprintService } from './application/utils/fingerprint.service.js';

import { KnowledgeFactoryRepository } from './infrastructure/repositories/knowledge-factory.repository.js';
import { SearchRepository } from './infrastructure/repositories/search.repository.js';
import { KnowledgeObjectRepository } from './infrastructure/repositories/knowledge-object.repository.js';
import { ProvenanceRepository } from './infrastructure/repositories/provenance.repository.js';
import { TaxonomyRepository } from './infrastructure/repositories/taxonomy.repository.js';
import { OntologyRepository } from './infrastructure/repositories/ontology.repository.js';
import { QdrantAdapter } from './infrastructure/adapters/qdrant-adapter.js';
import { QdrantService } from './infrastructure/embeddings/qdrant.service.js';
import { PdfParserService } from './infrastructure/parsers/pdf-parser.service.js';
import { DocxParserService } from './infrastructure/parsers/docx-parser.service.js';
import { MarkdownParserService } from './infrastructure/parsers/markdown-parser.service.js';
import { ParserFactoryService } from './infrastructure/parsers/parser-factory.service.js';

import { KnowledgeIntakeController } from './presentation/controllers/knowledge-intake.controller.js';
import { KnowledgeSearchController } from './presentation/controllers/knowledge-search.controller.js';
import { KnowledgePipelineController } from './presentation/controllers/knowledge-pipeline.controller.js';

import { LlmProvider } from '../ai/infrastructure/providers/llm.provider.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';

@Module({
  imports: [WorkspaceModule, forwardRef(() => EventModule)],
  controllers: [KnowledgeIntakeController, KnowledgeSearchController, KnowledgePipelineController],
  providers: [
    IntakeService,
    ClassificationService,
    MetadataExtractionService,
    ChunkingService,
    EmbeddingService,
    SearchService,
    ExtractionService,
    OntologyResolverService,
    NormalizationService,
    ValidationService,
    CitationService,
    KnowledgePublisherService,
    AuditService,
    PipelineOrchestratorService,
    VersionManagerService,
    FullTextSearchService,
    PublisherService,
    FingerprintService,
    MinioService,
    QdrantService,
    PdfParserService,
    DocxParserService,
    MarkdownParserService,
    ParserFactoryService,
    LlmProvider,
    { provide: 'IKnowledgeFactoryRepository', useClass: KnowledgeFactoryRepository },
    KnowledgeFactoryRepository,
    { provide: 'IKnowledgeObjectRepository', useClass: KnowledgeObjectRepository },
    KnowledgeObjectRepository,
    { provide: 'IProvenanceRepository', useClass: ProvenanceRepository },
    ProvenanceRepository,
    { provide: 'ITaxonomyRepository', useClass: TaxonomyRepository },
    TaxonomyRepository,
    { provide: 'IOntologyRepository', useClass: OntologyRepository },
    OntologyRepository,
    { provide: 'IQdrantAdapter', useClass: QdrantAdapter },
    QdrantAdapter,
    { provide: EMBEDDING_SERVICE, useExisting: EmbeddingService },
    { provide: QDRANT_SERVICE, useExisting: QdrantService },
    { provide: SEARCH_REPOSITORY, useClass: SearchRepository },
    SearchRepository,
  ],
  exports: [
    IntakeService,
    ClassificationService,
    MetadataExtractionService,
    ChunkingService,
    EmbeddingService,
    SearchService,
    ExtractionService,
    OntologyResolverService,
    NormalizationService,
    ValidationService,
    CitationService,
    KnowledgePublisherService,
    AuditService,
    PipelineOrchestratorService,
    VersionManagerService,
    FullTextSearchService,
    FingerprintService,
    ParserFactoryService,
    PdfParserService,
    DocxParserService,
    MarkdownParserService,
    QdrantService,
    'IQdrantAdapter',
    'IOntologyRepository',
    'ITaxonomyRepository',
  ],
})
export class KnowledgeFactoryModule {}
