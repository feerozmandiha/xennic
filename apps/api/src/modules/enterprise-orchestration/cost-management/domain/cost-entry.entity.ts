import { randomUUID } from 'node:crypto';

export type SourceType = 'provider' | 'skill' | 'tool' | 'workflow';
export type CostType = 'token' | 'api_call' | 'compute' | 'storage';
export type Currency = 'USD';

export interface CostEntryOptions {
  workflowExecutionId: string;
  sourceType: SourceType;
  sourceId: string;
  costType: CostType;
  amount: number;
  currency?: Currency;
  tokens?: number | null;
  latency?: number | null;
  metadata?: Record<string, unknown>;
}

export class CostEntry {
  public readonly id: string;
  public readonly workflowExecutionId: string;
  public readonly sourceType: SourceType;
  public readonly sourceId: string;
  public readonly costType: CostType;
  public readonly amount: number;
  public readonly currency: Currency;
  public readonly tokens: number | null;
  public readonly latency: number | null;
  public readonly metadata: Record<string, unknown>;
  public readonly timestamp: Date;

  private constructor(
    id: string,
    workflowExecutionId: string,
    sourceType: SourceType,
    sourceId: string,
    costType: CostType,
    amount: number,
    currency: Currency,
    tokens: number | null,
    latency: number | null,
    metadata: Record<string, unknown>,
    timestamp: Date,
  ) {
    this.id = id;
    this.workflowExecutionId = workflowExecutionId;
    this.sourceType = sourceType;
    this.sourceId = sourceId;
    this.costType = costType;
    this.amount = amount;
    this.currency = currency;
    this.tokens = tokens;
    this.latency = latency;
    this.metadata = metadata;
    this.timestamp = timestamp;
  }

  static create(opts: CostEntryOptions): CostEntry {
    return new CostEntry(
      randomUUID(),
      opts.workflowExecutionId,
      opts.sourceType,
      opts.sourceId,
      opts.costType,
      opts.amount,
      opts.currency ?? 'USD',
      opts.tokens ?? null,
      opts.latency ?? null,
      opts.metadata ?? {},
      new Date(),
    );
  }

  static reconstitute(
    id: string,
    workflowExecutionId: string,
    sourceType: SourceType,
    sourceId: string,
    costType: CostType,
    amount: number,
    currency: Currency,
    tokens: number | null,
    latency: number | null,
    metadata: Record<string, unknown>,
    timestamp: Date,
  ): CostEntry {
    return new CostEntry(
      id,
      workflowExecutionId,
      sourceType,
      sourceId,
      costType,
      amount,
      currency,
      tokens,
      latency,
      metadata,
      timestamp,
    );
  }
}
