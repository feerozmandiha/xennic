import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { KnowledgeGraphMetrics } from '../../domain/entities/graph-metrics.entity.js';
import type { IGraphMetricsRepository } from '../../domain/interfaces/graph-metrics.repository.interface.js';

@Injectable()
export class GraphMetricsRepository implements IGraphMetricsRepository {
  async findByNodeId(nodeId: string): Promise<KnowledgeGraphMetrics | null> {
    const row = await prisma.knowledge_graph_metrics.findUnique({ where: { node_id: nodeId } });
    if (!row) return null;
    return this._toEntity(row);
  }

  async save(data: {
    nodeId: string;
    confidence: number;
    freshness: number;
    authority: number;
    completeness: number;
    accessCount?: number;
    lastAccessedAt?: Date | null;
  }): Promise<KnowledgeGraphMetrics> {
    const row = await prisma.knowledge_graph_metrics.upsert({
      where: { node_id: data.nodeId },
      update: {
        confidence: data.confidence,
        freshness: data.freshness,
        authority: data.authority,
        completeness: data.completeness,
        access_count: data.accessCount ?? 0,
        last_accessed_at: data.lastAccessedAt ?? null,
        updated_at: new Date(),
      },
      create: {
        node_id: data.nodeId,
        confidence: data.confidence,
        freshness: data.freshness,
        authority: data.authority,
        completeness: data.completeness,
        access_count: data.accessCount ?? 0,
        last_accessed_at: data.lastAccessedAt ?? null,
      },
    });
    return this._toEntity(row);
  }

  async incrementAccess(nodeId: string): Promise<void> {
    await prisma.knowledge_graph_metrics.update({
      where: { node_id: nodeId },
      data: {
        access_count: { increment: 1 },
        last_accessed_at: new Date(),
        updated_at: new Date(),
      },
    });
  }

  async topNodesByMetric(
    workspaceId: string,
    metric: 'confidence' | 'freshness' | 'authority' | 'completeness',
    limit: number,
  ): Promise<{ nodeId: string; score: number }[]> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT m.node_id, m.${metric} as score
      FROM knowledge_graph_metrics m
      JOIN knowledge_graph_nodes n ON n.id = m.node_id
      WHERE n.workspace_id = ${workspaceId}
      ORDER BY m.${metric} DESC
      LIMIT ${limit}
    `;
    return rows.map((r) => ({ nodeId: r.node_id, score: Number(r.score) }));
  }

  private _toEntity(row: any): KnowledgeGraphMetrics {
    return KnowledgeGraphMetrics.reconstitute({
      id: row.id,
      nodeId: row.node_id,
      confidence: row.confidence,
      freshness: row.freshness,
      authority: row.authority,
      completeness: row.completeness,
      accessCount: row.access_count,
      lastAccessedAt: row.last_accessed_at,
      computedAt: row.computed_at,
      updatedAt: row.updated_at,
    });
  }
}
