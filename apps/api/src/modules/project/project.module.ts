import { Module } from '@nestjs/common';

// Controller
import { ProjectController } from './presentation/controllers/project.controller.js';

// Application Service
import { ProjectService } from './application/services/project.service.js';

// Infrastructure
import { ProjectRepository } from './infrastructure/repositories/project.repository.js';

// Dependencies from other modules
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [
    WorkspaceModule, // برای WorkspaceGuard
    RbacModule,      // برای PermissionsGuard و AuthorizationService
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    {
      provide:  'IProjectRepository',
      useClass: ProjectRepository,
    },
  ],
  exports: [ProjectService],
})
export class ProjectModule {}
