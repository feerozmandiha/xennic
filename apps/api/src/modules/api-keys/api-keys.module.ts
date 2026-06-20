import { Module } from '@nestjs/common';
import { ApiKeyController } from './presentation/controllers/api-key.controller.js';
import { ApiKeyService } from './application/services/api-key.service.js';
import { ApiKeyRepository } from './infrastructure/repositories/api-key.repository.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [
    WorkspaceModule, // WorkspaceGuard ← WorkspaceService
    RbacModule,      // PermissionsGuard ← AuthorizationService
  ],
  controllers: [ApiKeyController],
  providers: [
    ApiKeyService,
    {
      provide: 'IApiKeyRepository',
      useClass: ApiKeyRepository,
    },
  ],
  exports: [ApiKeyService],
})
export class ApiKeysModule {}