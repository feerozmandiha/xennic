import type { GraphNode, GraphEdge, GraphPath } from '../types/ei.types.js';

export interface IKnowledgeGraphService {
  getNode(nodeId: string): Promise<GraphNode | null>;
  expandRelations(nodeId: string, depth?: number): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
  shortestPath(source: string, target: string): Promise<GraphPath | null>;
  neighborhoodSearch(nodeId: string, radius?: number): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
  traverseByType(type: string, limit?: number): Promise<GraphNode[]>;
  semanticExpand(concept: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }>;
}
