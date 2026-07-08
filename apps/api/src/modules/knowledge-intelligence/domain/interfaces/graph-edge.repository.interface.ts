import type { KnowledgeGraphEdge } from '../../domain/entities/graph-edge.entity.js';

export interface IGraphEdgeRepository {
  findById(id: string): Promise<KnowledgeGraphEdge | null>;
  findByNodes(sourceId: string, targetId: string, type: string): Promise<KnowledgeGraphEdge | null>;
  findAllBySource(sourceId: string, type?: string): Promise<KnowledgeGraphEdge[]>;
  findAllByTarget(targetId: string, type?: string): Promise<KnowledgeGraphEdge[]>;
  findAllByWorkspace(workspaceId: string, type?: string): Promise<KnowledgeGraphEdge[]>;
  create(edge: { workspaceId: string; sourceId: string; targetId: string; type: string; weight?: number; properties?: Record<string, unknown> }): Promise<KnowledgeGraphEdge>;
  batchCreate(edges: { workspaceId: string; sourceId: string; targetId: string; type: string; weight?: number; properties?: Record<string, unknown> }[]): Promise<KnowledgeGraphEdge[]>;
  delete(id: string): Promise<void>;
  deleteBySource(sourceId: string): Promise<void>;
  deleteByTarget(targetId: string): Promise<void>;
}
