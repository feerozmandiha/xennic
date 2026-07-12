import { Injectable, Logger } from '@nestjs/common';
import {
  httpRequestDuration,
  httpRequestTotal,
  httpRequestErrors,
  dbQueryDuration,
  dbQueryTotal,
  aiProviderRequestDuration,
  aiProviderRequestTotal,
  aiProviderErrors,
  aiProviderTokens,
  aiProviderCircuitState,
  workflowExecutionDuration,
  workflowExecutionTotal,
  queueJobTotal,
  queueDepth,
  sloAvailability,
  sloLatency,
  sloErrorRate,
} from '../../infrastructure/metrics/prometheus-metrics.js';

@Injectable()
export class MetricRecorderService {
  private readonly logger = new Logger(MetricRecorderService.name);

  recordHttpRequest(method: string, route: string, statusCode: number, durationMs: number): void {
    const labels = { method, route, status: String(statusCode) };
    httpRequestDuration.observe(labels, durationMs);
    httpRequestTotal.inc(labels);
    if (statusCode >= 400) {
      httpRequestErrors.inc(labels);
    }
  }

  recordDbQuery(operation: string, durationMs: number): void {
    dbQueryDuration.observe({ operation }, durationMs);
    dbQueryTotal.inc({ operation });
  }

  recordAiProviderCall(
    provider: string,
    model: string,
    durationMs: number,
    tokens: number,
    success: boolean,
  ): void {
    const labels = { provider, model, status: success ? 'success' : 'failure' };
    aiProviderRequestDuration.observe(labels, durationMs);
    aiProviderRequestTotal.inc(labels);
    if (!success) {
      aiProviderErrors.inc({ provider, model });
    }
    aiProviderTokens.inc({ provider, model, type: 'total' }, tokens);
  }

  recordAiCircuitState(provider: string, state: string): void {
    aiProviderCircuitState.set({ provider }, state === 'closed' ? 1 : state === 'open' ? -1 : 0);
  }

  recordWorkflowExecution(workflow: string, durationMs: number, success: boolean): void {
    const labels = { workflow, status: success ? 'success' : 'failure' };
    workflowExecutionDuration.observe(labels, durationMs);
    workflowExecutionTotal.inc(labels);
  }

  recordMessageQueued(queue: string, action: 'publish' | 'consume'): void {
    queueJobTotal.inc({ queue, status: action });
  }

  recordQueueDepth(queue: string, depth: number): void {
    queueDepth.set({ queue }, depth);
  }

  recordSlo(name: string, value: number, _target: number): void {
    if (name === 'availability') {
      sloAvailability.set({ window: '30d' }, value);
    } else if (name === 'latency') {
      sloLatency.set({ window: '30d' }, value);
    } else if (name === 'error_rate') {
      sloErrorRate.set({ window: '30d' }, value);
    }
  }
}
