import type { KnowledgeEntity } from '../entities/knowledge.entity.js';

export interface KnowledgeSearchParams {
  query?: string;
  status?: string;
  visibility?: string;
  language?: string;
  difficulty?: string;
  taxonomyType?: string;
  taxonomyId?: string;
  authorId?: string;
  offset?: number;
  limit?: number;
}

export interface KnowledgeSearchResult {
  data: KnowledgeEntity[];
  total: number;
}

export interface IKnowledgeRepository {
  findById(id: string): Promise<KnowledgeEntity | null>;
  findBySlug(workspaceId: string, slug: string): Promise<KnowledgeEntity | null>;
  findAll(workspaceId: string, offset: number, limit: number, status?: string): Promise<KnowledgeEntity[]>;
  count(workspaceId: string, status?: string): Promise<number>;
  search(workspaceId: string, params: KnowledgeSearchParams): Promise<KnowledgeSearchResult>;
  save(entity: KnowledgeEntity): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}
