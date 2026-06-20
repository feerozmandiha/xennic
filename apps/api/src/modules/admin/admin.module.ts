import { Module }                from '@nestjs/common';
import { AdminController }       from './presentation/controllers/admin.controller.js';
import { AdminCheckController }  from './presentation/controllers/admin-check.controller.js';
import { AdminTaxonomyController } from './presentation/controllers/admin-taxonomy.controller.js';
import { AdminService }          from './application/services/admin.service.js';
import { AdminGuard }            from './infrastructure/guards/admin.guard.js';
import { WorkspaceModule }       from '../workspace/workspace.module.js';

@Module({
  imports:     [WorkspaceModule],
  controllers: [AdminController, AdminCheckController, AdminTaxonomyController],
  providers:   [AdminService, AdminGuard],
  exports:     [AdminService],
})
export class AdminModule {}
