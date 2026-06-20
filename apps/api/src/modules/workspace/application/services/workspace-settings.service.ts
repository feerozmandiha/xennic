import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IWorkspaceSettingsRepository } from '../../domain/interfaces/workspace-settings.repository.interface.js';
import { WorkspaceSettingsEntity, DEFAULT_WORKSPACE_SETTINGS } from '../../domain/entities/workspace-settings.entity.js';
import type { WorkspaceSettingsData } from '../../domain/entities/workspace-settings.entity.js';
import type { UpdateWorkspaceSettingsDto } from '../../presentation/dtos/workspace-settings.dto.js';

@Injectable()
export class WorkspaceSettingsService {
  constructor(
    @Inject('IWorkspaceSettingsRepository')
    private readonly repo: IWorkspaceSettingsRepository,
  ) {}

  async getSettings(workspaceId: string): Promise<WorkspaceSettingsEntity> {
    const existing = await this.repo.findByWorkspaceId(workspaceId);
    if (existing) return existing;

    const created = WorkspaceSettingsEntity.create(workspaceId);
    await this.repo.save(created);
    return created;
  }

  async updateSettings(
    workspaceId: string,
    dto: UpdateWorkspaceSettingsDto,
  ): Promise<WorkspaceSettingsEntity> {
    const entity = await this.repo.findByWorkspaceId(workspaceId);

    if (!entity) {
      const created = WorkspaceSettingsEntity.create(workspaceId, dto as Partial<WorkspaceSettingsData>);
      await this.repo.save(created);
      return created;
    }

    entity.update(dto as Partial<WorkspaceSettingsData>, new Date());
    await this.repo.save(entity);
    return entity;
  }

  async resetSettings(workspaceId: string): Promise<WorkspaceSettingsEntity> {
    const entity = await this.repo.findByWorkspaceId(workspaceId);
    if (!entity) {
      throw new NotFoundException('Workspace settings not found');
    }
    const defaults = WorkspaceSettingsEntity.create(workspaceId);
    entity.settings = { ...defaults.settings };
    entity.updatedAt = new Date();
    await this.repo.save(entity);
    return entity;
  }
}
