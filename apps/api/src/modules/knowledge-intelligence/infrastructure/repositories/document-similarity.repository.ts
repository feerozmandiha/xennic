import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { DocumentSimilarity } from '../../domain/entities/document-similarity.entity.js';
import type { IDocumentSimilarityRepository } from '../../domain/interfaces/document-similarity.repository.interface.js';

@Injectable()
export class DocumentSimilarityRepository implements IDocumentSimilarityRepository {
  async findById(id: string): Promise<DocumentSimilarity | null> {
    const row = await prisma.document_similarities.findUnique({ where: { id } });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findByPair(
    workspaceId: string,
    sourceId: string,
    targetId: string,
    method: string,
  ): Promise<DocumentSimilarity | null> {
    const row = await prisma.document_similarities.findFirst({
      where: { workspace_id: workspaceId, source_id: sourceId, target_id: targetId, method },
    });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findByWorkspace(
    workspaceId: string,
    method?: string,
    minSimilarity = 0,
    limit = 50,
  ): Promise<DocumentSimilarity[]> {
    const where: any = { workspace_id: workspaceId, similarity: { gte: minSimilarity } };
    if (method) where.method = method;
    const rows = await prisma.document_similarities.findMany({
      where,
      orderBy: { similarity: 'desc' },
      take: limit,
    });
    return rows.map((r) => this._toEntity(r));
  }

  async similarTo(
    entityId: string,
    workspaceId: string,
    method: string,
    minSimilarity: number,
    limit: number,
  ): Promise<{ entityId: string; similarity: number }[]> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT source_id as "sourceId", target_id as "targetId", similarity
      FROM document_similarities
      WHERE workspace_id = ${workspaceId}
        AND method = ${method}
        AND similarity >= ${minSimilarity}
        AND (source_id = ${entityId} OR target_id = ${entityId})
      ORDER BY similarity DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => ({
      entityId: r.sourceId === entityId ? r.targetId : r.sourceId,
      similarity: Number(r.similarity),
    }));
  }

  async create(data: {
    workspaceId: string;
    sourceId: string;
    targetId: string;
    similarity: number;
    method: string;
  }): Promise<DocumentSimilarity> {
    const row = await prisma.document_similarities.create({
      data: {
        workspace_id: data.workspaceId,
        source_id: data.sourceId,
        target_id: data.targetId,
        similarity: data.similarity,
        method: data.method,
      },
    });
    return this._toEntity(row);
  }

  async batchCreate(
    data: {
      workspaceId: string;
      sourceId: string;
      targetId: string;
      similarity: number;
      method: string;
    }[],
  ): Promise<DocumentSimilarity[]> {
    await prisma.document_similarities.createMany({
      data: data.map((d) => ({
        workspace_id: d.workspaceId,
        source_id: d.sourceId,
        target_id: d.targetId,
        similarity: d.similarity,
        method: d.method,
      })),
    });
    const created = await prisma.document_similarities.findMany({
      where: {
        OR: data.map((d) => ({ source_id: d.sourceId, target_id: d.targetId, method: d.method })),
      },
      orderBy: { computed_at: 'desc' },
    });
    return created.map((r) => this._toEntity(r));
  }

  async delete(id: string): Promise<void> {
    await prisma.document_similarities.delete({ where: { id } });
  }

  private _toEntity(row: any): DocumentSimilarity {
    return DocumentSimilarity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      sourceId: row.source_id,
      targetId: row.target_id,
      similarity: row.similarity,
      method: row.method,
      computedAt: row.computed_at,
    });
  }
}
