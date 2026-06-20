import { Module } from '@nestjs/common';
import { BillingController } from './presentation/controllers/billing.controller.js';
import { BillingCallbackController } from './presentation/controllers/billing-callback.controller.js';
import { BillingService } from './application/services/billing.service.js';
import { SubscriptionBillingService } from './application/services/subscription-billing.service.js';
import { BillingRepository } from './infrastructure/repositories/billing.repository.js';
import { ZarinpalGateway } from './infrastructure/gateways/zarinpal.gateway.js';
import { SubscriptionModule } from '../subscription/subscription.module.js';
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';

@Module({
  imports: [
    SubscriptionModule,
    WorkspaceModule,
    RbacModule,
  ],
  controllers: [BillingController, BillingCallbackController],
  providers: [
    BillingService,
    SubscriptionBillingService,
    {
      provide: 'IBillingRepository',
      useClass: BillingRepository,
    },
    {
      provide: 'ZARINPAL_GATEWAY',
      useClass: ZarinpalGateway,
    },
  ],
  exports: [BillingService, SubscriptionBillingService],
})
export class BillingModule {}
