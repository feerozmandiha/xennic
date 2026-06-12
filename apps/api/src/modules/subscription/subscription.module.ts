import { Module } from '@nestjs/common';

import {
  SubscriptionController,
  WorkspaceSubscriptionController,
} from './presentation/controllers/subscription.controller.js';
import { SubscriptionService } from './application/services/subscription.service.js';
import { SubscriptionRepository } from './infrastructure/repositories/subscription.repository.js';

import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [
    WorkspaceModule,
    RbacModule,
  ],
  controllers: [
    SubscriptionController,
    WorkspaceSubscriptionController,
  ],
  providers: [
    SubscriptionService,
    {
      provide:  'ISubscriptionRepository',
      useClass: SubscriptionRepository,
    },
  ],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
