import type { RoutingPolicy } from '../../domain/value-objects/routing-policy.value-object.js';

export const IROUTING_POLICY_REPOSITORY = 'IROUTING_POLICY_REPOSITORY';

export interface RoutingPolicyListOptions {
  workspaceId?: string;
  featureFlag?: string;
  enabled?: boolean;
  includeDeleted?: boolean;
}

export interface IRoutingPolicyRepository {
  findById(id: string): Promise<RoutingPolicy | null>;

  findByName(name: string): Promise<RoutingPolicy | null>;

  findAll(options?: RoutingPolicyListOptions): Promise<RoutingPolicy[]>;

  findEffective(options: {
    workspaceId?: string;
    featureFlag?: string;
  }): Promise<RoutingPolicy | null>;

  save(policy: RoutingPolicy, createdBy: string, updatedBy?: string): Promise<void>;

  delete(id: string): Promise<void>;

  count(options?: { workspaceId?: string; enabled?: boolean }): Promise<number>;
}
