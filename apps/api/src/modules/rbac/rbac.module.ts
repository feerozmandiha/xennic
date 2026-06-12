import { Module } from '@nestjs/common';

// Controllers
import { RoleController } from './presentation/controllers/role.controller.js';
import { PermissionController } from './presentation/controllers/permission.controller.js';

// Application Services
import { RoleService } from './application/services/role.service.js';
import { PermissionService } from './application/services/permission.service.js';
import { AuthorizationService } from './application/services/authorization.service.js';

// Infrastructure — Real Repositories
import { RoleRepository } from './infrastructure/repositories/role.repository.js';
import { PermissionRepository } from './infrastructure/repositories/permission.repository.js';
import { AuditLogRepository } from './infrastructure/repositories/audit-log.repository.js';

@Module({
  controllers: [
    RoleController,
    PermissionController,
  ],
  providers: [
    // ── Application Services ──────────────────────────────────────────────────
    RoleService,
    PermissionService,
    AuthorizationService,

    // ── Repository Bindings ───────────────────────────────────────────────────
    {
      provide:  'IRoleRepository',
      useClass: RoleRepository,
    },
    {
      provide:  'IPermissionRepository',
      useClass: PermissionRepository,
    },
    {
      provide:  'IAuditLogRepository',
      useClass: AuditLogRepository,
    },
  ],
  exports: [
    AuthorizationService,
    RoleService,
    PermissionService,
  ],
})
export class RbacModule {}
