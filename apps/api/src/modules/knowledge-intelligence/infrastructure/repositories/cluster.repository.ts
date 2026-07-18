import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { KnowledgeCluster } from '../../domain/entities/cluster.entity.js';
import type { IClusterRepository } from '../../domain/interfaces/cluster.repository.interface.js';

@Injectable()
export class ClusterRepository implements IClusterRepository {
  async findById(id: string): Promise<KnowledgeCluster | null> {
    const row = await prisma.knowledge_clusters.findUnique({ where: { id } });
    if (!row) return null;
    return this._toEntity(row);
  }

  async findByWorkspace(workspaceId: string): Promise<KnowledgeCluster[]> {
    const rows = await prisma.knowledge_clusters.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) => this._toEntity(r));
  }

  async create(data: {
    workspaceId: string;
    name: string;
    description?: string | null;
    nodeIds: string[];
    properties?: Record<string, unknown>;
  }): Promise<KnowledgeCluster> {
    const row = await prisma.knowledge_clusters.create({
      data: {
        workspace_id: data.workspaceId,
        name: data.name,
        description: data.description ?? null,
        node_ids: data.nodeIds,
        properties: data.properties ?? {},
      },
    });
    return this._toEntity(row);
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      nodeIds?: string[];
      properties?: Record<string, unknown>;
    },
  ): Promise<KnowledgeCluster> {
    const row = await prisma.knowledge_clusters.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.nodeIds !== undefined && { node_ids: data.nodeIds }),
        ...(data.properties !== undefined && { properties: data.properties }),
      },
    });
    return this._toEntity(row);
  }

  async delete(id: string): Promise<void> {
    await prisma.knowledge_clusters.delete({ where: { id } });
  }

  private _toEntity(row: any): KnowledgeCluster {
    return KnowledgeCluster.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      name: row.name,
      description: row.description,
      nodeIds: Array.isArray(row.node_ids) ? row.node_ids : [],
      properties: typeof row.properties === 'object' ? row.properties : {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
