import { Module } from '@nestjs/common';
import { FeatureFlagAdminController } from './presentation/controllers/feature-flag-admin.controller.js';
import { FeatureFlagController } from './presentation/controllers/feature-flag.controller.js';
import { FeatureFlagService } from './application/services/feature-flag.service.js';
import { FeatureFlagRepository } from './infrastructure/repositories/feature-flag.repository.js';
import { FeatureFlagGuard } from './infrastructure/guards/feature-flag.guard.js';

@Module({
  controllers: [FeatureFlagAdminController, FeatureFlagController],
  providers: [
    FeatureFlagService,
    FeatureFlagGuard,
    {
      provide: 'IFeatureFlagRepository',
      useClass: FeatureFlagRepository,
    },
  ],
  exports: [FeatureFlagService, FeatureFlagGuard],
})
export class FeatureFlagsModule {}
