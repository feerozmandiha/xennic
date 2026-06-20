import type { WorkspaceSettingsEntity } from '../entities/workspace-settings.entity.js';

export interface IWorkspaceSettingsRepository {
  findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettingsEntity | null>;
  save(settings: WorkspaceSettingsEntity): Promise<void>;
}
