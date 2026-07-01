# Observability Report

_Sprint A2 — 2026-06-27_

## Structured Logging

**Status: ✅ Complete**

### XennicLogger
- **File:** `apps/api/src/shared/logger/xennic-logger.ts`
- **Engine:** Pino (structured JSON logging)
- **Context Fields:** `correlationId`, `requestId`, `traceId`, `userId`, `workspaceId`
- **Methods:** `info()`, `warn()`, `error()`, `debug()`, `verbose()`
- **Dev Pretty Print:** `pino-pretty` in development mode
- **Module:** `apps/api/src/shared/logger/logger.module.ts`

### Usage
```typescript
@Injectable()
export class MyService {
  constructor(private readonly logger: XennicLogger) {}

  doSomething(userId: string) {
    this.logger.info('Processing request', { userId, correlationId: '...' });
  }
}
```

### LoggingInterceptor
- **File:** `apps/api/src/shared/logger/logger.interceptor.ts`
- Logs every HTTP request with: method, URL, status code, duration, correlation ID

## Prometheus Metrics

**Status: ✅ Complete**

### MetricsService
- **File:** `apps/api/src/shared/metrics/metrics.service.ts`
- **Library:** `prom-client`
- **Registry:** Dedicated Prometheus registry

### RED Metrics (Rate, Errors, Duration)
| Metric | Type | Labels |
|--------|------|--------|
| `http_requests_total` | Counter | method, path, status |
| `http_request_duration_seconds` | Histogram | method, path |
| `http_requests_in_flight` | Gauge | — |

### USE Metrics (Utilization, Saturation, Errors)
| Metric | Type | Description |
|--------|------|-------------|
| `db_connections_active` | Gauge | Active database connections |
| `db_query_duration_seconds` | Histogram | Database query latency |
| `cache_hits_total` | Counter | Cache hit count |
| `cache_misses_total` | Counter | Cache miss count |

### Business Metrics
| Metric | Type | Description |
|--------|------|-------------|
| `active_users` | Gauge | Currently active users |
| `active_workspaces` | Gauge | Currently active workspaces |

### Metrics Endpoint
- **Route:** `GET /metrics` (outside `/api/v1` prefix)
- **Format:** Prometheus text format (`text/plain; version=0.0.4`)
- **File:** `apps/api/src/shared/metrics/metrics.controller.ts`

### MetricsInterceptor
- **File:** `apps/api/src/shared/metrics/metrics.interceptor.ts`
- Tracks RED metrics per-request, skips `/metrics` endpoint

## OpenTelemetry Tracing

**Status: ✅ Complete**

### TracingService
- **File:** `apps/api/src/shared/tracing/tracing.service.ts`
- **SDK:** `@opentelemetry/sdk-node`
- **Exporter:** OTLP (`http://localhost:4318` default, configurable via `OTEL_EXPORTER_OTLP_ENDPOINT`)
- **Service Name:** `xennic-api`
- **Auto-Instrumentation:** HTTP, Fastify via `@opentelemetry/auto-instrumentations-node`

### Features
- `startSpan(name, context?)` — creates and returns a new span
- `getTraceId()` — returns current trace ID for correlation
- Graceful shutdown on application close

### TracingInterceptor
- **File:** `apps/api/src/shared/tracing/tracing.interceptor.ts`
- Creates span per HTTP request
- Attributes: method, URL, status code, userId, workspaceId
- Trace ID set on request object for logger correlation

## Health Probes

**Status: ✅ Complete**

### Endpoints
| Probe | Route | Purpose |
|-------|-------|---------|
| Liveness | `GET /health/live` | Is the process alive? |
| Readiness | `GET /health/ready` | Are dependencies available? |
| Startup | `GET /health/startup` | Has initialization completed? |
| Full | `GET /health` | Legacy full health check |

### Dependencies Checked
- **PostgreSQL** — via Prisma `SELECT 1`
- **Redis** — via `PING` command
- **RabbitMQ** — via `amqplib` connection attempt

### Files
- `apps/api/src/modules/health/health.service.ts`
- `apps/api/src/modules/health/health.controller.ts`
- `apps/api/src/modules/health/health.module.ts`
