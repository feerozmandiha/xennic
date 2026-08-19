import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { KnowledgeGraphMetrics } from '../../domain/entities/graph-metrics.entity.js';
import type { IGraphMetricsRepository } from '../../domain/interfaces/graph-metrics.repository.interface.js';

type GraphMetricRankingRow = {
  node_id: string;
  confidence: number;
  freshness: number;
  authority: number;
  completeness: number;
  node: { label: string | null };
};

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
        ...(data.accessCount !== undefined && { access_count: data.accessCount }),
        ...(data.lastAccessedAt !== undefined && { last_accessed_at: data.lastAccessedAt }),
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
  ): Promise<{ nodeId: string; score: number; label: string | null }[]> {
    const parsedLimit = Number(limit);
    const boundedLimit = Number.isFinite(parsedLimit)
      ? Math.max(1, Math.min(Math.trunc(parsedLimit), 100))
      : 10;
    const orderBy = {
      confidence: { confidence: 'desc' as const },
      freshness: { freshness: 'desc' as const },
      authority: { authority: 'desc' as const },
      completeness: { completeness: 'desc' as const },
    }[metric];

    const rows = await prisma.knowledge_graph_metrics.findMany({
      where: { node: { workspace_id: workspaceId } },
      orderBy,
      take: boundedLimit,
      select: {
        node_id: true,
        confidence: true,
        freshness: true,
        authority: true,
        completeness: true,
        node: { select: { label: true } },
      },
    });

    return rows.map((row: GraphMetricRankingRow) => ({
      nodeId: row.node_id,
      score: Number(row[metric]),
      label: row.node.label,
    }));
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
