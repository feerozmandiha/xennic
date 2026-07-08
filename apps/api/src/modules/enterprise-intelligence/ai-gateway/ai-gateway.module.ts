import { Module, Logger } from '@nestjs/common';
import { AIGatewayService } from './application/ai-gateway.service.js';
import { GatewayTelemetryService } from './application/gateway-telemetry.service.js';

@Module({
  providers: [
    AIGatewayService,
    GatewayTelemetryService,
  ],
  exports: [
    AIGatewayService,
    GatewayTelemetryService,
  ],
})
export class AIGatewayModule {
  private readonly logger = new Logger(AIGatewayModule.name);

  constructor() {
    this.logger.log('AI Gateway Module initialized — all provider execution delegated to AiProviderManagement');
  }
}
