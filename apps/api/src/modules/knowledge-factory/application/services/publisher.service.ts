import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { KnowledgeObject, type KnowledgeTier } from '../../domain/knowledge-object.entity.js';
import { ProvenanceRecord } from '../../domain/provenance.entity.js';
import type { IKnowledgeObjectRepository } from '../../domain/interfaces/knowledge-object.repository.interface.js';
import type { IProvenanceRepository } from '../../domain/interfaces/provenance.repository.interface.js';
import type { IQdrantAdapter, QdrantPoint } from '../../domain/interfaces/qdrant-adapter.interface.js';
import { EventPublisher } from '../../../../shared/events/event-publisher.service.js';

export interface PublishInput {
  knowledgeObjectId: string;
  workspaceId: string;
  xid: string;
  title: string;
  slug: string;
  tier: KnowledgeTier;
  content: Record<string, unknown>;
  vectors?: { chunkId: string; embedding: number[]; payload: Record<string, unknown> }[];
  provenance?: {
    sourceDocument?: string;
    page?: number;
    section?: string;
    paragraph?: string;
    chunkId?: string;
    pipelineVersion?: string;
    parserVersion?: string;
    embeddingVersion?: string;
    citationChain?: Record<string, unknown>[];
    traceId?: string;
  };
  checksum?: string;
  engineeringDomain?: string;
  semanticTags?: string[];
  citations?: Record<string, unknown>[];
  sourceUrl?: string;
  storagePath?: string;
}

export interface PublishResult {
  success: boolean;
  knowledgeObjectId: string;
  version: number;
  vectorCount: number;
  errors: string[];
}

@Injectable()
export class PublisherService {
  private readonly logger = new Logger(PublisherService.name);

  constructor(
    @Inject('IKnowledgeObjectRepository') private readonly koRepository: IKnowledgeObjectRepository,
    @Inject('IProvenanceRepository') private readonly provenanceRepository: IProvenanceRepository,
    @Inject('IQdrantAdapter') private readonly qdrantAdapter: IQdrantAdapter,
    private readonly eventPublisher?: EventPublisher,
  ) {}

  async publish(input: PublishInput): Promise<PublishResult> {
    const errors: string[] = [];
    let version = 1;

    // Phase 1: Persist to PostgreSQL
    try {
      const ko = KnowledgeObject.reconstitute({
        id: input.knowledgeObjectId,
        xid: input.xid,
        workspaceId: input.workspaceId,
        title: input.title,
        slug: input.slug,
        language: 'fa',
        tier: input.tier,
        taxonomy: [],
        ontologyRefs: [],
        documentVersion: 1,
        checksum: input.checksum,
        status: 'active',
        authorityScore: 0.0,
        semanticTags: input.semanticTags ?? [],
        citations: input.citations ?? [],
        sourceUrl: input.sourceUrl,
        storagePath: input.storagePath,
        content: input.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await this.koRepository.save(ko);
      this.logger.log(`PostgreSQL persist OK: ${input.knowledgeObjectId}`);

      // Save provenance
      if (input.provenance) {
        const prov = new ProvenanceRecord({
          id: randomUUID(),
          knowledgeObjectId: input.knowledgeObjectId,
          sourceDocument: input.provenance.sourceDocument,
          page: input.provenance.page,
          section: input.provenance.section,
          paragraph: input.provenance.paragraph,
          chunkId: input.provenance.chunkId,
          pipelineVersion: input.provenance.pipelineVersion,
          parserVersion: input.provenance.parserVersion,
          embeddingVersion: input.provenance.embeddingVersion,
          citationChain: input.provenance.citationChain ?? [],
          traceId: input.provenance.traceId,
          createdAt: new Date(),
        });
        await this.provenanceRepository.save(prov);
      }
    } catch (err) {
      const msg = `PostgreSQL persist failed: ${(err as Error).message}`;
      this.logger.error(msg);
      return { success: false, knowledgeObjectId: input.knowledgeObjectId, version: 0, vectorCount: 0, errors: [msg] };
    }

    // Phase 2: Persist vectors to Qdrant
    let vectorCount = 0;
    if (input.vectors?.length) {
      try {
        await this.qdrantAdapter.ensureCollection(input.workspaceId);
        const points: QdrantPoint[] = input.vectors.map((v) => ({
          id: v.chunkId,
          vector: v.embedding,
          payload: { ...v.payload, knowledgeObjectId: input.knowledgeObjectId, workspaceId: input.workspaceId },
        }));
        await this.qdrantAdapter.batchInsert(input.workspaceId, points);
        vectorCount = points.length;
        this.logger.log(`Qdrant persist OK: ${vectorCount} vectors`);
      } catch (err) {
        const msg = `Qdrant persist failed: ${(err as Error).message}`;
        errors.push(msg);
        this.logger.error(msg);
        // Rollback PostgreSQL
        try {
          await this.koRepository.delete(input.knowledgeObjectId);
          this.logger.log(`Rollback PostgreSQL: ${input.knowledgeObjectId}`);
        } catch (rollbackErr) {
          this.logger.error(`Rollback failed: ${(rollbackErr as Error).message}`);
        }
        return { success: false, knowledgeObjectId: input.knowledgeObjectId, version: 0, vectorCount: 0, errors: [msg].concat(errors) };
      }
    }

    // Phase 3: Emit domain events
    try {
      await this.eventPublisher?.publish(
        this.eventPublisher?.getDefaultExchange() ?? 'xennic.events',
        'knowledge.object.published',
        {
          knowledgeObjectId: input.knowledgeObjectId,
          workspaceId: input.workspaceId,
          xid: input.xid,
          title: input.title,
          version,
          vectorCount,
          timestamp: new Date().toISOString(),
        },
      );
    } catch (err) {
      this.logger.warn(`Domain event emission failed (non-fatal): ${(err as Error).message}`);
    }

    return {
      success: errors.length === 0,
      knowledgeObjectId: input.knowledgeObjectId,
      version,
      vectorCount,
      errors,
    };
  }
}
