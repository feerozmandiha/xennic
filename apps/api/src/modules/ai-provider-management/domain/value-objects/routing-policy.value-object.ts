export type RoutingPolicyType =
  | 'manual' | 'priority' | 'round_robin' | 'least_latency'
  | 'lowest_cost' | 'highest_quality' | 'random' | 'weighted'
  | 'capability_based' | 'fallback_chain';

export interface RoutingRule {
  providerId: string;
  modelId?: string;
  priority: number;
  weight: number;
  conditions?: Record<string, unknown>;
}

export class RoutingPolicy {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly policyType: RoutingPolicyType,
    public readonly config: Record<string, unknown>,
    public readonly enabled: boolean,
    public readonly workspaceId: string | null,
    public readonly featureFlag: string | null,
    public readonly rules: RoutingRule[],
  ) {}

  static create(data: {
    id: string; name: string; policyType: RoutingPolicyType;
    config?: Record<string, unknown>; enabled?: boolean;
    workspaceId?: string; featureFlag?: string; rules?: RoutingRule[];
  }): RoutingPolicy {
    return new RoutingPolicy(
      data.id, data.name, data.policyType,
      data.config ?? {}, data.enabled ?? true,
      data.workspaceId ?? null, data.featureFlag ?? null,
      data.rules ?? [],
    );
  }

  static reconstitute(data: {
    id: string; name: string; policy_type: string;
    config: Record<string, unknown>; enabled: boolean;
    workspace_id: string | null; feature_flag: string | null;
    rules?: RoutingRule[];
  }): RoutingPolicy {
    return new RoutingPolicy(
      data.id, data.name, data.policy_type as RoutingPolicyType,
      data.config, data.enabled,
      data.workspace_id, data.feature_flag,
      data.rules ?? [],
    );
  }

  get isWorkspaceScoped(): boolean { return this.workspaceId !== null; }
  get isFeatureFlagged(): boolean { return this.featureFlag !== null; }
}
