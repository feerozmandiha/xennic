jest.mock('@xennic/database', () => ({
  prisma: {
    audit_logs: { create: jest.fn(), findFirst: jest.fn(), findMany: jest.fn() },
    ekos_entities: { create: jest.fn(), findUnique: jest.fn(), findFirst: jest.fn() },
    files: { create: jest.fn(), findUnique: jest.fn() },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { PipelineOrchestratorService } from '../application/services/pipeline-orchestrator.service.js';
import { IntakeService } from '../application/services/intake.service.js';
import { ClassificationService } from '../application/services/classification.service.js';
import { ChunkingService } from '../application/services/chunking.service.js';
import { EmbeddingService } from '../application/services/embedding.service.js';
import { ExtractionService } from '../application/services/extraction.service.js';
import { OntologyResolverService } from '../application/services/ontology-resolver.service.js';
import { NormalizationService } from '../application/services/normalization.service.js';
import { ValidationService } from '../application/services/validation.service.js';
import { CitationService } from '../application/services/citation.service.js';
import { KnowledgePublisherService } from '../application/services/knowledge-publisher.service.js';
import { AuditService } from '../application/services/audit.service.js';
import { EventPublisher } from '../../../shared/events/event-publisher.service.js';
import { ParserFactoryService } from '../infrastructure/parsers/parser-factory.service.js';
import type { ParsedContent, ClassificationResult, ParserService } from '../infrastructure/parsers/parsed-content.type.js';
import { EkosEntity } from '../domain/ekos.entity.js';
import type { DocumentChunk, EmbeddingResult } from '../domain/chunk.types.js';
import type { PublishResult } from '../application/services/knowledge-publisher.service.js';
import type { ValidationReport } from '../application/services/validation.service.js';
import type { AuditEntry } from '../application/services/audit.service.js';

const mockParser: ParserService = {
  parse: jest.fn().mockResolvedValue({
    text: 'Test document content for transformer specifications.',
    metadata: { title: 'Test Doc', pageCount: 5 },
  }),
};

const mockEntity = new EkosEntity(
  'entity-1', 'doc-1', 'ws-1', 'standard' as any,
  'Test document content.', {}, 'abc123', 'uploaded' as any,
  new Date(), new Date(),
);

function createMockModule() {
    return Test.createTestingModule({
    providers: [
      { provide: EventPublisher, useValue: { publish: jest.fn(), getDefaultExchange: jest.fn().mockReturnValue('xennic.events') } },
      PipelineOrchestratorService,
      {
        provide: IntakeService,
        useValue: { ingestDocument: jest.fn().mockResolvedValue(mockEntity) },
      },
      {
        provide: ParserFactoryService,
        useValue: { getParser: jest.fn().mockReturnValue(mockParser) },
      },
      {
        provide: ClassificationService,
        useValue: {
          classify: jest.fn().mockReturnValue({
            sourceType: 'standard', confidence: 0.9, language: 'en',
          } satisfies ClassificationResult),
        },
      },
      {
        provide: ExtractionService,
        useValue: {
          extract: jest.fn().mockReturnValue({
            entities: [
              { id: 'e1', type: 'standard', value: 'IEC 60076', confidence: 0.9, metadata: {} },
            ],
            relationships: [],
          }),
        },
      },
      {
        provide: OntologyResolverService,
        useValue: {
          resolve: jest.fn().mockReturnValue([
            { conceptId: 'concept:transformer', label: 'Transformer', confidence: 0.9, parentIds: [] },
          ]),
        },
      },
      {
        provide: NormalizationService,
        useValue: {
          normalize: jest.fn().mockReturnValue({
            documentId: 'doc-1', workspaceId: 'ws-1',
            cleanContent: 'normalized content',
            normalizedUnits: [], standardizedTerms: [],
            metadata: {},
          }),
        },
      },
      {
        provide: ValidationService,
        useValue: {
          validate: jest.fn().mockResolvedValue({
            passed: true,
            scores: { contentScore: 0.8, standardScore: 0.9, semanticScore: 0.7, overallScore: 0.8 },
            errors: [], warnings: [],
          } satisfies ValidationReport),
        },
      },
      {
        provide: ChunkingService,
        useValue: {
          chunkDocument: jest.fn().mockReturnValue([
            { chunkId: 'chunk-1', docId: 'doc-1', workspaceId: 'ws-1', content: 'chunk content', chunkType: 'text', index: 0, metadata: {} } satisfies DocumentChunk,
          ]),
        },
      },
      {
        provide: EmbeddingService,
        useValue: {
          generateEmbedding: jest.fn().mockResolvedValue([0.1, 0.2, 0.3]),
        },
      },
      {
        provide: CitationService,
        useValue: {
          buildEvidenceChain: jest.fn().mockReturnValue({
            evidenceId: 'ev-1', claims: [], confidence: 0.9,
            sources: [{ sourceId: 'chunk-1', documentId: 'doc-1', location: 'section-1', excerpt: '...', confidence: 0.9, version: 1 }],
          }),
        },
      },
      {
        provide: KnowledgePublisherService,
        useValue: {
          publish: jest.fn().mockResolvedValue({
            published: true, documentId: 'doc-1', vectorCount: 1,
            storagePath: 'knowledge/ws-1/doc-1/uuid/', citations: [],
          } satisfies PublishResult),
        },
      },
      {
        provide: AuditService,
        useValue: {
          record: jest.fn().mockResolvedValue({
            id: 'audit-1', documentId: 'doc-1', workspaceId: 'ws-1',
            eventType: 'knowledge.document.uploaded', status: 'success',
            detail: 'OK', previousHash: '', hash: 'a'.repeat(64),
            timestamp: new Date(), metadata: {},
          } satisfies AuditEntry),
        },
      },
    ],
  }).compile();
}

describe('PipelineOrchestratorService', () => {
  let service: PipelineOrchestratorService;

  beforeEach(async () => {
    const module: TestingModule = await createMockModule();
    service = module.get<PipelineOrchestratorService>(PipelineOrchestratorService);
  });

  it('executes full pipeline to success', async () => {
    const result = await service.execute(
      'ws-1', 'user-1', Buffer.from('test'), 'doc.pdf', 'application/pdf',
    );
    expect(result.status).toBe('success');
    expect(result.documentId).toBeDefined();
    expect(result.stages.length).toBeGreaterThan(0);
    expect(result.errors).toHaveLength(0);
    const failedStages = result.stages.filter((s) => s.status === 'failed');
    expect(failedStages).toHaveLength(0);
  });

  it('stages appear in correct order', async () => {
    const result = await service.execute(
      'ws-1', 'user-1', Buffer.from('test'), 'doc.pdf', 'application/pdf',
    );
    const expectedOrder = ['Intake', 'Parse', 'Classify', 'Extract', 'Ontology', 'Normalize', 'Validate', 'Chunk', 'Embed', 'Publish'];
    const stageNames = result.stages.map((s) => s.stage);
    expect(stageNames).toEqual(expectedOrder);
  });

  it('reports failure when intake throws', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: EventPublisher, useValue: { publish: jest.fn(), getDefaultExchange: jest.fn().mockReturnValue('xennic.events') } },
        PipelineOrchestratorService,
        {
          provide: IntakeService,
          useValue: { ingestDocument: jest.fn().mockRejectedValue(new Error('Ingestion failed')) },
        },
        {
          provide: ParserFactoryService,
          useValue: { getParser: jest.fn().mockReturnValue(mockParser) },
        },
        {
          provide: ClassificationService,
          useValue: { classify: jest.fn() },
        },
        {
          provide: ExtractionService,
          useValue: { extract: jest.fn() },
        },
        {
          provide: OntologyResolverService,
          useValue: { resolve: jest.fn() },
        },
        {
          provide: NormalizationService,
          useValue: { normalize: jest.fn() },
        },
        {
          provide: ValidationService,
          useValue: { validate: jest.fn() },
        },
        {
          provide: ChunkingService,
          useValue: { chunkDocument: jest.fn() },
        },
        {
          provide: EmbeddingService,
          useValue: { generateEmbedding: jest.fn() },
        },
        {
          provide: CitationService,
          useValue: { buildEvidenceChain: jest.fn() },
        },
        {
          provide: KnowledgePublisherService,
          useValue: { publish: jest.fn() },
        },
        {
          provide: AuditService,
          useValue: { record: jest.fn().mockResolvedValue({}) },
        },
      ],
    }).compile();
    const failService = module.get<PipelineOrchestratorService>(PipelineOrchestratorService);
    const result = await failService.execute(
      'ws-1', 'user-1', Buffer.from('test'), 'doc.pdf', 'application/pdf',
    );
    expect(result.status).toBe('failed');
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Ingestion failed');
  });

  it('each stage has durationMs set', async () => {
    const result = await service.execute(
      'ws-1', 'user-1', Buffer.from('test'), 'doc.pdf', 'application/pdf',
    );
    for (const stage of result.stages) {
      expect(stage.durationMs).toBeGreaterThanOrEqual(0);
    }
  });

  it('handles empty buffer gracefully through pipeline', async () => {
    const result = await service.execute(
      'ws-1', 'user-1', Buffer.alloc(0), 'empty.txt', 'text/plain',
    );
    expect(result.status).toBe('success');
    expect(result.documentId).toBeDefined();
  });
});
