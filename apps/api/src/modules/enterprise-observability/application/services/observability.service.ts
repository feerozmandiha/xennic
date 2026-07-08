import { Injectable, Logger } from '@nestjs/common';
import type { ITracer, Span } from '../../domain/interfaces/tracer.interface.js';
import type { IMetrics } from '../../domain/interfaces/metrics.interface.js';
import type { IStructuredLogger, LogEntry, LogLevel } from '../../domain/interfaces/structured-logger.interface.js';

@Injectable()
export class ObservabilityService implements ITracer, IMetrics, IStructuredLogger {
  private readonly logger = new Logger(ObservabilityService.name);
  private readonly counters = new Map<string, number>();
  private readonly gauges = new Map<string, number>();
  private readonly histograms = new Map<string, number[]>();
  private readonly spans = new Map<string, Span>();

  private _spanCounter = 0;

  startSpan(name: string, attributes?: Record<string, string | number | boolean>): Span {
    this._spanCounter++;
    const spanId = `span-${this._spanCounter}`;
    const span: Span = {
      spanId,
      traceId: `trace-${this._spanCounter}`,
      name,
      startTime: BigInt(Date.now()),
      attributes: attributes ?? {},
      status: 'OK',
    };
    this.spans.set(spanId, span);
    this.debug(`Span started: ${name}`, { spanId, traceId: span.traceId });
    return span;
  }

  endSpan(span: Span): void {
    span.endTime = BigInt(Date.now());
    span.status = 'OK';
    const duration = Number(span.endTime - span.startTime);
    this.record('span.duration', duration, { span: span.name });
    this.debug(`Span ended: ${span.name}`, { spanId: span.spanId, durationMs: duration });
  }

  recordError(span: Span, error: Error): void {
    span.status = 'ERROR';
    span.errorMessage = error.message;
    this.error(`Span error: ${span.name}`, error, { spanId: span.spanId });
  }

  injectContext(span: Span): Record<string, string> {
    return {
      'x-trace-id': span.traceId,
      'x-span-id': span.spanId,
    };
  }

  extractContext(carrier: Record<string, string>): string | undefined {
    return carrier['x-trace-id'];
  }

  increment(name: string, value = 1, labels?: Record<string, string>): void {
    const key = this._metricKey(name, labels);
    this.counters.set(key, (this.counters.get(key) ?? 0) + value);
  }

  gauge(name: string, value: number, labels?: Record<string, string>): void {
    const key = this._metricKey(name, labels);
    this.gauges.set(key, value);
  }

  record(name: string, value: number, labels?: Record<string, string>): void {
    const key = this._metricKey(name, labels);
    if (!this.histograms.has(key)) {
      this.histograms.set(key, []);
    }
    this.histograms.get(key)!.push(value);
  }

  async getMetric(name: string): Promise<number | undefined> {
    return this.counters.get(name) ?? this.gauges.get(name);
  }

  reset(): void {
    this.counters.clear();
    this.gauges.clear();
    this.histograms.clear();
    this.spans.clear();
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(this._formatLog('debug', message, meta));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.log(this._formatLog('info', message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(this._formatLog('warn', message, meta));
  }

  error(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.logger.error(
      this._formatLog('error', message, { ...meta, error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined }),
      error?.stack,
    );
  }

  fatal(message: string, error?: Error, meta?: Record<string, unknown>): void {
    this.logger.fatal(
      this._formatLog('fatal', message, { ...meta, error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined }),
      error?.stack,
    );
  }

  private _metricKey(name: string, labels?: Record<string, string>): string {
    if (!labels) return name;
    const labelStr = Object.entries(labels).sort().map(([k, v]) => `${k}=${v}`).join(',');
    return `${name}{${labelStr}}`;
  }

  private _formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      module: 'observability',
      metadata: meta,
    };
    return JSON.stringify(entry);
  }
}
