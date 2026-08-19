import { Injectable, Inject } from '@nestjs/common';
import type { KnowledgeGraphNode } from '../../domain/entities/graph-node.entity.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';

@Injectable()
export class KnowledgeCompletenessService {
  constructor(
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
  ) {}

  async calculateCompleteness(nodeId: string): Promise<number> {
    const node = await this.nodeRepo.findById(nodeId);
    return node ? this.scoreNode(node) : 0;
  }

  async analyzeWorkspaceCompleteness(
    workspaceId: string,
  ): Promise<{ average: number; nodes: number; completeNodes: number; incompleteNodes: number }> {
    const { nodes } = await this.nodeRepo.findAllByWorkspace(workspaceId);
    if (nodes.length === 0) {
      return { average: 0, nodes: 0, completeNodes: 0, incompleteNodes: 0 };
    }

    let total = 0;
    let completeNodes = 0;

    for (const node of nodes) {
      const completeness = this.scoreNode(node);
      total += completeness;
      if (completeness >= 0.8) completeNodes++;
    }

    return {
      average: total / nodes.length,
      nodes: nodes.length,
      completeNodes,
      incompleteNodes: nodes.length - completeNodes,
    };
  }

  private scoreNode(node: KnowledgeGraphNode): number {
    let score = 0;
    if (node.label) score += 0.2;
    if (Object.keys(node.properties).length > 0) score += 0.3;
    if (node.embeddingId) score += 0.2;
    if (node.entityId) score += 0.1;
    if (Object.keys(node.properties).length >= 5) score += 0.2;

    return Math.min(1, score);
  }
}
