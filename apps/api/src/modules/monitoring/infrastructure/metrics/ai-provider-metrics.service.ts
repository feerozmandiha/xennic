import { Injectable, Logger } from '@nestjs/common';
import { MetricRecorderService } from '../../application/services/metric-recorder.service.js';

@Injectable()
export class AiProviderMetricsService {
  private readonly logger = new Logger(AiProviderMetricsService.name);

  constructor(private readonly metrics: MetricRecorderService) {}

  recordCall(
    provider: string,
    model: string,
    durationMs: number,
    tokens: number,
    success: boolean,
  ): void {
    this.metrics.recordAiProviderCall(provider, model, durationMs, tokens, success);
  }

  recordCircuitState(provider: string, state: 'open' | 'closed' | 'half_open'): void {
    this.metrics.recordAiCircuitState(provider, state);
  }

  recordQuotaRemaining(provider: string, remaining: number): void {
    this.metrics.recordSlo('ai_quota_' + provider, remaining, 0);
  }
}
