import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IKnowledgeChunkRepository } from '../../domain/interfaces/knowledge-chunk.repository.interface.js';
import { KnowledgeDocumentChunk } from '../../domain/entities/knowledge-document-chunk.entity.js';

@Injectable()
export class KnowledgeChunkRepository implements IKnowledgeChunkRepository {
  async create(entity: KnowledgeDocumentChunk): Promise<KnowledgeDocumentChunk> {
    const row = await prisma.knowledge_document_chunks.create({
      data: {
        document_id: entity.documentId,
        chunk_index: entity.chunkIndex,
        text: entity.text,
        token_count: entity.tokenCount,
        page_number: entity.pageNumber,
        section: entity.section,
        metadata: entity.metadata as any,
        embedding_id: entity.embeddingId,
      },
    });
    return KnowledgeDocumentChunk.reconstitute({
      id: row.id,
      documentId: row.document_id,
      chunkIndex: row.chunk_index,
      text: row.text,
      tokenCount: row.token_count,
      pageNumber: row.page_number,
      section: row.section,
      metadata: row.metadata as Record<string, unknown>,
      embeddingId: row.embedding_id,
      createdAt: row.created_at,
    });
  }

  async createBatch(entities: KnowledgeDocumentChunk[]): Promise<KnowledgeDocumentChunk[]> {
    if (entities.length === 0) return [];
    await prisma.knowledge_document_chunks.createMany({
      data: entities.map((e) => ({
        document_id: e.documentId,
        chunk_index: e.chunkIndex,
        text: e.text,
        token_count: e.tokenCount,
        page_number: e.pageNumber,
        section: e.section,
        metadata: e.metadata as any,
        embedding_id: e.embeddingId,
      })),
    });
    return this.findByDocument(entities[0]!.documentId);
  }

  async findByDocument(documentId: string): Promise<KnowledgeDocumentChunk[]> {
    const rows = await prisma.knowledge_document_chunks.findMany({
      where: { document_id: documentId },
      orderBy: { chunk_index: 'asc' },
    });
    return rows.map((r) =>
      KnowledgeDocumentChunk.reconstitute({
        id: r.id,
        documentId: r.document_id,
        chunkIndex: r.chunk_index,
        text: r.text,
        tokenCount: r.token_count,
        pageNumber: r.page_number,
        section: r.section,
        metadata: r.metadata as Record<string, unknown>,
        embeddingId: r.embedding_id,
        createdAt: r.created_at,
      }),
    );
  }

  async findByIds(ids: string[]): Promise<KnowledgeDocumentChunk[]> {
    const rows = await prisma.knowledge_document_chunks.findMany({
      where: { id: { in: ids } },
    });
    return rows.map((r) =>
      KnowledgeDocumentChunk.reconstitute({
        id: r.id,
        documentId: r.document_id,
        chunkIndex: r.chunk_index,
        text: r.text,
        tokenCount: r.token_count,
        pageNumber: r.page_number,
        section: r.section,
        metadata: r.metadata as Record<string, unknown>,
        embeddingId: r.embedding_id,
        createdAt: r.created_at,
      }),
    );
  }

  async linkEmbedding(chunkId: string, embeddingId: string): Promise<void> {
    await prisma.knowledge_document_chunks.update({
      where: { id: chunkId },
      data: { embedding_id: embeddingId },
    });
  }

  async deleteByDocument(documentId: string): Promise<number> {
    const result = await prisma.knowledge_document_chunks.deleteMany({
      where: { document_id: documentId },
    });
    return result.count;
  }
}
