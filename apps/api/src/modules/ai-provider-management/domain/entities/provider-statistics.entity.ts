import { randomUUID } from 'crypto';

export type TimePeriod = '1m' | '5m' | '1h' | '24h' | '7d' | '30d';

export class ProviderStatisticsEntity {
  constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly successCount: number,
    public readonly failureCount: number,
    public readonly totalRequests: number,
    public readonly avgLatencyMs: number | null,
    public readonly p50LatencyMs: number | null,
    public readonly p95LatencyMs: number | null,
    public readonly p99LatencyMs: number | null,
    public readonly successRate: number | null,
    public readonly timePeriod: TimePeriod,
    public readonly recordedAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(
    providerId: string,
    timePeriod: TimePeriod,
    data: {
      successCount: number;
      failureCount: number;
      totalRequests: number;
      avgLatencyMs?: number;
      p50LatencyMs?: number;
      p95LatencyMs?: number;
      p99LatencyMs?: number;
      successRate?: number;
    },
  ): ProviderStatisticsEntity {
    const now = new Date();
    return new ProviderStatisticsEntity(
      randomUUID(),
      providerId,
      data.successCount,
      data.failureCount,
      data.totalRequests,
      data.avgLatencyMs ?? null,
      data.p50LatencyMs ?? null,
      data.p95LatencyMs ?? null,
      data.p99LatencyMs ?? null,
      data.successRate ?? null,
      timePeriod,
      now,
      now,
    );
  }

  static reconstitute(data: {
    id: string;
    provider_id: string;
    success_count: number;
    failure_count: number;
    total_requests: number;
    avg_latency_ms: number | null;
    p50_latency_ms: number | null;
    p95_latency_ms: number | null;
    p99_latency_ms: number | null;
    success_rate: number | null;
    time_period: string;
    recorded_at: Date;
    created_at: Date;
  }): ProviderStatisticsEntity {
    return new ProviderStatisticsEntity(
      data.id,
      data.provider_id,
      data.success_count,
      data.failure_count,
      data.total_requests,
      data.avg_latency_ms,
      data.p50_latency_ms,
      data.p95_latency_ms,
      data.p99_latency_ms,
      data.success_rate,
      data.time_period as TimePeriod,
      data.recorded_at,
      data.created_at,
    );
  }
}
