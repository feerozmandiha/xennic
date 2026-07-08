export interface ProviderBreakdown {
  tokens: number;
  cost: number;
  calls: number;
}

export interface SkillBreakdown {
  tokens: number;
  cost: number;
  calls: number;
}

export interface ResourceUsageOptions {
  totalTokens?: number;
  totalCost?: number;
  totalCalls?: number;
  totalLatency?: number;
  byProvider?: Record<string, ProviderBreakdown>;
  bySkill?: Record<string, SkillBreakdown>;
}

export class ResourceUsage {
  public readonly totalTokens: number;
  public readonly totalCost: number;
  public readonly totalCalls: number;
  public readonly totalLatency: number;
  public readonly avgLatency: number;
  public readonly byProvider: Record<string, ProviderBreakdown>;
  public readonly bySkill: Record<string, SkillBreakdown>;

  private constructor(
    totalTokens: number,
    totalCost: number,
    totalCalls: number,
    totalLatency: number,
    avgLatency: number,
    byProvider: Record<string, ProviderBreakdown>,
    bySkill: Record<string, SkillBreakdown>,
  ) {
    this.totalTokens = totalTokens;
    this.totalCost = totalCost;
    this.totalCalls = totalCalls;
    this.totalLatency = totalLatency;
    this.avgLatency = avgLatency;
    this.byProvider = byProvider;
    this.bySkill = bySkill;
  }

  static create(opts?: ResourceUsageOptions): ResourceUsage {
    const totalCalls = opts?.totalCalls ?? 0;
    const totalLatency = opts?.totalLatency ?? 0;
    const avgLatency = totalCalls > 0 ? totalLatency / totalCalls : 0;

    return new ResourceUsage(
      opts?.totalTokens ?? 0,
      opts?.totalCost ?? 0,
      totalCalls,
      totalLatency,
      avgLatency,
      opts?.byProvider ?? {},
      opts?.bySkill ?? {},
    );
  }
}
