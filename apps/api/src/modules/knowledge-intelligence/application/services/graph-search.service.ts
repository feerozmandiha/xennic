import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IGraphTraversalRepository } from '../../domain/interfaces/graph-traversal.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';
import type { ICitationRepository } from '../../domain/interfaces/citation.repository.interface.js';
import type { IDocumentSimilarityRepository } from '../../domain/interfaces/document-similarity.repository.interface.js';
import type { IGraphMetricsRepository } from '../../domain/interfaces/graph-metrics.repository.interface.js';

@Injectable()
export class GraphSearchService {
  private readonly logger = new Logger(GraphSearchService.name);

  constructor(
    @Inject('IGraphTraversalRepository')
    private readonly traversalRepo: IGraphTraversalRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
    @Inject('ICitationRepository')
    private readonly citationRepo: ICitationRepository,
    @Inject('IDocumentSimilarityRepository')
    private readonly similarityRepo: IDocumentSimilarityRepository,
    @Inject('IGraphMetricsRepository')
    private readonly metricsRepo: IGraphMetricsRepository,
  ) {}

  async semanticSearch(
    workspaceId: string,
    query: string,
    _userContext?: { userId?: string; permissions?: string[] },
  ): Promise<any[]> {
    const { nodes } = await this.nodeRepo.findAllByWorkspace(workspaceId, undefined, 0, 100);
    const scoredNodes = await Promise.all(
      nodes.map(async (node) => {
        const neighbors = await this.traversalRepo.neighbors(node.id, 'both', undefined);
        const citations = await this.citationRepo.findBySource(node.id);
        const metrics = await this.metricsRepo.findByNodeId(node.id);

        let score = 0;
        if (
          node.label &&
          query.split(' ').some((term) => node.label!.toLowerCase().includes(term.toLowerCase()))
        ) {
          score += 0.5;
        }
        score += neighbors.length * 0.05;
        score += citations.length * 0.1;
        score += metrics?.compositeScore() ?? 0.5;

        return { node, score, neighbors, citations };
      }),
    );

    const filtered = scoredNodes.filter((r) => r.score > 0.3).sort((a, b) => b.score - a.score);
    return filtered.slice(0, 20).map((r) => ({
      id: r.node.id,
      label: r.node.label,
      type: r.node.type,
      entityType: r.node.entityType,
      entityId: r.node.entityId,
      score: r.score,
      neighbors: r.neighbors.length,
      citations: r.citations.length,
    }));
  }

  async relatedDocuments(nodeId: string, maxResults = 10): Promise<any[]> {
    const expansion = await this.traversalRepo.semanticExpansion(nodeId, 2, {});

    const results = [];
    for (const item of expansion.slice(0, maxResults)) {
      const node = await this.nodeRepo.findById(item.nodeId);
      if (!node) continue;
      const edges = await this.edgeRepo.findAllBySource(nodeId);
      const directEdge = edges.find((e) => e.targetId === item.nodeId);
      results.push({
        id: node.id,
        label: node.label,
        type: node.type,
        entityType: node.entityType,
        entityId: node.entityId,
        relevance: item.score,
        connection: directEdge?.type ?? null,
      });
    }

    return results;
  }
}
