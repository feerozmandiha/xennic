import type { WorkspaceEntity } from '../entities/workspace.entity.js';

export interface IWorkspaceRepository {
  findById(id: string): Promise<WorkspaceEntity | null>;
  findAll(offset: number, limit: number): Promise<WorkspaceEntity[]>;
  save(workspace: WorkspaceEntity): Promise<void>;
  delete(id: string): Promise<void>;
  count(): Promise<number>;
  exists(id: string): Promise<boolean>;
}
