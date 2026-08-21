import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { KnowledgeGraphEdge } from '../../domain/entities/graph-edge.entity.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';
import type { EdgeType } from '../../domain/value-objects/edge-type.vo.js';

@Injectable()
export class GraphEdgeRepository implements IGraphEdgeRepository {
  async findById(id: string): Promise<KnowledgeGraphEdge | null> {
    const row = await prisma.knowledge_graph_edges.findUnique({ where: { id } });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findByNodes(
    sourceId: string,
    targetId: string,
    type: string,
  ): Promise<KnowledgeGraphEdge | null> {
    const workspaceId = await this._workspaceForNode(sourceId);
    if (!workspaceId) return null;

    const row = await prisma.knowledge_graph_edges.findFirst({
      where: {
        source_id: sourceId,
        target_id: targetId,
        type: type as EdgeType,
        workspace_id: workspaceId,
        target: { workspace_id: workspaceId },
      },
    });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findAllBySource(
    sourceId: string,
    type?: string,
    workspaceId?: string,
  ): Promise<KnowledgeGraphEdge[]> {
    const scopedWorkspaceId = workspaceId ?? (await this._workspaceForNode(sourceId));
    if (!scopedWorkspaceId) return [];

    const where: any = {
      source_id: sourceId,
      workspace_id: scopedWorkspaceId,
      target: { workspace_id: scopedWorkspaceId },
    };
    if (type) where.type = type as EdgeType;
    const rows = await prisma.knowledge_graph_edges.findMany({
      where,
      orderBy: { weight: 'desc' },
    });
    return rows.map((r) => this._toEntity(r));
  }

  async findAllByTarget(
    targetId: string,
    type?: string,
    workspaceId?: string,
  ): Promise<KnowledgeGraphEdge[]> {
    const scopedWorkspaceId = workspaceId ?? (await this._workspaceForNode(targetId));
    if (!scopedWorkspaceId) return [];

    const where: any = {
      target_id: targetId,
      workspace_id: scopedWorkspaceId,
      source: { workspace_id: scopedWorkspaceId },
    };
    if (type) where.type = type as EdgeType;
    const rows = await prisma.knowledge_graph_edges.findMany({
      where,
      orderBy: { weight: 'desc' },
    });
    return rows.map((r) => this._toEntity(r));
  }

  async findAllByWorkspace(workspaceId: string, type?: string): Promise<KnowledgeGraphEdge[]> {
    const where: any = {
      workspace_id: workspaceId,
      source: { workspace_id: workspaceId },
      target: { workspace_id: workspaceId },
    };
    if (type) where.type = type as EdgeType;
    const rows = await prisma.knowledge_graph_edges.findMany({ where });
    return rows.map((r) => this._toEntity(r));
  }

  async create(data: {
    workspaceId: string;
    sourceId: string;
    targetId: string;
    type: string;
    weight?: number;
    properties?: Record<string, unknown>;
  }): Promise<KnowledgeGraphEdge> {
    const edge = await prisma.knowledge_graph_edges.create({
      data: {
        workspace_id: data.workspaceId,
        source_id: data.sourceId,
        target_id: data.targetId,
        type: data.type as EdgeType,
        weight: data.weight ?? 1.0,
        properties: data.properties ?? {},
      },
    });
    return this._toEntity(edge);
  }

  async batchCreate(
    data: {
      workspaceId: string;
      sourceId: string;
      targetId: string;
      type: string;
      weight?: number;
      properties?: Record<string, unknown>;
    }[],
  ): Promise<KnowledgeGraphEdge[]> {
    const edges = data.map((d) => ({
      workspace_id: d.workspaceId,
      source_id: d.sourceId,
      target_id: d.targetId,
      type: d.type as EdgeType,
      weight: d.weight ?? 1.0,
      properties: d.properties ?? {},
    }));
    await prisma.knowledge_graph_edges.createMany({ data: edges });
    const created = await prisma.knowledge_graph_edges.findMany({
      where: {
        OR: data.map((d) => ({
          source_id: d.sourceId,
          target_id: d.targetId,
          type: d.type as EdgeType,
        })),
      },
      orderBy: { created_at: 'desc' },
    });
    return created.map((r) => this._toEntity(r));
  }

  async delete(id: string): Promise<void> {
    await prisma.knowledge_graph_edges.delete({ where: { id } });
  }

  async deleteBySource(sourceId: string): Promise<void> {
    await prisma.knowledge_graph_edges.deleteMany({ where: { source_id: sourceId } });
  }

  async deleteByTarget(targetId: string): Promise<void> {
    await prisma.knowledge_graph_edges.deleteMany({ where: { target_id: targetId } });
  }

  private async _workspaceForNode(nodeId: string): Promise<string | null> {
    const node = await prisma.knowledge_graph_nodes.findUnique({
      where: { id: nodeId },
      select: { workspace_id: true },
    });
    return node?.workspace_id ?? null;
  }

  private _toEntity(row: any): KnowledgeGraphEdge {
    return KnowledgeGraphEdge.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      sourceId: row.source_id,
      targetId: row.target_id,
      type: row.type,
      weight: row.weight,
      properties: typeof row.properties === 'object' ? row.properties : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
