import { Module } from '@nestjs/common';
import { WorkspaceConfigService } from './application/services/workspace-config.service.js';
import { DynamicConfigService } from './application/services/dynamic-config.service.js';
import { FeatureFlagService } from './application/services/feature-flag.service.js';

@Module({
  providers: [
    WorkspaceConfigService,
    DynamicConfigService,
    FeatureFlagService,
  ],
  exports: [
    WorkspaceConfigService,
    DynamicConfigService,
    FeatureFlagService,
  ],
})
export class EnterpriseConfigModule {}
