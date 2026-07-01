import { Injectable, Logger } from '@nestjs/common';
import type { IKnowledgeGraphService } from '../../domain/interfaces/knowledge-graph.interface.js';
import type { GraphNode, GraphEdge, GraphPath } from '../../domain/types/ei.types.js';

@Injectable()
export class KnowledgeGraphService implements IKnowledgeGraphService {
  private readonly logger = new Logger(KnowledgeGraphService.name);
  private readonly nodes = new Map<string, GraphNode>();
  private readonly edges: GraphEdge[] = [];

  async getNode(nodeId: string): Promise<GraphNode | null> {
    return this.nodes.get(nodeId) ?? null;
  }

  async expandRelations(nodeId: string, depth = 1): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const result: GraphNode[] = [];
    const visited = new Set<string>();
    const queue: Array<{ id: string; d: number }> = [{ id: nodeId, d: 0 }];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current.id) || current.d > depth) continue;
      visited.add(current.id);

      const node = this.nodes.get(current.id);
      if (node) result.push(node);

      const connected = this.edges.filter((e) => e.source === current.id || e.target === current.id);
      for (const edge of connected) {
        const nextId = edge.source === current.id ? edge.target : edge.source;
        if (!visited.has(nextId) && current.d < depth) {
          queue.push({ id: nextId, d: current.d + 1 });
        }
      }
    }

    return {
      nodes: result,
      edges: this.edges.filter((e) => visited.has(e.source) && visited.has(e.target)),
    };
  }

  async shortestPath(source: string, target: string): Promise<GraphPath | null> {
    const queue: Array<{ id: string; path: GraphNode[]; edges: GraphEdge[]; weight: number }> = [
      { id: source, path: [], edges: [], weight: 0 },
    ];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current.id === target) {
        return { nodes: current.path, edges: current.edges, totalWeight: current.weight };
      }
      if (visited.has(current.id)) continue;
      visited.add(current.id);

      const node = this.nodes.get(current.id);
      if (node) current.path = [...current.path, node];

      const connected = this.edges.filter((e) => e.source === current.id && !visited.has(e.target));
      for (const edge of connected) {
        const targetNode = this.nodes.get(edge.target);
        queue.push({
          id: edge.target,
          path: [...current.path, targetNode!],
          edges: [...current.edges, edge],
          weight: current.weight + (edge.weight ?? 1),
        });
      }
    }

    return null;
  }

  async neighborhoodSearch(nodeId: string, radius = 1): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    return this.expandRelations(nodeId, radius);
  }

  async traverseByType(type: string, limit = 100): Promise<GraphNode[]> {
    return [...this.nodes.values()].filter((n) => n.type === type).slice(0, limit);
  }

  async semanticExpand(concept: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
    const matches = [...this.nodes.values()].filter(
      (n) => n.label.toLowerCase().includes(concept.toLowerCase()),
    );
    const result = new Set<string>();
    for (const match of matches) {
      const expanded = await this.expandRelations(match.id, 1);
      expanded.nodes.forEach((n) => result.add(n.id));
    }
    const nodeIds = [...result];
    return {
      nodes: nodeIds.map((id) => this.nodes.get(id)!).filter(Boolean),
      edges: this.edges.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target)),
    };
  }
}
