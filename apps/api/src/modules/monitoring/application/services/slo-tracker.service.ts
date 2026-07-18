import { Injectable, Logger } from '@nestjs/common';
import { SLO_TARGETS, type SloStatus } from '../../domain/metrics/slo-metrics.js';
import { MetricRecorderService } from './metric-recorder.service.js';

@Injectable()
export class SloTrackerService {
  private readonly logger = new Logger(SloTrackerService.name);
  private readonly windows = new Map<string, number[]>();

  constructor(private readonly metrics: MetricRecorderService) {
    for (const slo of SLO_TARGETS) {
      this.windows.set(slo.name, []);
    }
  }

  recordObservation(name: string, value: number): void {
    const slo = SLO_TARGETS.find((s) => s.name === name);
    if (!slo) return;

    const window = this.windows.get(name)!;
    window.push(value);
    if (window.length > 10000) window.shift();

    this.metrics.recordSlo(name, value, slo.target);
  }

  recordHttpOutcome(statusCode: number, durationMs: number): void {
    this.recordObservation('availability', statusCode < 500 ? 1 : 0);
    this.recordObservation('latency_p99', durationMs);
    this.recordObservation('error_rate', statusCode < 400 ? 1 : 0);
  }

  recordAiResponse(durationMs: number): void {
    this.recordObservation('ai_response_time', durationMs);
  }

  recordWorkflowExecution(durationMs: number): void {
    this.recordObservation('workflow_execution', durationMs);
  }

  getStatuses(): SloStatus[] {
    return SLO_TARGETS.map((slo) => {
      const window = this.windows.get(slo.name) ?? [];
      const current = window.length > 0 ? window.reduce((a, b) => a + b, 0) / window.length : 0;

      let normalized = current;
      if (slo.name === 'availability' || slo.name === 'error_rate') {
        normalized = current * 100;
      }

      return {
        name: slo.name,
        current: Math.round(normalized * 100) / 100,
        target: slo.target,
        met:
          slo.name === 'latency_p99' ||
          slo.name === 'ai_response_time' ||
          slo.name === 'workflow_execution'
            ? normalized <= slo.target
            : normalized >= slo.target,
        window: slo.window,
      };
    });
  }
}
