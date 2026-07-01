import type { KnowledgeObject, KnowledgeStatus, KnowledgeTier } from '../knowledge-object.entity.js';

export interface KnowledgeSearchOptions {
  workspaceId: string;
  query?: string;
  status?: KnowledgeStatus;
  tier?: KnowledgeTier;
  language?: string;
  engineeringDomain?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface KnowledgeSearchResult {
  id: string;
  xid: string;
  title: string;
  slug: string;
  status: KnowledgeStatus;
  tier: KnowledgeTier;
  authorityScore: number;
  engineeringDomain?: string;
  language: string;
  createdAt: Date;
  updatedAt: Date;
  score?: number;
  highlight?: string;
}

export interface IKnowledgeObjectRepository {
  save(ko: KnowledgeObject): Promise<void>;
  update(ko: KnowledgeObject): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<KnowledgeObject | null>;
  findByXid(xid: string): Promise<KnowledgeObject | null>;
  findBySlug(slug: string): Promise<KnowledgeObject | null>;
  searchMetadata(options: KnowledgeSearchOptions): Promise<{ items: KnowledgeSearchResult[]; total: number }>;
}
