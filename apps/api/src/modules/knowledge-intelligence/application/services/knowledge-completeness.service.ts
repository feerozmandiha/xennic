import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IGraphMetricsRepository } from '../../domain/interfaces/graph-metrics.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';

@Injectable()
export class KnowledgeCompletenessService {
  private readonly logger = new Logger(KnowledgeCompletenessService.name);

  constructor(
    @Inject('IGraphMetricsRepository')
    private readonly metricsRepo: IGraphMetricsRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
  ) {}

  async calculateCompleteness(nodeId: string): Promise<number> {
    const node = await this.nodeRepo.findById(nodeId);
    if (!node) return 0;

    let score = 0;
    if (node.label) score += 0.2;
    if (node.properties && Object.keys(node.properties).length > 0) score += 0.3;
    if (node.embeddingId) score += 0.2;
    if (node.entityId) score += 0.1;

    const outgoingEdges = await this.nodeRepo.findById(nodeId);
    if (outgoingEdges && outgoingEdges.properties) {
      const props = outgoingEdges.properties as Record<string, unknown>;
      if (Object.keys(props).length >= 5) score += 0.2;
    }

    return Math.min(1, score);
  }

  async analyzeWorkspaceCompleteness(
    workspaceId: string,
  ): Promise<{ average: number; nodes: number; completeNodes: number; incompleteNodes: number }> {
    const { nodes } = await this.nodeRepo.findAllByWorkspace(workspaceId);
    if (nodes.length === 0) return { average: 0, nodes: 0, completeNodes: 0, incompleteNodes: 0 };

    let total = 0;
    let complete = 0;
    let incomplete = 0;

    for (const node of nodes) {
      const c = await this.calculateCompleteness(node.id);
      total += c;
      if (c >= 0.8) complete++;
      else incomplete++;
      const existing = await this.metricsRepo.findByNodeId(node.id);
      await this.metricsRepo.save({
        nodeId: node.id,
        confidence: existing?.confidence ?? 0.5,
        freshness: existing?.freshness ?? 0.5,
        authority: existing?.authority ?? 0.5,
        completeness: c,
      });
    }

    return {
      average: total / nodes.length,
      nodes: nodes.length,
      completeNodes: complete,
      incompleteNodes: incomplete,
    };
  }
}
