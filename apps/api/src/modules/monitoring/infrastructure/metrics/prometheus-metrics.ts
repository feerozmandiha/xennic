import { collectDefaultMetrics, register, Counter, Histogram, Gauge } from 'prom-client';
import { Logger } from '@nestjs/common';

const logger = new Logger('PrometheusMetrics');

export function initializePrometheusMetrics(): void {
  collectDefaultMetrics({ register });
  logger.log('Default metrics collected (Node.js runtime)');
}

export const httpRequestDuration = new Histogram({
  name: 'xennic_http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
});

export const httpRequestTotal = new Counter({
  name: 'xennic_http_request_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestErrors = new Counter({
  name: 'xennic_http_request_errors_total',
  help: 'Total number of HTTP request errors',
  labelNames: ['method', 'route', 'status'],
});

export const dbQueryDuration = new Histogram({
  name: 'xennic_db_query_duration_ms',
  help: 'Database query duration in milliseconds',
  labelNames: ['operation'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000],
});

export const dbQueryTotal = new Counter({
  name: 'xennic_db_query_total',
  help: 'Total number of database queries',
  labelNames: ['operation'],
});

export const aiProviderRequestDuration = new Histogram({
  name: 'xennic_ai_provider_request_duration_ms',
  help: 'AI provider request duration in milliseconds',
  labelNames: ['provider', 'model', 'status'],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000],
});

export const aiProviderRequestTotal = new Counter({
  name: 'xennic_ai_provider_request_total',
  help: 'Total number of AI provider requests',
  labelNames: ['provider', 'model', 'status'],
});

export const aiProviderErrors = new Counter({
  name: 'xennic_ai_provider_errors_total',
  help: 'Total number of AI provider errors',
  labelNames: ['provider', 'model'],
});

export const aiProviderTokens = new Counter({
  name: 'xennic_ai_provider_tokens_total',
  help: 'Total tokens consumed from AI providers',
  labelNames: ['provider', 'model', 'type'],
});

export const aiProviderCircuitState = new Gauge({
  name: 'xennic_ai_provider_circuit_state',
  help: 'Circuit breaker state per AI provider (1=closed, 0=half_open, -1=open)',
  labelNames: ['provider'],
});

export const workflowExecutionDuration = new Histogram({
  name: 'xennic_workflow_execution_duration_ms',
  help: 'Workflow execution duration in milliseconds',
  labelNames: ['workflow', 'status'],
  buckets: [100, 500, 1000, 5000, 10000, 30000, 60000, 300000],
});

export const workflowExecutionTotal = new Counter({
  name: 'xennic_workflow_execution_total',
  help: 'Total number of workflow executions',
  labelNames: ['workflow', 'status'],
});

export const queueJobDuration = new Histogram({
  name: 'xennic_queue_job_duration_ms',
  help: 'Queue job duration in milliseconds',
  labelNames: ['queue'],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000],
});

export const queueJobTotal = new Counter({
  name: 'xennic_queue_job_total',
  help: 'Total number of queue jobs',
  labelNames: ['queue', 'status'],
});

export const queueDepth = new Gauge({
  name: 'xennic_queue_depth',
  help: 'Current queue depth',
  labelNames: ['queue'],
});

export const sloAvailability = new Gauge({
  name: 'xennic_slo_availability',
  help: 'SLO availability percentage',
  labelNames: ['window'],
});

export const sloLatency = new Gauge({
  name: 'xennic_slo_latency_p99_ms',
  help: 'SLO P99 latency in milliseconds',
  labelNames: ['window'],
});

export const sloErrorRate = new Gauge({
  name: 'xennic_slo_error_rate',
  help: 'SLO error rate percentage',
  labelNames: ['window'],
});

export const appUp = new Gauge({
  name: 'xennic_app_up',
  help: 'Application up status',
});

export const appMemory = new Gauge({
  name: 'xennic_app_memory_bytes',
  help: 'Application memory usage in bytes',
  labelNames: ['type'],
});

export const appCpu = new Gauge({
  name: 'xennic_app_cpu_seconds',
  help: 'Application CPU usage in seconds',
});
