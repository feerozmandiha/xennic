import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';

import { DocumentsController } from './presentation/controllers/documents.controller.js';
import { PipelineStatusController } from './presentation/controllers/pipeline-status.controller.js';
import { SearchController } from './presentation/controllers/search.controller.js';

import { DocumentIntakeService } from './application/services/document-intake.service.js';
import { DocumentClassifierService } from './application/services/document-classifier.service.js';
import { DocumentParserService } from './application/services/document-parser.service.js';
import { ContentNormalizerService } from './application/services/content-normalizer.service.js';
import { ChunkingService } from './application/services/chunking.service.js';
import { PublishingService } from './application/services/publishing.service.js';
import { PipelineOrchestratorService } from './application/services/pipeline-orchestrator.service.js';
import { HybridSearchService } from './application/services/hybrid-search.service.js';

import { KnowledgeDocumentRepository } from './infrastructure/repositories/knowledge-document.repository.js';
import { KnowledgeChunkRepository } from './infrastructure/repositories/knowledge-chunk.repository.js';
import { ExtractionRepository } from './infrastructure/repositories/extraction.repository.js';
import { PipelineRunRepository } from './infrastructure/repositories/pipeline-run.repository.js';
import { EmbeddingGatewayService } from './infrastructure/gateways/embedding-gateway.service.js';

import { IntakeWorker } from './infrastructure/workers/intake.worker.js';
import { ClassifyWorker } from './infrastructure/workers/classify.worker.js';
import { ParseWorker } from './infrastructure/workers/parse.worker.js';
import { NormalizeWorker } from './infrastructure/workers/normalize.worker.js';
import { ChunkWorker } from './infrastructure/workers/chunk.worker.js';
import { EmbedWorker } from './infrastructure/workers/embed.worker.js';
import { PublishWorker } from './infrastructure/workers/publish.worker.js';

import { PipelineEventBus } from './infrastructure/queues/pipeline-event-bus.js';
import { QUEUE_NAMES } from './infrastructure/queues/queue-names.js';
import { AIProviderRegistry } from './application/services/ai-provider-registry.service.js';

import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { KnowledgeModule } from '../knowledge/knowledge.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { StorageService } from '../storage/application/services/storage.service.js';
import { BullModule } from '@nestjs/bullmq';

async function createBullmqQueue(name: string) {
  const { Queue } = await import('bullmq');
  return new Queue(name);
}

@Module({
  imports: [
    WorkspaceModule,
    RbacModule,
    KnowledgeModule,
    StorageModule,
    MulterModule.register({ limits: { fileSize: 50 * 1024 * 1024 } }),
    BullModule.forRoot({} as any),
    // registerQueue بارگذاری coreModuleDefinition را فعال می‌کند که شامل
    // BullExplorer/BullRegistrar است — بدون آن، worker های @Processor هرگز
    // ساخته نمی‌شوند و job های صف پردازش نمی‌شوند.
    BullModule.registerQueue(
      { name: QUEUE_NAMES.INTAKE },
      { name: QUEUE_NAMES.CLASSIFY },
      { name: QUEUE_NAMES.PARSE },
      { name: QUEUE_NAMES.NORMALIZE },
      { name: QUEUE_NAMES.CHUNK },
      { name: QUEUE_NAMES.EMBED },
      { name: QUEUE_NAMES.PUBLISH },
      { name: QUEUE_NAMES.DEAD_LETTER },
    ),
  ],
  controllers: [DocumentsController, PipelineStatusController, SearchController],
  providers: [
    DocumentIntakeService,
    DocumentClassifierService,
    DocumentParserService,
    ContentNormalizerService,
    ChunkingService,
    PublishingService,
    PipelineOrchestratorService,
    HybridSearchService,
    { provide: 'IKnowledgeDocumentRepository', useClass: KnowledgeDocumentRepository },
    { provide: 'IKnowledgeChunkRepository', useClass: KnowledgeChunkRepository },
    { provide: 'IExtractionRepository', useClass: ExtractionRepository },
    { provide: 'IPipelineRunRepository', useClass: PipelineRunRepository },
    { provide: 'IStorageService', useExisting: StorageService },
    { provide: 'EmbeddingGateway', useClass: EmbeddingGatewayService },
    PipelineEventBus,
    {
      provide: QUEUE_NAMES.INTAKE,
      useFactory: async () => createBullmqQueue(QUEUE_NAMES.INTAKE),
    },
    {
      provide: QUEUE_NAMES.CLASSIFY,
      useFactory: async () => createBullmqQueue(QUEUE_NAMES.CLASSIFY),
    },
    {
      provide: QUEUE_NAMES.PARSE,
      useFactory: async () => createBullmqQueue(QUEUE_NAMES.PARSE),
    },
    {
      provide: QUEUE_NAMES.NORMALIZE,
      useFactory: async () => createBullmqQueue(QUEUE_NAMES.NORMALIZE),
    },
    {
      provide: QUEUE_NAMES.CHUNK,
      useFactory: async () => createBullmqQueue(QUEUE_NAMES.CHUNK),
    },
    {
      provide: QUEUE_NAMES.EMBED,
      useFactory: async () => createBullmqQueue(QUEUE_NAMES.EMBED),
    },
    {
      provide: QUEUE_NAMES.PUBLISH,
      useFactory: async () => createBullmqQueue(QUEUE_NAMES.PUBLISH),
    },
    {
      provide: QUEUE_NAMES.DEAD_LETTER,
      useFactory: async () => createBullmqQueue(`${QUEUE_NAMES.DEAD_LETTER}`),
    },
    AIProviderRegistry,
    // Workers
    { provide: 'IntakeWorker', useClass: IntakeWorker },
    { provide: 'ClassifyWorker', useClass: ClassifyWorker },
    { provide: 'ParseWorker', useClass: ParseWorker },
    { provide: 'NormalizeWorker', useClass: NormalizeWorker },
    { provide: 'ChunkWorker', useClass: ChunkWorker },
    { provide: 'EmbedWorker', useClass: EmbedWorker },
    { provide: 'PublishWorker', useClass: PublishWorker },
  ],
  exports: [DocumentIntakeService, PipelineOrchestratorService],
})
export class KnowledgeFactoryModule {}
