import { Injectable, Logger, Inject } from '@nestjs/common';
import { KnowledgeDocument } from '../../domain/entities/knowledge-document.entity.js';
import { KnowledgeDocumentChunk } from '../../domain/entities/knowledge-document-chunk.entity.js';
import { KnowledgeExtraction } from '../../domain/entities/knowledge-extraction.entity.js';
import type { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import type { IStorageService } from '../../domain/interfaces/storage-service.interface.js';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';
import type { IExtractionRepository } from '../../domain/interfaces/extraction.repository.interface.js';
import type { IPipelineRunRepository } from '../../domain/interfaces/pipeline-run.repository.interface.js';
import type { EmbeddingGateway } from '../../domain/interfaces/embedding-gateway.interface.js';
import { ClassificationResult } from '../../domain/value-objects/classification-result.vo.js';

interface ExtractionResult {
  document: KnowledgeDocument;
  extraction: { id: string };
}

interface ChunkResult {
  document: KnowledgeDocument;
  chunkEntities: KnowledgeDocumentChunk[];
}

@Injectable()
export class DocumentIntakeService {
  private readonly logger = new Logger(DocumentIntakeService.name);

  constructor(
    @Inject('IKnowledgeDocumentRepository')
    private readonly documentRepository: IKnowledgeDocumentRepository,
    @Inject('IStorageService')
    private readonly storageService: IStorageService,
    @Inject('IKnowledgeChunkRepository')
    private readonly chunkRepository: IKnowledgeChunkRepository,
    @Inject('IExtractionRepository')
    private readonly extractionRepository: IExtractionRepository,
    @Inject('IPipelineRunRepository')
    private readonly pipelineRunRepository: IPipelineRunRepository,
    @Inject('EmbeddingGateway')
    private readonly embeddingGateway: EmbeddingGateway,
  ) {}

  async registerDocument(data: {
    workspaceId: string;
    filename: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    buffer: Buffer;
    contentType: string;
    createdBy?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<KnowledgeDocument> {
    const path = `workspaces/${data.workspaceId}/${crypto.randomUUID()}-${data.filename}`;
    await this.storageService.upload({
      workspaceId: data.workspaceId,
      uploadedBy: data.createdBy ?? 'system',
      buffer: data.buffer,
      originalName: data.filename,
      mimeType: data.contentType,
    });

    const document = KnowledgeDocument.create({
      workspaceId: data.workspaceId,
      filename: data.filename,
      originalName: data.originalName,
      mimeType: data.mimeType,
      sizeBytes: data.sizeBytes,
      storagePath: path,
      createdBy: data.createdBy,
      metadata: data.metadata,
    });

    return this.documentRepository.create(document);
  }

  async classifyDocument(
    documentId: string,
    result: ClassificationResult,
  ): Promise<KnowledgeDocument> {
    const classification: Record<string, unknown> = {
      domain: result.domain,
      standard: result.standard,
      equipmentType: result.equipmentType,
      confidence: result.confidence,
      suggestedSlug: result.suggestedSlug,
    };
    return this.documentRepository.classifyDocument(documentId, classification);
  }

  async recordExtraction(
    documentId: string,
    method: string,
    text: string,
    confidence?: number | null,
    language?: string | null,
    metadata?: Record<string, unknown>,
  ): Promise<ExtractionResult> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    document.startParsing();
    await this.documentRepository.update(document);

    this.recordPipelineRun(documentId, 'parse', { documentId, method });

    const extraction = await this.extractionRepository.create(
      KnowledgeExtraction.create({
        documentId,
        method,
        text,
        confidence: confidence ?? null,
        language: language ?? null,
        metadata: metadata ?? {},
      }),
    );

    document.markExtracted();
    await this.documentRepository.update(document);

    return { document, extraction };
  }

  async chunkAndEmbed(
    documentId: string,
    chunks: Array<{
      text: string;
      tokenCount: number;
      pageNumber?: number | null;
      section?: string | null;
    }>,
  ): Promise<ChunkResult> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    document.markChunking();
    await this.documentRepository.update(document);

    this.recordPipelineRun(documentId, 'chunk', { documentId, chunkCount: chunks.length });

    const chunkEntities = chunks.map((c, idx) =>
      KnowledgeDocumentChunk.create({
        documentId,
        chunkIndex: idx,
        text: c.text,
        tokenCount: c.tokenCount,
        pageNumber: c.pageNumber,
        section: c.section,
      }),
    );

    const savedChunks = await this.chunkRepository.createBatch(chunkEntities);

    document.markEmbedding();
    await this.documentRepository.update(document);

    this.recordPipelineRun(documentId, 'embed', { documentId, chunkCount: savedChunks.length });

    const texts = savedChunks.map((c) => c.text);
    const embeddings = await this.embeddingGateway.embedBatch(texts);

    for (let i = 0; i < savedChunks.length; i++) {
      if (savedChunks[i]) {
        await this.chunkRepository.linkEmbedding(
          savedChunks[i]!.id,
          String(embeddings[i]?.length ?? 'unknown'),
        );
      }
    }

    return { document, chunkEntities: savedChunks };
  }

  async publishDocument(documentId: string, knowledgeId: string): Promise<KnowledgeDocument> {
    const document = await this.documentRepository.findById(documentId);
    if (!document) throw new Error(`Document ${documentId} not found`);

    this.recordPipelineRun(documentId, 'publish', { documentId, knowledgeId, action: 'link' });

    document.publish(knowledgeId);
    return this.documentRepository.update(document);
  }

  async failDocument(documentId: string, error: string): Promise<KnowledgeDocument> {
    return this.documentRepository.failDocument(documentId, error);
  }

  async retryDocument(documentId: string): Promise<KnowledgeDocument> {
    return this.documentRepository.retryDocument(documentId);
  }

  async deleteDocument(documentId: string): Promise<void> {
    await this.documentRepository.softDelete(documentId);
  }

  private recordPipelineRun(
    _documentId: string,
    _stage: string,
    _input: Record<string, unknown>,
  ): void {}
}
