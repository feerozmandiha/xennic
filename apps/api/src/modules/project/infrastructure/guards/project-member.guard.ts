import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import type { IProjectRepository } from '../../domain/interfaces/project.repository.interface.js';

@Injectable()
export class ProjectMemberGuard implements CanActivate {
  private readonly logger = new Logger(ProjectMemberGuard.name);

  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.workspaceId as string | undefined;
    const projectId = request.params?.projectId as string | undefined;

    if (!user?.userId) {
      throw new ForbiddenException('User not authenticated');
    }

    if (!projectId) {
      throw new NotFoundException('Project ID is required');
    }

    const project = await this.projectRepository.findById(projectId);
    if (!project || project.isDeleted()) {
      throw new NotFoundException(`Project "${projectId}" not found`);
    }

    if (project.workspaceId !== workspaceId) {
      throw new ForbiddenException('Project does not belong to this workspace');
    }

    const isMember = await this.projectRepository.isMember(projectId, user.userId);
    if (!isMember) {
      this.logger.warn(
        `ProjectMemberGuard: user ${user.userId} is NOT a member of project ${projectId}`,
      );
      throw new ForbiddenException('You are not a member of this project');
    }

    return true;
  }
}
