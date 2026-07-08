import { Module, Global, OnModuleInit, Logger } from '@nestjs/common';
import { ObservabilityService } from './application/services/observability.service.js';

@Global()
@Module({
  providers: [
    ObservabilityService,
  ],
  exports: [
    ObservabilityService,
  ],
})
export class EnterpriseObservabilityModule implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseObservabilityModule.name);

  onModuleInit(): void {
    this.logger.log('Enterprise Observability Module initialized: tracing + metrics + logging ready');
  }
}
