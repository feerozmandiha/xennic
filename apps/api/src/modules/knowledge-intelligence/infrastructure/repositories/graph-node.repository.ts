import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { KnowledgeGraphNode } from '../../domain/entities/graph-node.entity.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { NodeType } from '../../domain/value-objects/node-type.vo.js';
import type { EntityType } from '../../domain/value-objects/entity-type.vo.js';

@Injectable()
export class GraphNodeRepository implements IGraphNodeRepository {
  async findById(id: string): Promise<KnowledgeGraphNode | null> {
    const row = await prisma.knowledge_graph_nodes.findUnique({ where: { id } });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findByEntity(entityType: string, entityId: string): Promise<KnowledgeGraphNode | null> {
    const row = await prisma.knowledge_graph_nodes.findFirst({
      where: { entity_type: entityType as EntityType, entity_id: entityId },
    });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findAllByWorkspace(
    workspaceId: string,
    type?: string,
    offset = 0,
    limit = 50,
  ): Promise<{ nodes: KnowledgeGraphNode[]; total: number }> {
    const where: any = { workspace_id: workspaceId };
    if (type) where.type = type;

    const [nodes, total] = await Promise.all([
      prisma.knowledge_graph_nodes.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { updated_at: 'desc' },
      }),
      prisma.knowledge_graph_nodes.count({ where }),
    ]);

    return {
      nodes: nodes.map((r) => this._toEntity(r)),
      total,
    };
  }

  async create(data: {
    workspaceId: string;
    type: string;
    entityType: string;
    entityId: string;
    label?: string | null;
    properties?: Record<string, unknown>;
    embeddingId?: string | null;
  }): Promise<KnowledgeGraphNode> {
    const node = await prisma.knowledge_graph_nodes.create({
      data: {
        workspace_id: data.workspaceId,
        type: data.type as NodeType,
        entity_type: data.entityType as EntityType,
        entity_id: data.entityId,
        label: data.label ?? null,
        properties: data.properties ?? {},
        embedding_id: data.embeddingId ?? null,
      },
    });
    return this._toEntity(node);
  }

  async update(
    id: string,
    data: {
      label?: string | null;
      properties?: Record<string, unknown>;
      embeddingId?: string | null;
    },
  ): Promise<KnowledgeGraphNode> {
    const node = await prisma.knowledge_graph_nodes.update({
      where: { id },
      data: {
        ...(data.label !== undefined && { label: data.label }),
        ...(data.properties !== undefined && { properties: data.properties }),
        ...(data.embeddingId !== undefined && { embedding_id: data.embeddingId }),
      },
    });
    return this._toEntity(node);
  }

  async delete(id: string): Promise<void> {
    await prisma.knowledge_graph_nodes.delete({ where: { id } });
  }

  async deleteByEntity(entityType: string, entityId: string): Promise<void> {
    await prisma.knowledge_graph_nodes.deleteMany({
      where: { entity_type: entityType, entity_id: entityId },
    });
  }

  private _toEntity(row: any): KnowledgeGraphNode {
    return KnowledgeGraphNode.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      type: row.type,
      entityType: row.entity_type,
      entityId: row.entity_id,
      label: row.label ?? null,
      properties: typeof row.properties === 'object' ? row.properties : {},
      embeddingId: row.embedding_id ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
