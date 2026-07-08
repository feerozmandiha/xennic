import { Injectable } from '@nestjs/common';
import { ObservabilityService } from '../../application/services/observability.service.js';

@Injectable()
export class OpenTelemetryTracer {
  constructor(public readonly delegate: ObservabilityService) {}
}
