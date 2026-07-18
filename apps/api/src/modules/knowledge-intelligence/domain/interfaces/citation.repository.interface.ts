export interface ICitationRepository {
  findById(id: string): Promise<any | null>;
  findBySource(sourceId: string, method?: string): Promise<any[]>;
  findByTarget(targetId: string): Promise<any[]>;
  findByWorkspace(workspaceId: string, sourceId?: string, targetId?: string): Promise<any[]>;
  create(citation: {
    workspaceId: string;
    sourceId: string;
    targetId: string;
    context?: string | null;
    location?: string | null;
    method: string;
    confidence?: number;
  }): Promise<any>;
  batchCreate(
    citations: {
      workspaceId: string;
      sourceId: string;
      targetId: string;
      context?: string | null;
      location?: string | null;
      method: string;
      confidence?: number;
    }[],
  ): Promise<any[]>;
  delete(id: string): Promise<void>;
}
