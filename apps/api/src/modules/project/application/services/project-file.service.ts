import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import type { IProjectFileRepository } from '../../domain/interfaces/project-file.repository.interface.js';
import type { IProjectRepository } from '../../domain/interfaces/project.repository.interface.js';
import type { IStorageRepository } from '../../../storage/domain/interfaces/storage.repository.interface.js';
import { ProjectFile } from '../../domain/entities/project-file.entity.js';
import { AuditLogEntity } from '../../../rbac/domain/entities/audit-log.entity.js';
import { AuditLogRepository } from '../../../rbac/infrastructure/repositories/audit-log.repository.js';

@Injectable()
export class ProjectFileService {
  constructor(
    @Inject('IProjectFileRepository')
    private readonly projectFileRepository: IProjectFileRepository,
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
    @Inject('IStorageRepository')
    private readonly storageRepository: IStorageRepository,
    private readonly auditLogRepository: AuditLogRepository,
  ) {}

  async attachFile(
    projectId: string,
    fileId: string,
    addedBy: string,
    workspaceId: string,
  ): Promise<ProjectFile> {
    const project = await this.projectRepository.findById(projectId);
    if (!project || project.isDeleted()) {
      throw new NotFoundException(`Project "${projectId}" not found`);
    }
    if (project.workspaceId !== workspaceId) {
      throw new ForbiddenException('Project does not belong to this workspace');
    }
    // project-level membership check
    if (!(await this.projectRepository.isMember(projectId, addedBy))) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const file = await this.storageRepository.findById(fileId);
    if (!file || file.isDeleted()) {
      throw new NotFoundException(`File "${fileId}" not found`);
    }
    if ((file as any).workspaceId !== workspaceId) {
      throw new ForbiddenException('File does not belong to this workspace');
    }

    const existing = await this.projectFileRepository.find(projectId, fileId);
    if (existing) {
      throw new ConflictException('File is already attached to this project');
    }

    const projectFile = ProjectFile.create(projectId, fileId, addedBy);
    await this.projectFileRepository.save(projectFile);

    await this._audit('project_file_attached', addedBy, workspaceId, projectId, fileId);

    return projectFile;
  }

  async detachFile(
    projectId: string,
    fileId: string,
    removedBy: string,
    workspaceId: string,
  ): Promise<void> {
    const project = await this.projectRepository.findById(projectId);
    if (!project || project.isDeleted()) {
      throw new NotFoundException(`Project "${projectId}" not found`);
    }
    if (project.workspaceId !== workspaceId) {
      throw new ForbiddenException('Project does not belong to this workspace');
    }
    // project-level membership check
    if (!(await this.projectRepository.isMember(projectId, removedBy))) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const existing = await this.projectFileRepository.find(projectId, fileId);
    if (!existing) {
      throw new NotFoundException('File is not attached to this project');
    }

    await this.projectFileRepository.delete(projectId, fileId);

    await this._audit('project_file_detached', removedBy, workspaceId, projectId, fileId);
  }

  async listProjectFiles(
    projectId: string,
    workspaceId: string,
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: ProjectFile[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const project = await this.projectRepository.findById(projectId);
    if (!project || project.isDeleted()) {
      throw new NotFoundException(`Project "${projectId}" not found`);
    }
    if (project.workspaceId !== workspaceId) {
      throw new ForbiddenException('Project does not belong to this workspace');
    }
    // project-level membership check
    if (!(await this.projectRepository.isMember(projectId, userId))) {
      throw new ForbiddenException('You are not a member of this project');
    }

    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.projectFileRepository.findByProjectId(projectId, offset, limit),
      this.projectFileRepository.countByProjectId(projectId),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private async _audit(
    action: string,
    userId: string,
    workspaceId: string,
    projectId: string,
    fileId: string,
  ): Promise<void> {
    try {
      const log = AuditLogEntity.create({
        workspaceId,
        userId,
        action,
        entity: 'project_file',
        entityId: projectId,
        metadata: { projectId, fileId },
      });
      await this.auditLogRepository.save(log);
    } catch {
      // Audit failure should not block the operation
    }
  }
}
