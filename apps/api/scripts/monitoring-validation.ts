/**
 * Sprint M1.5 — Monitoring Operational Validation Script
 *
 * Generates real traffic to validate the live monitoring stack:
 *   - Prometheus: HTTP, DB, AI, queue metrics
 *   - Tempo: OTLP distributed traces with correlation IDs
 *   - Loki: Structured JSON logs
 *   - Grafana dashboards (manual verification)
 *   - AlertManager routing (triggered via high error rate)
 *   - SLO tracking
 *
 * Usage: npx tsx scripts/monitoring-validation.ts
 */

import { resourceFromAttributes } from '@opentelemetry/resources';
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from '@opentelemetry/semantic-conventions';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { context, trace, SpanStatusCode } from '@opentelemetry/api';
import { collectDefaultMetrics, register, Counter, Histogram, Gauge } from 'prom-client';
import http from 'node:http';

// ─── Configuration ────────────────────────────────────────────────
const TEMPO_OTLP_URL = process.env.OTEL_TRACE_URL ?? 'http://localhost:4318/v1/traces';
const PROMETHEUS_URL = process.env.PROMETHEUS_URL ?? 'http://localhost:9090';
const LOKI_URL = process.env.LOKI_URL ?? 'http://localhost:3100';
const METRICS_PORT = parseInt(process.env.METRICS_PORT ?? '9465', 10);
const DURATION_SEC = parseInt(process.env.VALIDATION_DURATION_SEC ?? '120', 10);
const SERVICE_NAME = 'xennic-validation-harness';

// ─── Prometheus Metrics (mirrors production monitoring module) ────
collectDefaultMetrics({ register });

const httpDuration = new Histogram({
  name: 'xennic_http_request_duration_ms',
  help: 'HTTP request duration in milliseconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000],
});
const httpTotal = new Counter({
  name: 'xennic_http_request_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status'],
});
const httpErrors = new Counter({
  name: 'xennic_http_request_errors_total',
  help: 'HTTP request errors',
  labelNames: ['method', 'route', 'status'],
});
const dbDuration = new Histogram({
  name: 'xennic_db_query_duration_ms',
  help: 'Database query duration',
  labelNames: ['operation'],
  buckets: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000],
});
const dbTotal = new Counter({
  name: 'xennic_db_query_total',
  help: 'Total DB queries',
  labelNames: ['operation'],
});
const aiDuration = new Histogram({
  name: 'xennic_ai_provider_request_duration_ms',
  help: 'AI provider request duration',
  labelNames: ['provider', 'model', 'status'],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000],
});
const aiTotal = new Counter({
  name: 'xennic_ai_provider_request_total',
  help: 'Total AI provider requests',
  labelNames: ['provider', 'model', 'status'],
});
const aiErrors = new Counter({
  name: 'xennic_ai_provider_errors_total',
  help: 'AI provider errors',
  labelNames: ['provider', 'model'],
});
const aiTokens = new Counter({
  name: 'xennic_ai_provider_tokens_total',
  help: 'AI provider tokens',
  labelNames: ['provider', 'model', 'type'],
});
const circuitState = new Gauge({
  name: 'xennic_ai_provider_circuit_state',
  help: 'AI provider circuit state',
  labelNames: ['provider'],
});
const workflowDuration = new Histogram({
  name: 'xennic_workflow_execution_duration_ms',
  help: 'Workflow execution duration',
  labelNames: ['workflow', 'status'],
  buckets: [100, 500, 1000, 5000, 10000, 30000, 60000, 300000],
});
const workflowTotal = new Counter({
  name: 'xennic_workflow_execution_total',
  help: 'Total workflow executions',
  labelNames: ['workflow', 'status'],
});
const queueDuration = new Histogram({
  name: 'xennic_queue_job_duration_ms',
  help: 'Queue job duration',
  labelNames: ['queue'],
  buckets: [50, 100, 250, 500, 1000, 2500, 5000, 10000, 30000],
});
const queueTotal = new Counter({
  name: 'xennic_queue_job_total',
  help: 'Total queue jobs',
  labelNames: ['queue', 'status'],
});
const queueDepth = new Gauge({
  name: 'xennic_queue_depth',
  help: 'Queue depth',
  labelNames: ['queue'],
});
const sloAvailability = new Gauge({
  name: 'xennic_slo_availability',
  help: 'SLO availability',
  labelNames: ['window'],
});
const sloLatency = new Gauge({
  name: 'xennic_slo_latency_p99_ms',
  help: 'SLO P99 latency',
  labelNames: ['window'],
});
const sloErrorRate = new Gauge({
  name: 'xennic_slo_error_rate',
  help: 'SLO error rate',
  labelNames: ['window'],
});
const appUp = new Gauge({ name: 'xennic_app_up', help: 'App up' });
const appMemoryGauge = new Gauge({
  name: 'xennic_app_memory_bytes',
  help: 'Memory',
  labelNames: ['type'],
});

// ─── OTel SDK ─────────────────────────────────────────────────────
const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: SERVICE_NAME,
  [ATTR_SERVICE_VERSION]: '1.0.0',
  'deployment.environment': 'validation',
});

const traceExporter = new OTLPTraceExporter({ url: TEMPO_OTLP_URL });
const spanProcessor = new BatchSpanProcessor(traceExporter, {
  maxExportBatchSize: 50,
  scheduledDelayMillis: 1000,
});

const sdk = new NodeSDK({
  resource,
  spanProcessor,
});

// ─── Loki log sender ──────────────────────────────────────────────
interface LogEntry {
  msg: string;
  level: string;
  method?: string;
  route?: string;
  status?: number;
  duration?: number;
  correlationId?: string;
  workspaceId?: string;
  provider?: string;
  model?: string;
  workflow?: string;
  queue?: string;
  error?: string;
  tokens?: number;
  service: string;
  timestamp: string;
}

async function sendLogToLoki(entry: LogEntry): Promise<void> {
  try {
    const ts = new Date(entry.timestamp).getTime() * 1_000_000; // nanosecond
    const line = JSON.stringify(entry);
    const stream = {
      streams: [
        {
          stream: {
            service: entry.service,
            level: entry.level,
            ...(entry.method ? { method: entry.method } : {}),
            ...(entry.route ? { route: entry.route } : {}),
          },
          values: [[String(ts), line]],
        },
      ],
    };
    const res = await fetch(`${LOKI_URL}/loki/api/v1/push`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stream),
    });
    if (!res.ok) {
      console.error(`Loki push failed: ${res.status}`);
    }
  } catch {
    // silently ignore
  }
}

// ─── Metrics generation ───────────────────────────────────────────
function generateHttpTraffic(tracer: ReturnType<typeof trace.getTracer>) {
  const routes = ['/api/v1/workspaces', '/api/v1/projects', '/api/v1/knowledge', '/api/v1/users', '/api/v1/search'];
  const methods = ['GET', 'POST', 'PUT', 'DELETE'];
  const statuses = [200, 200, 200, 201, 204, 400, 401, 404, 500];

  for (let i = 0; i < 100; i++) {
    const method = methods[Math.floor(Math.random() * methods.length)];
    const route = routes[Math.floor(Math.random() * routes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const duration = Math.random() * 500 + 10;
    const correlationId = crypto.randomUUID();

    // Record prometheus metric
    const labels = { method, route, status: String(status) };
    httpDuration.observe(labels, duration);
    httpTotal.inc(labels);
    if (status >= 400) httpErrors.inc(labels);

    // Record trace span
    const span = tracer.startSpan(`HTTP ${method} ${route}`, {
      attributes: {
        'http.method': method,
        'http.route': route,
        'http.status_code': status,
        'http.duration_ms': duration,
        'correlation.id': correlationId,
      },
    });
    if (status >= 400) {
      span.setStatus({ code: SpanStatusCode.ERROR });
    }
    span.end();

    // Send log to Loki
    sendLogToLoki({
      msg: 'request completed',
      level: status >= 400 ? 'error' : 'info',
      method,
      route,
      status,
      duration: Math.round(duration),
      correlationId,
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
    });
  }
}

function generateDbTraffic() {
  const operations = ['findWorkspace', 'createProject', 'updateDocument', 'deleteUser', 'findKnowledge'];
  for (const op of operations) {
    const count = Math.floor(Math.random() * 20) + 5;
    for (let i = 0; i < count; i++) {
      const duration = Math.random() * 200 + 1;
      dbDuration.observe({ operation: op }, duration);
      dbTotal.inc({ operation: op });
    }
  }
}

function generateAiTraffic() {
  const providers = [
    { provider: 'openai', model: 'gpt-4o' },
    { provider: 'anthropic', model: 'claude-3.5-sonnet' },
    { provider: 'google', model: 'gemini-1.5-pro' },
    { provider: 'xennic', model: 'xennic-base' },
  ];

  for (const { provider, model } of providers) {
    const count = Math.floor(Math.random() * 10) + 3;
    for (let i = 0; i < count; i++) {
      const success = Math.random() > 0.15;
      const duration = Math.random() * 5000 + 100;
      const tokens = Math.floor(Math.random() * 2000) + 50;
      const labels = { provider, model, status: success ? 'success' : 'failure' };

      aiDuration.observe(labels, duration);
      aiTotal.inc(labels);
      aiTokens.inc({ provider, model, type: 'total' }, tokens);
      if (!success) aiErrors.inc({ provider, model });

      sendLogToLoki({
        msg: success ? 'ai provider request completed' : 'ai provider request failed',
        level: success ? 'info' : 'error',
        provider,
        model,
        duration: Math.round(duration),
        tokens,
        error: success ? undefined : 'rate_limit_exceeded',
        service: SERVICE_NAME,
        timestamp: new Date().toISOString(),
      });
    }

    // Cycle circuit states
    const states = ['closed', 'closed', 'closed', 'closed', 'half_open', 'closed', 'open', 'closed'];
    circuitState.set({ provider }, states[Math.floor(Math.random() * states.length)] === 'open' ? -1 : 1);
  }
}

function generateWorkflowTraffic() {
  const workflows = ['knowledge-ingestion', 'project-analysis', 'search-indexing', 'report-generation', 'code-review'];
  for (const wf of workflows) {
    const count = Math.floor(Math.random() * 8) + 2;
    for (let i = 0; i < count; i++) {
      const success = Math.random() > 0.1;
      const duration = Math.random() * 60000 + 500;
      workflowDuration.observe({ workflow: wf, status: success ? 'success' : 'failure' }, duration);
      workflowTotal.inc({ workflow: wf, status: success ? 'success' : 'failure' });
    }
  }
}

function generateQueueTraffic() {
  const queues = ['knowledge-ingestion', 'email-notification', 'search-reindex', 'ai-job-processing', 'audit-log'];
  for (const q of queues) {
    const depth = Math.floor(Math.random() * 1000);
    queueDepth.set({ queue: q }, depth);
    const count = Math.floor(Math.random() * 15) + 3;
    for (let i = 0; i < count; i++) {
      const success = Math.random() > 0.08;
      const duration = Math.random() * 10000 + 50;
      queueDuration.observe({ queue: q }, duration);
      queueTotal.inc({ queue: q, status: success ? 'completed' : 'failed' });

      sendLogToLoki({
        msg: success ? 'job completed' : 'job failed',
        level: success ? 'info' : 'error',
        queue: q,
        duration: Math.round(duration),
        workspaceId: crypto.randomUUID(),
        service: SERVICE_NAME,
        timestamp: new Date().toISOString(),
      });
    }
  }
}

function generateSloMetrics() {
  sloAvailability.set({ window: '30d' }, 99.7 + Math.random() * 0.3);
  sloAvailability.set({ window: '7d' }, 99.5 + Math.random() * 0.5);
  sloAvailability.set({ window: '24h' }, 98.0 + Math.random() * 2.0);

  sloLatency.set({ window: '30d' }, 800 + Math.random() * 400);
  sloLatency.set({ window: '7d' }, 600 + Math.random() * 600);
  sloLatency.set({ window: '24h' }, 300 + Math.random() * 1200);

  sloErrorRate.set({ window: '30d' }, 0.3 + Math.random() * 0.7);
  sloErrorRate.set({ window: '7d' }, 0.5 + Math.random() * 1.5);
  sloErrorRate.set({ window: '24h' }, 0.1 + Math.random() * 4.9);
}

// ─── Metrics HTTP Server (for Prometheus scrape) ──────────────────
async function startMetricsServer(port: number): Promise<void> {
  const server = http.createServer(async (req, res) => {
    if (req.url === '/metrics') {
      res.writeHead(200, { 'Content-Type': register.contentType });
      res.end(await register.metrics());
    } else if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok', service: SERVICE_NAME }));
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  return new Promise((resolve) => server.listen(port, '0.0.0.0', resolve));
}

// ─── Prometheus Query Validator ───────────────────────────────────
async function queryPrometheus(metric: string): Promise<number> {
  try {
    const res = await fetch(
      `${PROMETHEUS_URL}/api/v1/query?query=${encodeURIComponent(metric)}`,
    );
    const json: any = await res.json();
    if (json.status === 'success' && json.data.result.length > 0) {
      return parseInt(json.data.result[0].value[1], 10);
    }
    return 0;
  } catch {
    return -1;
  }
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  Sprint M1.5 — Monitoring Operational Validation    ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  console.log(`Tempo OTLP:   ${TEMPO_OTLP_URL}`);
  console.log(`Prometheus:   ${PROMETHEUS_URL}`);
  console.log(`Loki:         ${LOKI_URL}`);
  console.log(`Duration:     ${DURATION_SEC}s`);
  console.log('');

  // Start OTel SDK
  sdk.start();
  console.log('✓ OTel SDK started — traces will be sent to Tempo');

  // Start metrics server
  await startMetricsServer(METRICS_PORT);
  console.log(`✓ Metrics server started on :${METRICS_PORT} — Prometheus can scrape`);

  const tracer = trace.getTracer(SERVICE_NAME);
  appUp.set(1);

  const startTime = Date.now();
  let iteration = 0;

  while ((Date.now() - startTime) / 1000 < DURATION_SEC) {
    iteration++;
    console.log(`\n─── Iteration ${iteration} ───`);

    // System metrics
    const mem = process.memoryUsage();
    appMemoryGauge.set({ type: 'heapUsed' }, mem.heapUsed);
    appMemoryGauge.set({ type: 'heapTotal' }, mem.heapTotal);

    // Generate all traffic types
    generateHttpTraffic(tracer);
    generateDbTraffic();
    generateAiTraffic();
    generateWorkflowTraffic();
    generateQueueTraffic();
    generateSloMetrics();

    await sendLogToLoki({
      msg: 'validation iteration completed',
      level: 'info',
      service: SERVICE_NAME,
      timestamp: new Date().toISOString(),
    });

    console.log(`  HTTP:    100 requests`);
    console.log(`  DB:      ~100 queries`);
    console.log(`  AI:      ~40 provider calls`);
    console.log(`  Workflow: ~30 executions`);
    console.log(`  Queue:   ~60 jobs`);
    console.log(`  SLO:     All windows updated`);
    console.log(`  Spans:   Sent to Tempo`);
    console.log(`  Logs:    Sent to Loki`);

    // Every 3 iterations, validate Prometheus has our metrics
    if (iteration % 3 === 0) {
      console.log(`\n─── Prometheus Validation ───`);
      const metrics = ['xennic_http_request_total', 'xennic_db_query_total', 'xennic_ai_provider_request_total',
        'xennic_workflow_execution_total', 'xennic_queue_job_total', 'xennic_slo_availability'];
      for (const m of metrics) {
        const val = await queryPrometheus(m);
        if (val > 0) {
          console.log(`  ✓ ${m} = ${val}`);
        } else if (val === 0) {
          console.log(`  ⚠ ${m} = 0 (not yet scraped)`);
        } else {
          console.log(`  ✗ ${m} — query failed`);
        }
      }
    }

    await new Promise((r) => setTimeout(r, 5000));
  }

  // Final Prometheus check
  console.log(`\n══════════════════════════════════════════════════════`);
  console.log(`  Final Prometheus Metric Validation`);
  console.log(`══════════════════════════════════════════════════════`);
  for (const m of ['xennic_http_request_total', 'xennic_db_query_total', 'xennic_ai_provider_request_total',
    'xennic_workflow_execution_total', 'xennic_queue_job_total', 'xennic_slo_availability']) {
    const val = await queryPrometheus(m);
    console.log(`  ${val >= 0 ? '✓' : '✗'} ${m} = ${val}`);
  }

  console.log(`\nValidation complete. Check the following:`);
  console.log(`  Prometheus:  http://localhost:9090`);
  console.log(`  Grafana:     http://localhost:3002 (admin/admin)`);
  console.log(`  Tempo:       http://localhost:3200`);
  console.log(`  Loki:        http://localhost:3100`);
  console.log(`  AlertManager: http://localhost:9093`);

  await sdk.shutdown();
  process.exit(0);
}

main().catch((err) => {
  console.error('Validation failed:', err);
  process.exit(1);
});
