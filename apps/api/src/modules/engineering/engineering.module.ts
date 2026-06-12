import { Module } from '@nestjs/common';

// Controller
import { EngineeringController } from './presentation/controllers/engineering.controller.js';

// Application
import { EngineeringService } from './application/services/engineering.service.js';

// Infrastructure
import { EngineeringClientService } from './infrastructure/http/engineering-client.service.js';
import { CalculationRepository } from './infrastructure/repositories/calculation.repository.js';

// Dependencies
import { WorkspaceModule } from '../workspace/workspace.module.js';
import { RbacModule } from '../rbac/rbac.module.js';
import { SubscriptionModule } from '../subscription/subscription.module.js';

@Module({
  imports: [
    WorkspaceModule,
    RbacModule,
    SubscriptionModule,   // ✅ برای plan-based access control
  ],
  controllers: [EngineeringController],
  providers: [
    EngineeringService,
    EngineeringClientService,
    {
      provide:  'ICalculationRepository',
      useClass: CalculationRepository,
    },
  ],
  exports: [EngineeringService, EngineeringClientService],
})
export class EngineeringModule {}
