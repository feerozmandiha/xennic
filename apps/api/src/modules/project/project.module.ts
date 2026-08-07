import { Module } from '@nestjs/common';

// Controllers
import { ProjectController } from './presentation/controllers/project.controller.js';
import { ProjectFileController } from './presentation/controllers/project-file.controller.js';

// Application Services
import { ProjectService } from './application/services/project.service.js';
import { ProjectFileService } from './application/services/project-file.service.js';

// Infrastructure
import { ProjectRepository } from './infrastructure/repositories/project.repository.js';
import { ProjectFileRepository } from './infrastructure/repositories/project-file.repository.js';
import { ProjectMemberGuard } from './infrastructure/guards/project-member.guard.js';

// Dependencies from other modules
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { StorageModule } from '../storage/storage.module.js';

@Module({
  imports: [WorkspaceModule, RbacModule, StorageModule],
  controllers: [ProjectController, ProjectFileController],
  providers: [
    ProjectService,
    ProjectFileService,
    ProjectMemberGuard,
    {
      provide: 'IProjectRepository',
      useClass: ProjectRepository,
    },
    {
      provide: 'IProjectFileRepository',
      useClass: ProjectFileRepository,
    },
  ],
  exports: [ProjectService, ProjectFileService],
})
export class ProjectModule {}
