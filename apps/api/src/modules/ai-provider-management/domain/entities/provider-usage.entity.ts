import { randomUUID } from 'crypto';

export class ProviderUsageEntity {
  constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly modelId: string | null,
    public readonly requestCount: number,
    public readonly promptTokens: bigint,
    public readonly completionTokens: bigint,
    public readonly totalTokens: bigint,
    public readonly estimatedCost: number | null,
    public readonly periodStart: Date,
    public readonly periodEnd: Date,
    public readonly workspaceId: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(
    providerId: string,
    periodStart: Date,
    periodEnd: Date,
    options?: {
      modelId?: string; requestCount?: number;
      promptTokens?: bigint; completionTokens?: bigint;
      estimatedCost?: number; workspaceId?: string;
    },
  ): ProviderUsageEntity {
    return new ProviderUsageEntity(
      randomUUID(), providerId, options?.modelId ?? null,
      options?.requestCount ?? 0,
      options?.promptTokens ?? BigInt(0),
      options?.completionTokens ?? BigInt(0),
      (options?.promptTokens ?? BigInt(0)) + (options?.completionTokens ?? BigInt(0)),
      options?.estimatedCost ?? null,
      periodStart, periodEnd,
      options?.workspaceId ?? null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string; provider_id: string; model_id: string | null;
    request_count: number; prompt_tokens: bigint; completion_tokens: bigint;
    total_tokens: bigint; estimated_cost: number | null;
    period_start: Date; period_end: Date;
    workspace_id: string | null; created_at: Date;
  }): ProviderUsageEntity {
    return new ProviderUsageEntity(
      data.id, data.provider_id, data.model_id,
      data.request_count, data.prompt_tokens, data.completion_tokens,
      data.total_tokens, data.estimated_cost,
      data.period_start, data.period_end,
      data.workspace_id, data.created_at,
    );
  }
}
