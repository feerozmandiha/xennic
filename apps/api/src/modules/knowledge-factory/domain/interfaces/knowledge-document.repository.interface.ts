import type { KnowledgeDocument } from '../entities/knowledge-document.entity.js';
import type { DocumentStatus } from '../value-objects/document-status.vo.js';

export interface IKnowledgeDocumentRepository {
  findById(id: string): Promise<KnowledgeDocument | null>;
  findByIds(ids: string[]): Promise<KnowledgeDocument[]>;
  findByWorkspace(
    workspaceId: string,
    offset?: number,
    limit?: number,
  ): Promise<{ data: KnowledgeDocument[]; total: number }>;
  create(entity: KnowledgeDocument): Promise<KnowledgeDocument>;
  update(entity: KnowledgeDocument): Promise<KnowledgeDocument>;
  softDelete(id: string): Promise<void>;
  findFailed(limit?: number): Promise<KnowledgeDocument[]>;
  countByStatus(workspaceId: string, status: DocumentStatus): Promise<number>;
  classifyDocument(
    documentId: string,
    classification: Record<string, unknown>,
  ): Promise<KnowledgeDocument>;
  publishDocument(documentId: string, knowledgeId: string): Promise<KnowledgeDocument>;
  failDocument(documentId: string, error: string): Promise<KnowledgeDocument>;
  retryDocument(documentId: string): Promise<KnowledgeDocument>;
}
