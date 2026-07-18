import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IKnowledgeDocumentRepository } from '../../domain/interfaces/knowledge-document.repository.interface.js';
import { KnowledgeDocument } from '../../domain/entities/knowledge-document.entity.js';
import { DocumentStatus } from '../../domain/value-objects/document-status.vo.js';

@Injectable()
export class KnowledgeDocumentRepository implements IKnowledgeDocumentRepository {
  async findById(id: string): Promise<KnowledgeDocument | null> {
    const row = await prisma.knowledge_documents.findUnique({ where: { id, deleted_at: null } });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findByIds(ids: string[]): Promise<KnowledgeDocument[]> {
    const rows = await prisma.knowledge_documents.findMany({
      where: { id: { in: ids }, deleted_at: null },
    });
    return rows.map((r) => this._toEntity(r));
  }

  async findByWorkspace(
    workspaceId: string,
    offset = 0,
    limit = 20,
  ): Promise<{ data: KnowledgeDocument[]; total: number }> {
    const [data, total] = await Promise.all([
      prisma.knowledge_documents.findMany({
        where: { workspace_id: workspaceId, deleted_at: null },
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.knowledge_documents.count({
        where: { workspace_id: workspaceId, deleted_at: null },
      }),
    ]);
    return {
      data: data.map((r) => this._toEntity(r)),
      total,
    };
  }

  async create(entity: KnowledgeDocument): Promise<KnowledgeDocument> {
    const row = await prisma.knowledge_documents.create({
      data: {
        workspace_id: entity.workspaceId,
        filename: entity.filename,
        original_name: entity.originalName,
        mime_type: entity.mimeType,
        size_bytes: entity.sizeBytes,
        storage_path: entity.storagePath,
        document_type: entity.documentType,
        status: entity.status,
        classification: entity.classification as any,
        metadata: entity.metadata as any,
        created_by: entity.createdBy,
      },
    });
    return this._toEntity(row);
  }

  async update(entity: KnowledgeDocument): Promise<KnowledgeDocument> {
    const row = await prisma.knowledge_documents.update({
      where: { id: entity.id },
      data: {
        filename: entity.filename,
        original_name: entity.originalName,
        mime_type: entity.mimeType,
        size_bytes: entity.sizeBytes,
        storage_path: entity.storagePath,
        document_type: entity.documentType,
        status: entity.status,
        classification: entity.classification as any,
        metadata: entity.metadata as any,
        error_message: entity.errorMessage,
        retry_count: entity.retryCount,
        published_knowledge_id: entity.publishedKnowledgeId,
        updated_at: entity.updatedAt,
      },
    });
    return this._toEntity(row);
  }

  async softDelete(id: string): Promise<void> {
    await prisma.knowledge_documents.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async findFailed(limit = 50): Promise<KnowledgeDocument[]> {
    const rows = await prisma.knowledge_documents.findMany({
      where: { status: 'failed', deleted_at: null },
      take: limit,
      orderBy: { updated_at: 'desc' },
    });
    return rows.map((r) => this._toEntity(r));
  }

  async countByStatus(workspaceId: string, status: DocumentStatus): Promise<number> {
    return prisma.knowledge_documents.count({
      where: { workspace_id: workspaceId, status, deleted_at: null },
    });
  }

  async classifyDocument(
    documentId: string,
    classification: Record<string, unknown>,
  ): Promise<KnowledgeDocument> {
    const row = await prisma.knowledge_documents.update({
      where: { id: documentId },
      data: { status: 'classified', classification: classification as any },
    });
    return this._toEntity(row);
  }

  async publishDocument(documentId: string, knowledgeId: string): Promise<KnowledgeDocument> {
    const row = await prisma.knowledge_documents.update({
      where: { id: documentId },
      data: { status: 'published', published_knowledge_id: knowledgeId },
    });
    return this._toEntity(row);
  }

  async failDocument(documentId: string, error: string): Promise<KnowledgeDocument> {
    const row = await prisma.knowledge_documents.update({
      where: { id: documentId },
      data: { status: 'failed', error_message: error },
    });
    return this._toEntity(row);
  }

  async retryDocument(documentId: string): Promise<KnowledgeDocument> {
    const row = await prisma.knowledge_documents.update({
      where: { id: documentId },
      data: { status: 'uploaded', error_message: null, retry_count: { increment: 1 } },
    });
    return this._toEntity(row);
  }

  private _toEntity(row: {
    id: string;
    workspace_id: string;
    filename: string;
    original_name: string;
    mime_type: string;
    size_bytes: number;
    storage_path: string | null;
    document_type: string;
    status: string;
    classification: unknown;
    metadata: unknown;
    error_message: string | null;
    retry_count: number;
    published_knowledge_id: string | null;
    created_by: string | null;
    created_at: Date;
    updated_at: Date;
  }): KnowledgeDocument {
    return KnowledgeDocument.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      filename: row.filename,
      originalName: row.original_name,
      mimeType: row.mime_type,
      sizeBytes: row.size_bytes,
      storagePath: row.storage_path,
      documentType: row.document_type,
      status: row.status,
      classification: row.classification,
      metadata: row.metadata,
      errorMessage: row.error_message,
      retryCount: row.retry_count,
      publishedKnowledgeId: row.published_knowledge_id,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
