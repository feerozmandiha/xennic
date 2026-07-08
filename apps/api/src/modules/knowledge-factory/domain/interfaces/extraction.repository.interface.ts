import type { KnowledgeExtraction } from '../entities/knowledge-extraction.entity.js';

export interface IExtractionRepository {
  create(entity: KnowledgeExtraction): Promise<KnowledgeExtraction>;
  findByDocument(documentId: string): Promise<KnowledgeExtraction[]>;
  findLatestByDocument(documentId: string): Promise<KnowledgeExtraction | null>;
}
