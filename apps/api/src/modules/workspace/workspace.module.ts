import { Module } from '@nestjs/common';

// Controllers
import { WorkspaceController } from './presentation/controllers/workspace.controller.js';
import {
  WorkspaceMemberController,
  InvitationAcceptController,
} from './presentation/controllers/workspace-member.controller.js';

// Application
import { WorkspaceService } from './application/services/workspace.service.js';

// Infrastructure
import { WorkspaceRepository } from './infrastructure/repositories/workspace.repository.js';
import { WorkspaceMemberRepository } from './infrastructure/repositories/workspace-member.repository.js';

@Module({
  controllers: [
    WorkspaceController,
    WorkspaceMemberController,   // ✅ members + invitations
    InvitationAcceptController,  // ✅ accept invitation (public token)
  ],
  providers: [
    WorkspaceService,
    {
      provide:  'IWorkspaceRepository',
      useClass: WorkspaceRepository,
    },
    WorkspaceRepository,
    {
      provide:  'IWorkspaceMemberRepository',    // ✅ جدید
      useClass: WorkspaceMemberRepository,
    },
  ],
  exports: [WorkspaceService],
})
export class WorkspaceModule {}
