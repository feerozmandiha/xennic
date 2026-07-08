import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IGraphMetricsRepository } from '../../domain/interfaces/graph-metrics.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';

@Injectable()
export class KnowledgeFreshnessService {
  private readonly logger = new Logger(KnowledgeFreshnessService.name);

  constructor(
    @Inject('IGraphMetricsRepository')
    private readonly metricsRepo: IGraphMetricsRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
  ) {}

  async calculateFreshness(nodeId: string): Promise<number> {
    const node = await this.nodeRepo.findById(nodeId);
    if (!node) return 0;

    const ageMs = Date.now() - node.updatedAt.getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);

    let freshness: number;
    if (ageDays < 7) freshness = 1.0;
    else if (ageDays < 30) freshness = 0.9;
    else if (ageDays < 90) freshness = 0.7;
    else if (ageDays < 365) freshness = 0.5;
    else freshness = 0.3;

    return Math.max(0.1, freshness);
  }

  async refreshStaleNodes(workspaceId: string, thresholdDays = 30): Promise<{ nodeId: string; stale: boolean; daysSinceUpdate: number }[]> {
    const { nodes } = await this.nodeRepo.findAllByWorkspace(workspaceId);
    const results: { nodeId: string; stale: boolean; daysSinceUpdate: number }[] = [];
    for (const node of nodes) {
      const daysSinceUpdate = (Date.now() - node.updatedAt.getTime()) / (1000 * 60 * 60 * 24);
      const stale = daysSinceUpdate > thresholdDays;
      results.push({ nodeId: node.id, stale, daysSinceUpdate });
      if (stale) {
        const freshness = await this.calculateFreshness(node.id);
        const existing = await this.metricsRepo.findByNodeId(node.id);
        await this.metricsRepo.save({
          nodeId: node.id,
          confidence: existing?.confidence ?? 0.5,
          freshness,
          authority: existing?.authority ?? 0.5,
          completeness: existing?.completeness ?? 0.5,
        });
      }
    }
    return results;
  }
}
