export interface PolicyMatch {
  policyId: string;
  name: string;
  effect: 'allow' | 'deny';
  priority: number;
}

export class PolicyEvaluationResult {
  public readonly allowed: boolean;
  public readonly reason: string;
  public readonly matchedPolicies: readonly PolicyMatch[];
  public readonly timestamp: Date;

  private constructor(
    allowed: boolean,
    reason: string,
    matchedPolicies: PolicyMatch[],
    timestamp: Date,
  ) {
    this.allowed = allowed;
    this.reason = reason;
    this.matchedPolicies = matchedPolicies;
    this.timestamp = timestamp;
  }

  static create(data: {
    allowed: boolean;
    reason: string;
    matchedPolicies: PolicyMatch[];
  }): PolicyEvaluationResult {
    return new PolicyEvaluationResult(data.allowed, data.reason, data.matchedPolicies, new Date());
  }
}
