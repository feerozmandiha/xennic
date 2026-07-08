import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IGraphNodeRepository } from '../../domain/interfaces/graph-node.repository.interface.js';
import type { IGraphEdgeRepository } from '../../domain/interfaces/graph-edge.repository.interface.js';
import type { IGraphTraversalRepository } from '../../domain/interfaces/graph-traversal.repository.interface.js';

@Injectable()
export class DependencyResolutionService {
  private readonly logger = new Logger(DependencyResolutionService.name);

  constructor(
    @Inject('IGraphNodeRepository')
    private readonly nodeRepo: IGraphNodeRepository,
    @Inject('IGraphEdgeRepository')
    private readonly edgeRepo: IGraphEdgeRepository,
    @Inject('IGraphTraversalRepository')
    private readonly traversalRepo: IGraphTraversalRepository,
  ) {}

  async resolveUpstream(nodeId: string, maxDepth = 10): Promise<{ nodeId: string; distance: number; edgeType: string }[]> {
    return this.traversalRepo.ancestors(nodeId, maxDepth);
  }

  async resolveDownstream(nodeId: string, maxDepth = 10): Promise<{ nodeId: string; distance: number; edgeType: string }[]> {
    return this.traversalRepo.descendants(nodeId, maxDepth);
  }

  async resolveFullDependencyGraph(nodeId: string, maxDepth = 5): Promise<{ nodes: string[]; edges: any[] }> {
    return this.traversalRepo.dependencySubgraph(nodeId, 'both', maxDepth);
  }

  async detectCircularDependencies(nodeId: string, maxDepth = 10): Promise<string[][]> {
    const paths = await this.traversalRepo.allPaths(nodeId, nodeId, maxDepth, 50);
    return paths.map((p) => p.path);
  }

  async getCriticalPath(nodeIds: string[]): Promise<{ ordered: string[]; critical: string | null; bottlenecks: string[] }> {
    if (nodeIds.length <= 1) {
      return { ordered: nodeIds, critical: nodeIds[0] ?? null, bottlenecks: [] };
    }

    const firstNode = nodeIds[0] ? await this.nodeRepo.findById(nodeIds[0]) : null;
    const edges = firstNode ? await this.edgeRepo.findAllByWorkspace(firstNode.workspaceId, 'depends_on') : [];
    const edgeMap = new Map<string, { source: string; target: string; weight: number }[]>();
    for (const edge of edges) {
      if (!edgeMap.has(edge.sourceId)) edgeMap.set(edge.sourceId, []);
      edgeMap.get(edge.sourceId)!.push({ source: edge.sourceId, target: edge.targetId, weight: edge.weight });
    }

    const indegree = new Map<string, number>();
    const outdegree = new Map<string, number>();
    for (const id of nodeIds) {
      indegree.set(id, 0);
      outdegree.set(id, 0);
    }
    for (const id of nodeIds) {
      for (const e of edgeMap.get(id) ?? []) {
        if (nodeIds.includes(e.target)) {
          indegree.set(e.target, (indegree.get(e.target) ?? 0) + 1);
          outdegree.set(id, (outdegree.get(id) ?? 0) + 1);
        }
      }
    }

    const bottlenecks = [...indegree.entries()]
      .filter(([, deg]) => deg > 2)
      .map(([id]) => id);

    let critical: string | null = nodeIds[0] ?? null;
    let maxCumulative = 0;
    for (const id of nodeIds) {
      const deps = (await this.traversalRepo.ancestors(id, 5)).length;
      if (deps > maxCumulative) {
        maxCumulative = deps;
        critical = id;
      }
    }

    return { ordered: nodeIds, critical, bottlenecks };
  }
}
