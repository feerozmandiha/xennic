export interface IDocumentSimilarityRepository {
  findById(id: string): Promise<any | null>;
  findByPair(workspaceId: string, sourceId: string, targetId: string, method: string): Promise<any | null>;
  findByWorkspace(workspaceId: string, method?: string, minSimilarity?: number, limit?: number): Promise<any[]>;
  similarTo(entityId: string, workspaceId: string, method: string, minSimilarity: number, limit: number): Promise<{ entityId: string; similarity: number }[]>;
  create(similarity: { workspaceId: string; sourceId: string; targetId: string; similarity: number; method: string }): Promise<any>;
  batchCreate(similarities: { workspaceId: string; sourceId: string; targetId: string; similarity: number; method: string }[]): Promise<any[]>;
  delete(id: string): Promise<void>;
}
