import { Injectable } from '@nestjs/common';
import { ObservabilityService } from '../../application/services/observability.service.js';

@Injectable()
export class PrometheusMetrics {
  constructor(public readonly delegate: ObservabilityService) {}
}
