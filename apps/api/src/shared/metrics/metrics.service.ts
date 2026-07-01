import { Injectable } from '@nestjs/common';
import {
  Counter,
  Gauge,
  Histogram,
  Registry,
} from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;

  private readonly httpRequestsTotal: Counter<string>;
  private readonly httpRequestDuration: Histogram<string>;
  private readonly httpRequestsInFlight: Gauge<string>;

  private readonly dbConnectionsActive: Gauge<string>;
  private readonly dbQueryDuration: Histogram<string>;

  private readonly cacheHitsTotal: Counter<string>;
  private readonly cacheMissesTotal: Counter<string>;

  private readonly activeUsers: Gauge<string>;
  private readonly activeWorkspaces: Gauge<string>;

  constructor() {
    this.registry = new Registry();

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'path', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDuration = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'HTTP request duration in seconds',
      labelNames: ['method', 'path'],
      buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    this.httpRequestsInFlight = new Gauge({
      name: 'http_requests_in_flight',
      help: 'Current number of HTTP requests being processed',
      registers: [this.registry],
    });

    this.dbConnectionsActive = new Gauge({
      name: 'db_connections_active',
      help: 'Current number of active database connections',
      registers: [this.registry],
    });

    this.dbQueryDuration = new Histogram({
      name: 'db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['query'],
      buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
      registers: [this.registry],
    });

    this.cacheHitsTotal = new Counter({
      name: 'cache_hits_total',
      help: 'Total number of cache hits',
      registers: [this.registry],
    });

    this.cacheMissesTotal = new Counter({
      name: 'cache_misses_total',
      help: 'Total number of cache misses',
      registers: [this.registry],
    });

    this.activeUsers = new Gauge({
      name: 'active_users',
      help: 'Current number of active users',
      registers: [this.registry],
    });

    this.activeWorkspaces = new Gauge({
      name: 'active_workspaces',
      help: 'Current number of active workspaces',
      registers: [this.registry],
    });
  }

  incrementHttpRequestsTotal(method: string, path: string, statusCode: number): void {
    this.httpRequestsTotal.inc({ method, path, status: String(statusCode) });
  }

  observeHttpRequestDuration(method: string, path: string, durationMs: number): void {
    this.httpRequestDuration.observe({ method, path }, durationMs / 1000);
  }

  trackInFlightRequest(delta: number): void {
    this.httpRequestsInFlight.inc(delta);
  }

  setDbConnectionsActive(count: number): void {
    this.dbConnectionsActive.set(count);
  }

  observeDbQueryDuration(query: string, durationMs: number): void {
    this.dbQueryDuration.observe({ query }, durationMs / 1000);
  }

  incrementCacheHits(): void {
    this.cacheHitsTotal.inc();
  }

  incrementCacheMisses(): void {
    this.cacheMissesTotal.inc();
  }

  setActiveUsers(count: number): void {
    this.activeUsers.set(count);
  }

  setActiveWorkspaces(count: number): void {
    this.activeWorkspaces.set(count);
  }

  async getMetrics(): Promise<{ metrics: string; contentType: string }> {
    const metrics = await this.registry.metrics();
    return { metrics, contentType: this.registry.contentType };
  }
}
