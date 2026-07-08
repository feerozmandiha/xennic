import type { KnowledgeDocumentChunk } from '../entities/knowledge-document-chunk.entity.js';

export interface IKnowledgeChunkRepository {
  create(entity: KnowledgeDocumentChunk): Promise<KnowledgeDocumentChunk>;
  createBatch(entities: KnowledgeDocumentChunk[]): Promise<KnowledgeDocumentChunk[]>;
  findByDocument(documentId: string): Promise<KnowledgeDocumentChunk[]>;
  findByIds(ids: string[]): Promise<KnowledgeDocumentChunk[]>;
  linkEmbedding(chunkId: string, embeddingId: string): Promise<void>;
  deleteByDocument(documentId: string): Promise<number>;
}
