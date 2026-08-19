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
    const terms = [...new Set(query.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [])];
    if (terms.length === 0) return [];

    const { nodes } = await this.nodeRepo.findAllByWorkspace(workspaceId, undefined, 0, 100);
    const candidates = nodes
      .map((node) => {
        const searchableText = [
          node.label,
          node.type,
          node.entityType,
          node.entityId,
          ...Object.values(node.properties),
        ]
          .filter((value) => typeof value === 'string' || typeof value === 'number')
          .join(' ')
          .toLocaleLowerCase();
        const matchingTerms = terms.filter((term) => searchableText.includes(term)).length;
        return { node, textRelevance: matchingTerms / terms.length };
      })
      .filter((candidate) => candidate.textRelevance > 0);

    const scoredNodes = await Promise.all(
      candidates.map(async ({ node, textRelevance }) => {
        const [neighbors, citations, metrics] = await Promise.all([
          this.traversalRepo.neighbors(node.id, 'both', undefined),
          this.citationRepo.findBySource(node.id, undefined, workspaceId),
          this.metricsRepo.findByNodeId(node.id),
        ]);
        const score =
          textRelevance * 0.7 +
          Math.min(neighbors.length / 20, 1) * 0.1 +
          Math.min(citations.length / 10, 1) * 0.05 +
          Math.max(0, Math.min(metrics?.compositeScore() ?? 0, 1)) * 0.15;

        return { node, score, neighbors, citations };
      }),
    );

    return scoredNodes
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
      .map((result) => ({
        id: result.node.id,
        label: result.node.label,
        type: result.node.type,
        entityType: result.node.entityType,
        entityId: result.node.entityId,
        score: result.score,
        neighbors: result.neighbors.length,
        citations: result.citations.length,
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
