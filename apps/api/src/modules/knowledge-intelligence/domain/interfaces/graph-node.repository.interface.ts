import type { KnowledgeGraphNode } from '../../domain/entities/graph-node.entity.js';

export interface IGraphNodeRepository {
  findById(id: string): Promise<KnowledgeGraphNode | null>;
  findByEntity(entityType: string, entityId: string): Promise<KnowledgeGraphNode | null>;
  findAllByWorkspace(workspaceId: string, type?: string, offset?: number, limit?: number): Promise<{ nodes: KnowledgeGraphNode[]; total: number }>;
  create(node: { workspaceId: string; type: string; entityType: string; entityId: string; label?: string | null; properties?: Record<string, unknown>; embeddingId?: string | null }): Promise<KnowledgeGraphNode>;
  update(id: string, data: { label?: string | null; properties?: Record<string, unknown>; embeddingId?: string | null }): Promise<KnowledgeGraphNode>;
  delete(id: string): Promise<void>;
  deleteByEntity(entityType: string, entityId: string): Promise<void>;
}
