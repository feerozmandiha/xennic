import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IGraphMetricsRepository } from '../../domain/interfaces/graph-metrics.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';

@Injectable()
export class KnowledgeConfidenceService {
  private readonly logger = new Logger(KnowledgeConfidenceService.name);

  constructor(
    @Inject('IGraphMetricsRepository')
    private readonly metricsRepo: IGraphMetricsRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
  ) {}

  async calculateConfidence(nodeId: string): Promise<number> {
    const node = await this.nodeRepo.findById(nodeId);
    if (!node) return 0;

    let confidence = 0.5;
    if (node.properties && Object.keys(node.properties).length >= 3) confidence += 0.1;
    if (node.embeddingId) confidence += 0.1;

    const incomingEdges = await this.edgeRepo.findAllByTarget(nodeId);
    if (incomingEdges.length > 0) {
      const avgWeight = incomingEdges.reduce((sum, e) => sum + e.weight, 0) / incomingEdges.length;
      confidence += Math.min(0.3, avgWeight * 0.1);
    }

    return Math.min(1, confidence);
  }

  async batchComputeConfidence(workspaceId: string): Promise<{ nodeId: string; confidence: number }[]> {
    const { nodes } = await this.nodeRepo.findAllByWorkspace(workspaceId);
    const results: { nodeId: string; confidence: number }[] = [];
    for (const node of nodes) {
      const confidence = await this.calculateConfidence(node.id);
      const existing = await this.metricsRepo.findByNodeId(node.id);
      await this.metricsRepo.save({
        nodeId: node.id,
        confidence,
        freshness: existing?.freshness ?? 0.5,
        authority: existing?.authority ?? 0.5,
        completeness: existing?.completeness ?? 0.5,
      });
      results.push({ nodeId: node.id, confidence });
    }
    return results;
  }
}
