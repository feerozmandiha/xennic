import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ITraversalResult } from '../../domain/interfaces/graph-traversal.repository.interface.js';
import type { IGraphTraversalRepository } from '../../domain/interfaces/graph-traversal.repository.interface.js';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';

@Injectable()
export class GraphTraversalService {
  private readonly logger = new Logger(GraphTraversalService.name);

  constructor(
    @Inject('IGraphTraversalRepository')
    private readonly traversalRepo: IGraphTraversalRepository,
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
  ) {}

  async findShortestPath(sourceNodeId: string, targetNodeId: string, maxDepth = 10): Promise<ITraversalResult | null> {
    this.logger.debug(`Finding shortest path: ${sourceNodeId} -> ${targetNodeId}`);
    return this.traversalRepo.shortestPath(sourceNodeId, targetNodeId, maxDepth);
  }

  async findAllPaths(sourceNodeId: string, targetNodeId: string, maxDepth = 6, maxPaths = 20): Promise<ITraversalResult[]> {
    return this.traversalRepo.allPaths(sourceNodeId, targetNodeId, maxDepth, maxPaths);
  }

  async getAncestors(nodeId: string, maxDepth = 10): Promise<{ nodeId: string; distance: number; edgeType: string }[]> {
    return this.traversalRepo.ancestors(nodeId, maxDepth);
  }

  async getDescendants(nodeId: string, maxDepth = 10): Promise<{ nodeId: string; distance: number; edgeType: string }[]> {
    return this.traversalRepo.descendants(nodeId, maxDepth);
  }

  async getNeighbors(nodeId: string, direction: 'in' | 'out' | 'both', edgeType?: string): Promise<{ nodeId: string; edgeType: string; weight: number }[]> {
    return this.traversalRepo.neighbors(nodeId, direction, edgeType);
  }

  async getSubgraph(nodeIds: string[]): Promise<{ nodes: any[]; edges: any[] }> {
    return this.traversalRepo.subgraph(nodeIds);
  }

  async getConnectedComponents(workspaceId: string): Promise<string[][]> {
    return this.traversalRepo.connectedComponents(workspaceId);
  }

  async getDependencySubgraph(nodeId: string, direction: 'upstream' | 'downstream' | 'both', maxDepth = 10): Promise<{ nodes: string[]; edges: any[] }> {
    return this.traversalRepo.dependencySubgraph(nodeId, direction, maxDepth);
  }

  async getSemanticExpansion(nodeId: string, maxDepth = 3, edgeTypeWeight?: Record<string, number>): Promise<{ nodeId: string; score: number }[]> {
    const weights = edgeTypeWeight ?? { related_to: 1.0, references: 0.8, cites: 0.9, part_of: 0.7, supersedes: 1.2, equivalent_to: 1.5 };
    return this.traversalRepo.semanticExpansion(nodeId, maxDepth, weights);
  }
}
