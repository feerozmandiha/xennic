# ADR-016: Enterprise Observability — Tracing, Metrics, Structured Logging

## Status

Accepted — Sprint E1

## Context

The platform lacks centralized observability. Each module logs independently via NestJS Logger. No distributed tracing, no metrics collection, no structured log format.

## Decision

Create a unified observability service implementing three interfaces:

1. **ITracer**: Span creation with attributes, error recording, context injection/extraction (W3C trace context format)
2. **IMetrics**: Counter, gauge, and histogram support with label dimensions
3. **IStructuredLogger**: Log levels (debug through fatal) with correlation ID, user ID, workspace ID, error details, metadata

The service is `@Global()` and provides in-process implementations initially. The interfaces map to OpenTelemetry concepts for future exporter integration.

## Consequences

- Single `ObservabilityService` replaces ad-hoc logging
- Trace context propagation via `x-trace-id`/`x-span-id` headers
- Prometheus-compatible metric labels
- Structured JSON log format for log aggregators
- OpenTelemetry exporter can be added as a downstream adapter
- Event-driven observability: publish `ObservabilityEvent` for external sinks
