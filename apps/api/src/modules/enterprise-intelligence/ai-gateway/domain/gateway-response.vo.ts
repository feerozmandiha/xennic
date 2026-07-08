import { randomUUID } from 'node:crypto';
import type { Metadata } from '../../shared/types/index.js';

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export class GatewayResponse {
  public readonly id: string;
  public readonly output: string;
  public readonly usage: TokenUsage;
  public readonly latency: number;
  public readonly provider: string;
  public readonly model: string;
  public readonly finishReason: string | null;
  public readonly metadata: Metadata;

  private constructor(
    id: string,
    output: string,
    usage: TokenUsage,
    latency: number,
    provider: string,
    model: string,
    finishReason: string | null,
    metadata: Metadata,
  ) {
    this.id = id;
    this.output = output;
    this.usage = usage;
    this.latency = latency;
    this.provider = provider;
    this.model = model;
    this.finishReason = finishReason;
    this.metadata = metadata;
  }

  static create(
    output: string,
    usage: TokenUsage,
    latency: number,
    provider: string,
    model: string,
    finishReason: string | null = null,
    metadata?: Partial<Metadata>,
  ): GatewayResponse {
    const now = new Date();
    return new GatewayResponse(
      randomUUID(),
      output,
      usage,
      latency,
      provider,
      model,
      finishReason,
      {
        createdAt: now,
        updatedAt: now,
        createdBy: metadata?.createdBy ?? 'ai-gateway',
        updatedBy: metadata?.updatedBy ?? null,
      },
    );
  }

  static reconstitute(
    id: string,
    output: string,
    usage: TokenUsage,
    latency: number,
    provider: string,
    model: string,
    finishReason: string | null,
    metadata: Metadata,
  ): GatewayResponse {
    return new GatewayResponse(id, output, usage, latency, provider, model, finishReason, metadata);
  }
}
