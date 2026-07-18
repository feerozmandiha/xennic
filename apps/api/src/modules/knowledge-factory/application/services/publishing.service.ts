import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';

export interface PublishingResult {
  knowledgeId: string;
  publishedAt: Date;
  chunkCount: number;
  metadata: Record<string, unknown>;
}

interface PublishOptions {
  publishMetadata?: boolean;
  generateEmbeddings?: boolean;
}

@Injectable()
export class PublishingService {
  private readonly logger = new Logger(PublishingService.name);

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: IKnowledgeDocumentRepository,
    @Inject('IKnowledgeChunkRepository')
    private readonly chunkRepository: IKnowledgeChunkRepository,
    @Inject('IPipelineRunRepository')
    private readonly pipelineRunRepository: IPipelineRunRepository,
  ) {}

  async publishDocument(
    documentId: string,
    options: PublishOptions = {},
  ): Promise<PublishingResult> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    if (document.status !== 'embedding') {
      throw new Error(
        `Document ${documentId} is not ready for publishing. Current status: ${document.status}`,
      );
    }

    this.logger.log(`Publishing document: ${document.originalName}`);

    const knowledgeId = await this.createPublishedKnowledge(document, options);

    const chunks = await this.chunkRepository.findByDocument(documentId);

    document.publish(knowledgeId);
    await this.documentRepository.update(document);

    const publishedAt = new Date();
    const metadata: Record<string, unknown> = {
      chunksCount: chunks.length,
      publishedAt,
      options,
    };

    if (options.generateEmbeddings && process.env.EMBEDDING_SERVICE_URL) {
      try {
        const embedCount = await this.generateEmbeddings(documentId, chunks);
        metadata.embeddingsGenerated = embedCount;
      } catch {
        this.logger.warn(`Failed to generate embeddings for document ${documentId}`);
      }
    }

    return { knowledgeId, publishedAt, chunkCount: chunks.length, metadata };
  }

  async unpublishDocument(documentId: string): Promise<void> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    if (!document.publishedKnowledgeId) {
      throw new Error(`Document ${documentId} is not published`);
    }

    document.fail('Unpublished by user');
    await this.documentRepository.update(document);

    this.logger.log(`Unpublished document: ${document.originalName}`);
  }

  async getPublishingStatus(documentId: string): Promise<{
    canPublish: boolean;
    reason?: string;
    chunkCount: number;
    hasEmbeddings: boolean;
  }> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    const chunks = await this.chunkRepository.findByDocument(documentId);
    const hasEmbeddings = chunks.length > 0;

    if (document.status !== 'embedding') {
      return {
        canPublish: false,
        reason: `Document status is ${document.status}`,
        chunkCount: chunks.length,
        hasEmbeddings,
      };
    }

    return { canPublish: true, chunkCount: chunks.length, hasEmbeddings };
  }

  private async createPublishedKnowledge(
    _document: { originalName: string; classification?: unknown },
    _options: PublishOptions,
  ): Promise<string> {
    return `knowledge-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  private async generateEmbeddings(
    _documentId: string,
    _chunks: Array<{ id: string; text: string }>,
  ): Promise<number> {
    return 0;
  }
}
