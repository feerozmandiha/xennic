import { Inject, Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { DocumentChunk, EmbeddingResult } from '../../domain/chunk.types.js';
import type { EkosEntity } from '../../domain/ekos.entity.js';
import { EKO_STATUS } from '../../domain/constants.js';
import { QdrantService } from '../../infrastructure/embeddings/qdrant.service.js';
import { MinioService } from '../../../storage/infrastructure/minio/minio.service.js';
import type { IKnowledgeFactoryRepository } from '../../domain/interfaces/knowledge-factory.repository.interface.js';
import type { Citation, EvidenceChain } from './citation.service.js';

export interface PublishResult {
  published: boolean;
  documentId: string;
  vectorCount: number;
  storagePath: string;
  citations: Citation[];
}

@Injectable()
export class KnowledgePublisherService {
  private readonly logger = new Logger(KnowledgePublisherService.name);

  constructor(
    private readonly qdrantService: QdrantService,
    private readonly minioService: MinioService,
    @Inject('IKnowledgeFactoryRepository') private readonly repository: IKnowledgeFactoryRepository,
  ) {}

  async publish(
    entity: EkosEntity,
    chunks: DocumentChunk[],
    embeddings: EmbeddingResult[],
    evidenceChain: EvidenceChain,
    workspaceId: string,
  ): Promise<PublishResult> {
    const storagePath = `knowledge/${workspaceId}/${entity.documentId}/${randomUUID()}/`;

    const publishedData = {
      documentId: entity.documentId,
      workspaceId,
      sourceType: entity.sourceType,
      content: entity.content,
      metadata: entity.metadata,
      chunks: chunks.map((c) => ({
        chunkId: c.chunkId,
        content: c.content,
        heading: c.heading,
        chunkType: c.chunkType,
        index: c.index,
      })),
      evidenceChain,
      publishedAt: new Date().toISOString(),
    };

    try {
      const manifestBuf = Buffer.from(JSON.stringify(publishedData, null, 2));
      await this.minioService.uploadBuffer(
        'engineering',
        `${storagePath}manifest.json`,
        manifestBuf,
        'application/json',
        manifestBuf.length,
      );
      this.logger.log(`Published manifest to MinIO: ${storagePath}manifest.json`);
    } catch (err) {
      this.logger.warn(`MinIO publish failed (continuing): ${(err as Error).message}`);
    }

    let vectorCount = 0;
    try {
      if (this.qdrantService['connected']) {
        const points = chunks.map((chunk, i) => ({
          id: chunk.chunkId,
          vector: embeddings[i]?.embedding ?? [],
          payload: {
            documentId: entity.documentId,
            workspaceId,
            content: chunk.content,
            heading: chunk.heading,
            chunkType: chunk.chunkType,
            index: chunk.index,
            sourceType: entity.sourceType,
            metadata: entity.metadata,
          },
        }));

        await this.qdrantService.upsertPoints(workspaceId, points);
        vectorCount = points.length;
        this.logger.log(`Published ${points.length} vectors to Qdrant`);
      } else {
        this.logger.warn('Qdrant not connected — skipping vector publish');
      }
    } catch (err) {
      this.logger.error(`Qdrant publish failed: ${(err as Error).message}`);
    }

    entity.updateStatus(EKO_STATUS.PUBLISHED);
    await this.repository.save(entity);

    return {
      published: true,
      documentId: entity.documentId,
      vectorCount,
      storagePath,
      citations: this.buildCitations(evidenceChain),
    };
  }

  private buildCitations(chain: EvidenceChain): Citation[] {
    return chain.sources.map((source) => ({
      citationId: randomUUID(),
      format: `XENNIC-CITE:${source.documentId}:${source.sourceId}:${source.version}:${source.location}:${source.confidence}`,
      sourceRef: source,
    }));
  }
}
