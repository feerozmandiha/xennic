import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IWorkspaceSettingsRepository } from '../../domain/interfaces/workspace-settings.repository.interface.js';
import { WorkspaceSettingsEntity } from '../../domain/entities/workspace-settings.entity.js';

@Injectable()
export class WorkspaceSettingsRepository implements IWorkspaceSettingsRepository {
  async findByWorkspaceId(workspaceId: string): Promise<WorkspaceSettingsEntity | null> {
    const row = await prisma.workspace_settings.findUnique({
      where: { workspace_id: workspaceId },
    });

    if (!row) return null;

    return WorkspaceSettingsEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      settings: row.settings as Record<string, unknown>,
      updatedAt: row.updated_at,
    });
  }

  async save(entity: WorkspaceSettingsEntity): Promise<void> {
    await prisma.workspace_settings.upsert({
      where: { workspace_id: entity.workspaceId },
      update: {
        settings: entity.settings as any,
        updated_at: entity.updatedAt,
      },
      create: {
        id: entity.id,
        workspace_id: entity.workspaceId,
        settings: entity.settings as any,
        updated_at: entity.updatedAt,
      },
    });
  }
}
