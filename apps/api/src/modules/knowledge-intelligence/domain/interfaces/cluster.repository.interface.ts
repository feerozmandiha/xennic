export interface IClusterRepository {
  findById(id: string): Promise<any | null>;
  findByWorkspace(workspaceId: string): Promise<any[]>;
  create(cluster: { workspaceId: string; name: string; description?: string | null; nodeIds: string[]; properties?: Record<string, unknown> }): Promise<any>;
  update(id: string, data: { name?: string; description?: string | null; nodeIds?: string[]; properties?: Record<string, unknown> }): Promise<any>;
  delete(id: string): Promise<void>;
}
