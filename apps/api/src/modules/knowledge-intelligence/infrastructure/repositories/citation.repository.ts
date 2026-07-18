import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { KnowledgeCitation } from '../../domain/entities/citation.entity.js';
import type { ICitationRepository } from '../../domain/interfaces/citation.repository.interface.js';

@Injectable()
export class CitationRepository implements ICitationRepository {
  async findById(id: string): Promise<KnowledgeCitation | null> {
    const row = await prisma.knowledge_citations.findUnique({ where: { id } });
    if (!row) return null;
    return KnowledgeCitation.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      sourceId: row.source_id,
      targetId: row.target_id,
      context: row.context,
      location: row.location,
      method: row.method as 'explicit' | 'implicit' | 'inferred',
      confidence: row.confidence,
      createdAt: row.created_at,
    });
  }

  async findBySource(sourceId: string, method?: string): Promise<KnowledgeCitation[]> {
    const where: any = { source_id: sourceId };
    if (method) where.method = method;
    const rows = await prisma.knowledge_citations.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) =>
      KnowledgeCitation.reconstitute({
        id: r.id,
        workspaceId: r.workspace_id,
        sourceId: r.source_id,
        targetId: r.target_id,
        context: r.context,
        location: r.location,
        method: r.method as 'explicit' | 'implicit' | 'inferred',
        confidence: r.confidence,
        createdAt: r.created_at,
      }),
    );
  }

  async findByTarget(targetId: string): Promise<KnowledgeCitation[]> {
    const rows = await prisma.knowledge_citations.findMany({
      where: { target_id: targetId },
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) =>
      KnowledgeCitation.reconstitute({
        id: r.id,
        workspaceId: r.workspace_id,
        sourceId: r.source_id,
        targetId: r.target_id,
        context: r.context,
        location: r.location,
        method: r.method as 'explicit' | 'implicit' | 'inferred',
        confidence: r.confidence,
        createdAt: r.created_at,
      }),
    );
  }

  async findByWorkspace(
    workspaceId: string,
    sourceId?: string,
    targetId?: string,
  ): Promise<KnowledgeCitation[]> {
    const where: any = { workspace_id: workspaceId };
    if (sourceId) where.source_id = sourceId;
    if (targetId) where.target_id = targetId;
    const rows = await prisma.knowledge_citations.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) =>
      KnowledgeCitation.reconstitute({
        id: r.id,
        workspaceId: r.workspace_id,
        sourceId: r.source_id,
        targetId: r.target_id,
        context: r.context,
        location: r.location,
        method: r.method as 'explicit' | 'implicit' | 'inferred',
        confidence: r.confidence,
        createdAt: r.created_at,
      }),
    );
  }

  async create(data: {
    workspaceId: string;
    sourceId: string;
    targetId: string;
    context?: string | null;
    location?: string | null;
    method: 'explicit' | 'implicit' | 'inferred';
    confidence?: number;
  }): Promise<KnowledgeCitation> {
    const row = await prisma.knowledge_citations.create({
      data: {
        workspace_id: data.workspaceId,
        source_id: data.sourceId,
        target_id: data.targetId,
        context: data.context ?? null,
        location: data.location ?? null,
        method: data.method,
        confidence: data.confidence ?? 1.0,
      },
    });
    return KnowledgeCitation.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      sourceId: row.source_id,
      targetId: row.target_id,
      context: row.context,
      location: row.location,
      method: row.method as 'explicit' | 'implicit' | 'inferred',
      confidence: row.confidence,
      createdAt: row.created_at,
    });
  }

  async batchCreate(
    data: {
      workspaceId: string;
      sourceId: string;
      targetId: string;
      context?: string | null;
      location?: string | null;
      method: 'explicit' | 'implicit' | 'inferred';
      confidence?: number;
    }[],
  ): Promise<KnowledgeCitation[]> {
    await prisma.knowledge_citations.createMany({
      data: data.map((d) => ({
        workspace_id: d.workspaceId,
        source_id: d.sourceId,
        target_id: d.targetId,
        context: d.context,
        location: d.location,
        method: d.method,
        confidence: d.confidence ?? 1.0,
      })),
    });
    const created = await prisma.knowledge_citations.findMany({
      where: {
        OR: data.map((d) => ({ source_id: d.sourceId, target_id: d.targetId, method: d.method })),
      },
      orderBy: { created_at: 'desc' },
    });
    return created.map((r) =>
      KnowledgeCitation.reconstitute({
        id: r.id,
        workspaceId: r.workspace_id,
        sourceId: r.source_id,
        targetId: r.target_id,
        context: r.context,
        location: r.location,
        method: r.method as 'explicit' | 'implicit' | 'inferred',
        confidence: r.confidence,
        createdAt: r.created_at,
      }),
    );
  }

  async delete(id: string): Promise<void> {
    await prisma.knowledge_citations.delete({ where: { id } });
  }
}
