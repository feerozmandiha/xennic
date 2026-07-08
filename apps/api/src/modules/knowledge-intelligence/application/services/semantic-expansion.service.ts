import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';

@Injectable()
export class SemanticExpansionService {
  private readonly logger = new Logger(SemanticExpansionService.name);

  constructor(
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
  ) {}

  async expand(nodeId: string, maxDepth = 2): Promise<{ nodeId: string; relevance: number; edgeTypes: string[] }[]> {
    const neighbors = await this.edgeRepo.findAllBySource(nodeId);
    const expansion: { nodeId: string; relevance: number; edgeTypes: string[] }[] = [];
    const seen = new Set<string>();

    for (const edge of neighbors) {
      if (edge.targetId === nodeId) continue;
      expansion.push({ nodeId: edge.targetId, relevance: edge.weight, edgeTypes: [edge.type] });
      seen.add(edge.targetId);

      if (maxDepth > 1) {
        const secondDegree = await this.edgeRepo.findAllBySource(edge.targetId);
        for (const secondEdge of secondDegree) {
          if (secondEdge.targetId === nodeId || seen.has(secondEdge.targetId)) continue;
          seen.add(secondEdge.targetId);
          expansion.push({
            nodeId: secondEdge.targetId,
            relevance: edge.weight * secondEdge.weight * 0.5,
            edgeTypes: [edge.type, secondEdge.type],
          });
        }
      }
    }

    return expansion.sort((a, b) => b.relevance - a.relevance);
  }
}
