import { Injectable } from '@nestjs/common';
import { ObservabilityService } from '../../application/services/observability.service.js';

@Injectable()
export class StructuredLogger {
  constructor(public readonly delegate: ObservabilityService) {}
}
