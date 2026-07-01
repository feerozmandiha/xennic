import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { IntakeService } from './intake.service.js';
import { ClassificationService } from './classification.service.js';
import { ChunkingService } from './chunking.service.js';
import { EmbeddingService } from './embedding.service.js';
import { ExtractionService } from './extraction.service.js';
import { OntologyResolverService } from './ontology-resolver.service.js';
import { NormalizationService } from './normalization.service.js';
import { ValidationService, type ValidationReport } from './validation.service.js';
import { CitationService } from './citation.service.js';
import { KnowledgePublisherService } from './knowledge-publisher.service.js';
import { AuditService } from './audit.service.js';
import { ParserFactoryService } from '../../infrastructure/parsers/parser-factory.service.js';
import { EKO_STATUS } from '../../domain/constants.js';
import { PIPELINE_EVENTS, type PipelineEventPayload } from '../../domain/pipeline-events.js';
import type { EkosEntity } from '../../domain/ekos.entity.js';
import { EventPublisher } from '../../../../shared/events/event-publisher.service.js';

export interface PipelineResult {
  documentId: string;
  status: 'success' | 'partial' | 'failed';
  stages: PipelineStageResult[];
  errors: string[];
}

export interface PipelineStageResult {
  stage: string;
  status: 'success' | 'skipped' | 'failed';
  detail: string;
  durationMs: number;
}

@Injectable()
export class PipelineOrchestratorService {
  private readonly logger = new Logger(PipelineOrchestratorService.name);

  constructor(
    private readonly intakeService: IntakeService,
    private readonly parserFactory: ParserFactoryService,
    private readonly classificationService: ClassificationService,
    private readonly extractionService: ExtractionService,
    private readonly ontologyResolver: OntologyResolverService,
    private readonly normalizationService: NormalizationService,
    private readonly validationService: ValidationService,
    private readonly chunkingService: ChunkingService,
    private readonly embeddingService: EmbeddingService,
    private readonly citationService: CitationService,
    private readonly publisherService: KnowledgePublisherService,
    private readonly auditService: AuditService,
    private readonly eventPublisher?: EventPublisher,
  ) {}

  async execute(
    workspaceId: string,
    userId: string,
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string,
  ): Promise<PipelineResult> {
    const documentId = randomUUID();
    const stages: PipelineStageResult[] = [];
    const errors: string[] = [];
    let entity: EkosEntity | null = null;

    const emit = async (eventType: string, payload: PipelineEventPayload) => {
      try {
        await this.eventPublisher?.publish(
          this.eventPublisher?.getDefaultExchange() ?? 'xennic.events',
          eventType,
          payload,
        );
      } catch {
        this.logger.warn(`Failed to emit event ${eventType}`);
      }
    };

    const emitStage = (status: 'success' | 'failed', stage: string, detail: string) => {
      stages.push({ stage, status, detail, durationMs: 0 });
    };

    this.logger.log(`Pipeline started for document: ${originalName} (${mimeType})`);

    const ctx: StageContext = {
      workspaceId, userId, fileBuffer, originalName, mimeType, entity, documentId,
    };

    stageLoop:
    for (const stageDef of this.pipelineStages()) {
      const start = Date.now();
      try {
        const result = await stageDef.handler(ctx);

        if (result.entity) { entity = result.entity; ctx.entity = result.entity; }
        const stageStatus = result.skipped ? 'skipped' : 'success';
        const duration = Date.now() - start;
        stages.push({ stage: stageDef.name, status: stageStatus, detail: result.detail, durationMs: duration });

        const eventType = result.eventType ?? stageDef.eventType;
        await emit(eventType, {
          documentId: documentId,
          workspaceId,
          checksum: entity?.checksum ?? '',
          timestamp: new Date().toISOString(),
        });

        await this.auditService.record(
          documentId, workspaceId,
          eventType as any,
          'success', result.detail,
        );

        if (result.fatal) {
          errors.push(result.detail);
          break stageLoop;
        }
      } catch (err) {
        const duration = Date.now() - start;
        const message = (err as Error).message;
          stages.push({ stage: stageDef.name, status: 'failed', detail: message, durationMs: duration });
          errors.push(`[${stageDef.name}] ${message}`);

          await this.auditService.record(
            documentId, workspaceId,
            stageDef.eventType as any,
            'failure', message,
          );
        break stageLoop;
      }
    }

    const overallStatus = errors.length === 0 ? 'success' : stages.some((s) => s.status === 'success') ? 'partial' : 'failed';

    this.logger.log(
      `Pipeline completed for ${documentId}: ${overallStatus} ` +
      `(${stages.filter((s) => s.status === 'success').length}/${stages.length} stages)`,
    );

    return { documentId, status: overallStatus, stages, errors };
  }

  private pipelineStages(): Array<{
    name: string;
    eventType: string;
    handler: (ctx: StageContext) => Promise<StageResult>;
  }> {
    return [
      {
        name: 'Intake',
        eventType: PIPELINE_EVENTS.DOCUMENT_UPLOADED,
        handler: async (ctx) => {
          const entity = await this.intakeService.ingestDocument(
            ctx.workspaceId, ctx.userId, ctx.fileBuffer, ctx.originalName, ctx.mimeType,
          );
          return { entity, detail: `Document ingested: ${entity.documentId}` };
        },
      },
      {
        name: 'Parse',
        eventType: PIPELINE_EVENTS.DOCUMENT_PARSED,
        handler: async (ctx) => {
          const parser = this.parserFactory.getParser(ctx.mimeType);
          const parsed = await parser.parse(ctx.fileBuffer);
          if (!ctx.entity) throw new Error('Entity not available');
          ctx.entity.updateStatus(EKO_STATUS.PARSED);
          ctx._parsedContent = parsed;
          return { entity: ctx.entity, detail: `Parsed: ${parsed.metadata.title ?? 'untitled'}` };
        },
      },
      {
        name: 'Classify',
        eventType: PIPELINE_EVENTS.DOCUMENT_CLASSIFIED,
        handler: async (ctx) => {
          if (!ctx._parsedContent) throw new Error('No parsed content available');
          const classification = this.classificationService.classify(ctx._parsedContent, ctx.mimeType);
          if (ctx.entity) {
            ctx.entity.sourceType = classification.sourceType as any;
            ctx.entity.updateStatus(EKO_STATUS.CLASSIFIED);
            ctx._classification = classification;
          }
          return { entity: ctx.entity, detail: `Classified as: ${classification.sourceType} (${classification.language})` };
        },
      },
      {
        name: 'Extract',
        eventType: PIPELINE_EVENTS.ENTITIES_EXTRACTED,
        handler: async (ctx) => {
          if (!ctx._parsedContent) throw new Error('No parsed content available');
          const { entities, relationships } = this.extractionService.extract(ctx._parsedContent);
          ctx._entities = entities;
          ctx._relationships = relationships;
          if (ctx.entity) ctx.entity.updateStatus(EKO_STATUS.EXTRACTED);
          return { entity: ctx.entity, detail: `Extracted ${entities.length} entities, ${relationships.length} relationships` };
        },
      },
      {
        name: 'Ontology',
        eventType: PIPELINE_EVENTS.ONTOLOGY_RESOLVED,
        handler: async (ctx) => {
          if (!ctx._entities?.length) return { entity: ctx.entity, detail: 'No entities to resolve', skipped: true };
          const concepts = this.ontologyResolver.resolve(ctx._entities);
          ctx._concepts = concepts;
          return { entity: ctx.entity, detail: `Resolved ${concepts.length} ontology concepts` };
        },
      },
      {
        name: 'Normalize',
        eventType: PIPELINE_EVENTS.DOCUMENT_NORMALIZED,
        handler: async (ctx) => {
          if (!ctx._parsedContent) throw new Error('No parsed content available');
          const normalized = this.normalizationService.normalize(
            ctx.documentId, ctx.workspaceId, ctx._parsedContent,
          );
          ctx._normalized = normalized;
          if (ctx.entity) ctx.entity.updateStatus(EKO_STATUS.NORMALIZED);
          return { entity: ctx.entity, detail: `Normalized: ${normalized.normalizedUnits.length} units, ${normalized.standardizedTerms.length} terms` };
        },
      },
      {
        name: 'Validate',
        eventType: PIPELINE_EVENTS.DOCUMENT_VALIDATED,
        handler: async (ctx) => {
          if (!ctx._parsedContent || !ctx._classification) throw new Error('No parsed content or classification available');
          const report = await this.validationService.validate(
            ctx.documentId, ctx._parsedContent, ctx._classification,
          );
          ctx._validation = report;
          if (ctx.entity) ctx.entity.updateStatus(EKO_STATUS.VALIDATED);
          if (!report.passed) {
            return {
              entity: ctx.entity,
              detail: `Validation ${report.passed ? 'PASSED' : 'FAILED'}: ${report.errors.join('; ')}`,
            };
          }
          return { entity: ctx.entity, detail: `Validation PASSED (score=${(report.scores.overallScore * 100).toFixed(0)}%)` };
        },
      },
      {
        name: 'Chunk',
        eventType: PIPELINE_EVENTS.CHUNKS_CREATED,
        handler: async (ctx) => {
          if (!ctx._parsedContent || !ctx._classification) throw new Error('No parsed content available');
          const chunks = this.chunkingService.chunkDocument(ctx._parsedContent);
          ctx._chunks = chunks;
          if (ctx.entity) ctx.entity.updateStatus(EKO_STATUS.CHUNKED);
          return { entity: ctx.entity, detail: `Created ${chunks.length} chunks` };
        },
      },
      {
        name: 'Embed',
        eventType: PIPELINE_EVENTS.EMBEDDINGS_GENERATED,
        handler: async (ctx) => {
          if (!ctx._chunks?.length) throw new Error('No chunks available');
          ctx._embeddings = [];
          for (const chunk of ctx._chunks) {
            const embedding = await this.embeddingService.generateEmbedding(chunk.content);
            ctx._embeddings.push({ chunkId: chunk.chunkId, embedding, dimensions: embedding.length });
          }
          if (ctx.entity) ctx.entity.updateStatus(EKO_STATUS.EMBEDDED);
          return { entity: ctx.entity, detail: `Generated ${ctx._embeddings.length} embeddings` };
        },
      },
      {
        name: 'Publish',
        eventType: PIPELINE_EVENTS.DOCUMENT_PUBLISHED,
        handler: async (ctx) => {
          if (!ctx.entity || !ctx._chunks?.length || !ctx._embeddings?.length) throw new Error('Missing data for publish');
          const evidenceChain = this.citationService.buildEvidenceChain(
            ctx.documentId, ctx._parsedContent!, ctx._chunks,
          );
          const result = await this.publisherService.publish(
            ctx.entity, ctx._chunks, ctx._embeddings, evidenceChain, ctx.workspaceId,
          );
          return { entity: ctx.entity, detail: `Published: ${result.vectorCount} vectors to Qdrant` };
        },
      },
    ];
  }
}

interface StageContext {
  workspaceId: string;
  userId: string;
  fileBuffer: Buffer;
  originalName: string;
  mimeType: string;
  entity: EkosEntity | null;
  documentId: string;
  _parsedContent?: any;
  _classification?: any;
  _entities?: any[];
  _relationships?: any[];
  _concepts?: any[];
  _normalized?: any;
  _validation?: ValidationReport;
  _chunks?: any[];
  _embeddings?: any[];
}

interface StageResult {
  entity?: EkosEntity | null;
  detail: string;
  fatal?: boolean;
  skipped?: boolean;
  eventType?: string;
}
