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

  async findBySource(
    sourceId: string,
    method?: string,
    workspaceId?: string,
  ): Promise<KnowledgeCitation[]> {
    const scope = workspaceId ?? (await this._workspaceForNode(sourceId));
    if (!scope) return [];

    const where: any = { source_id: sourceId, workspace_id: scope };
    if (method) where.method = method;
    const rows = await prisma.knowledge_citations.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    const scopedRows = await this._inWorkspace(rows, scope);
    return scopedRows.map((r) =>
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

  async findByTarget(targetId: string, workspaceId?: string): Promise<KnowledgeCitation[]> {
    const scope = workspaceId ?? (await this._workspaceForNode(targetId));
    if (!scope) return [];

    const rows = await prisma.knowledge_citations.findMany({
      where: { target_id: targetId, workspace_id: scope },
      orderBy: { created_at: 'desc' },
    });
    const scopedRows = await this._inWorkspace(rows, scope);
    return scopedRows.map((r) =>
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
    const scopedRows = await this._inWorkspace(rows, workspaceId);
    return scopedRows.map((r) =>
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

  private async _workspaceForNode(nodeId: string): Promise<string | null> {
    const node = await prisma.knowledge_graph_nodes.findUnique({
      where: { id: nodeId },
      select: { workspace_id: true },
    });
    return node?.workspace_id ?? null;
  }

  private async _inWorkspace<T extends { source_id: string; target_id: string }>(
    rows: T[],
    workspaceId: string,
  ): Promise<T[]> {
    if (rows.length === 0) return [];

    const endpointIds = [...new Set(rows.flatMap((row) => [row.source_id, row.target_id]))];
    const nodes = await prisma.knowledge_graph_nodes.findMany({
      where: {
        workspace_id: workspaceId,
        id: { in: endpointIds },
      },
      select: { id: true },
    });
    const ownedNodeIds = new Set(nodes.map((node) => node.id));

    return rows.filter((row) => ownedNodeIds.has(row.source_id) && ownedNodeIds.has(row.target_id));
  }
}
