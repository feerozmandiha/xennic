import { Module } from '@nestjs/common';

// Controllers
import { WorkspaceController } from './presentation/controllers/workspace.controller.js';
import {
  WorkspaceMemberController,
  InvitationAcceptController,
} from './presentation/controllers/workspace-member.controller.js';
import { WorkspaceSettingsController } from './presentation/controllers/workspace-settings.controller.js';
import { DashboardController } from './presentation/controllers/dashboard.controller.js';

// Application
import { WorkspaceService } from './application/services/workspace.service.js';
import { WorkspaceSettingsService } from './application/services/workspace-settings.service.js';
import { DashboardService } from './application/services/dashboard.service.js';

// Infrastructure
import { WorkspaceRepository } from './infrastructure/repositories/workspace.repository.js';
import { WorkspaceMemberRepository } from './infrastructure/repositories/workspace-member.repository.js';
import { WorkspaceSettingsRepository } from './infrastructure/repositories/workspace-settings.repository.js';

@Module({
  controllers: [
    WorkspaceController,
    WorkspaceMemberController,
    InvitationAcceptController,
    WorkspaceSettingsController,
    DashboardController,
  ],
  providers: [
    WorkspaceService,
    WorkspaceSettingsService,
    DashboardService,
    { provide: 'IWorkspaceRepository',           useClass: WorkspaceRepository },
    { provide: 'IWorkspaceMemberRepository',       useClass: WorkspaceMemberRepository },
    { provide: 'IWorkspaceSettingsRepository',      useClass: WorkspaceSettingsRepository },
    WorkspaceRepository,
    WorkspaceMemberRepository,
    WorkspaceSettingsRepository,
  ],
  exports: [WorkspaceService, WorkspaceSettingsService, DashboardService],
})
export class WorkspaceModule {}
