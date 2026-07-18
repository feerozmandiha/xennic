import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IGraphMetricsRepository } from '../../domain/interfaces/graph-metrics.repository.interface.js';

@Injectable()
export class KnowledgeMetricsService {
  private readonly logger = new Logger(KnowledgeMetricsService.name);

  constructor(
    @Inject('IGraphMetricsRepository')
    private readonly metricsRepo: IGraphMetricsRepository,
  ) {}

  async computeAndSaveMetrics(
    nodeId: string,
    scores: { confidence: number; freshness: number; authority: number; completeness: number },
  ): Promise<any> {
    return this.metricsRepo.save({
      nodeId,
      confidence: scores.confidence,
      freshness: scores.freshness,
      authority: scores.authority,
      completeness: scores.completeness,
    });
  }

  async getMetrics(nodeId: string): Promise<any | null> {
    const metrics = await this.metricsRepo.findByNodeId(nodeId);
    if (!metrics) return null;
    return {
      nodeId: metrics.nodeId,
      confidence: metrics.confidence,
      freshness: metrics.freshness,
      authority: metrics.authority,
      completeness: metrics.completeness,
      compositeScore: metrics.compositeScore(),
      accessCount: metrics.accessCount,
      lastAccessedAt: metrics.lastAccessedAt,
      computedAt: metrics.computedAt,
      updatedAt: metrics.updatedAt,
    };
  }

  async recordAccess(nodeId: string): Promise<void> {
    await this.metricsRepo.incrementAccess(nodeId);
  }

  async getTopNodes(
    workspaceId: string,
    metric: string,
    limit = 10,
  ): Promise<{ nodeId: string; score: number }[]> {
    return this.metricsRepo.topNodesByMetric(workspaceId, metric as any, limit);
  }
}
