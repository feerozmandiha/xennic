import { randomUUID } from 'crypto';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy';

export class ProviderHealthEntity {
  constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly status: HealthStatus,
    public readonly latencyMs: number | null,
    public readonly errorMsg: string | null,
    public readonly checkedAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(
    providerId: string,
    status: HealthStatus,
    latencyMs?: number,
    errorMsg?: string,
  ): ProviderHealthEntity {
    const now = new Date();
    return new ProviderHealthEntity(
      randomUUID(), providerId, status,
      latencyMs ?? null, errorMsg ?? null, now, now,
    );
  }

  static reconstitute(data: {
    id: string; provider_id: string; status: string;
    latency_ms: number | null; error_msg: string | null;
    checked_at: Date; created_at: Date;
  }): ProviderHealthEntity {
    return new ProviderHealthEntity(
      data.id, data.provider_id,
      data.status as HealthStatus,
      data.latency_ms, data.error_msg,
      data.checked_at, data.created_at,
    );
  }

  get isHealthy(): boolean { return this.status === 'healthy'; }
  get isDegraded(): boolean { return this.status === 'degraded'; }
  get isUnhealthy(): boolean { return this.status === 'unhealthy'; }
}
