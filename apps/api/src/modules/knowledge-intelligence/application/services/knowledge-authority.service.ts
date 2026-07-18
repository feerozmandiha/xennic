import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IGraphMetricsRepository } from '../../domain/interfaces/graph-metrics.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';

@Injectable()
export class KnowledgeAuthorityService {
  private readonly logger = new Logger(KnowledgeAuthorityService.name);

  constructor(
    @Inject('IGraphMetricsRepository')
    private readonly metricsRepo: IGraphMetricsRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
  ) {}

  async calculateAuthority(nodeId: string): Promise<number> {
    const incomingEdges = await this.edgeRepo.findAllByTarget(nodeId);
    const citationCount = incomingEdges.filter(
      (e) => e.type === 'cites' || e.type === 'references',
    ).length;
    const regulatesCount = incomingEdges.filter((e) => e.type === 'regulates').length;
    const authority = Math.min(1, citationCount * 0.1 + regulatesCount * 0.05 + 0.5);

    const existing = await this.metricsRepo.findByNodeId(nodeId);
    if (existing) {
      const current = existing.authority;
      const blended = (current + authority) / 2;
      await this.metricsRepo.save({
        nodeId,
        confidence: existing.confidence,
        freshness: existing.freshness,
        authority: blended,
        completeness: existing.completeness,
      });
      return blended;
    }

    await this.metricsRepo.save({
      nodeId,
      confidence: 0.5,
      freshness: 0.5,
      authority,
      completeness: 0.5,
    });
    return authority;
  }

  async rankNodes(
    workspaceId: string,
    limit = 20,
  ): Promise<{ nodeId: string; authority: number }[]> {
    const top = await this.metricsRepo.topNodesByMetric(workspaceId, 'authority', limit);
    return top.map((t) => ({ nodeId: t.nodeId, authority: t.score }));
  }
}
