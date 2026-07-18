import { Module, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigManagerService } from './application/services/config-manager.service.js';
import { EnvConfigProvider } from './infrastructure/providers/env-config-provider.js';
import { FeatureFlagStore } from './infrastructure/stores/feature-flag.store.js';

@Module({
  providers: [ConfigManagerService, EnvConfigProvider, FeatureFlagStore],
  exports: [ConfigManagerService, EnvConfigProvider],
})
export class EnterpriseConfigModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseConfigModule.name);

  onModuleInit(): void {
    this.logger.log('Enterprise Config Module initialized: config store + feature flags ready');
  }
}
