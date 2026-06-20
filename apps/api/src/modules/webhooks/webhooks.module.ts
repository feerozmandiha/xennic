import { Module } from '@nestjs/common';
import { WebhookController } from './presentation/controllers/webhook.controller.js';
import { WebhookService } from './application/services/webhook.service.js';
import { WebhookRepository } from './infrastructure/repositories/webhook.repository.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [
    WorkspaceModule, // WorkspaceGuard ← WorkspaceService
    RbacModule,      // PermissionsGuard ← AuthorizationService
  ],
  controllers: [WebhookController],
  providers: [
    WebhookService,
    {
      provide: 'IWebhookRepository',
      useClass: WebhookRepository,
    },
  ],
  exports: [WebhookService],
})
export class WebhooksModule {}