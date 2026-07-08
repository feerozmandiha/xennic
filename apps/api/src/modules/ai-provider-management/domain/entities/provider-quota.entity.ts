import { randomUUID } from 'crypto';

export class ProviderQuotaEntity {
  private constructor(
    public readonly id: string,
    public readonly providerId: string,
    public requestsPerMin: number,
    public tokensPerMin: number,
    public concurrentMax: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(
    providerId: string,
    requestsPerMin?: number,
    tokensPerMin?: number,
    concurrentMax?: number,
  ): ProviderQuotaEntity {
    const now = new Date();
    return new ProviderQuotaEntity(
      randomUUID(), providerId,
      requestsPerMin ?? 60, tokensPerMin ?? 100000, concurrentMax ?? 10,
      now, now,
    );
  }

  static reconstitute(data: {
    id: string; provider_id: string;
    requests_per_min: number; tokens_per_min: number; concurrent_max: number;
    created_at: Date; updated_at: Date;
  }): ProviderQuotaEntity {
    return new ProviderQuotaEntity(
      data.id, data.provider_id,
      data.requests_per_min, data.tokens_per_min, data.concurrent_max,
      data.created_at, data.updated_at,
    );
  }

  update(requestsPerMin?: number, tokensPerMin?: number, concurrentMax?: number): void {
    if (requestsPerMin !== undefined) this.requestsPerMin = requestsPerMin;
    if (tokensPerMin !== undefined) this.tokensPerMin = tokensPerMin;
    if (concurrentMax !== undefined) this.concurrentMax = concurrentMax;
    this.updatedAt = new Date();
  }
}
