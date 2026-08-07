import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import type {
  IRoutingPolicyRepository,
  RoutingPolicyListOptions,
} from '../ports/routing-policy-repository.interface.js';
import { IROUTING_POLICY_REPOSITORY } from '../ports/routing-policy-repository.interface.js';
import {
  RoutingPolicy,
  type RoutingPolicyType,
} from '../../domain/value-objects/routing-policy.value-object.js';
import type {
  CreateRoutingPolicyDto,
  RoutingRuleDto,
} from '../../presentation/dtos/routing-policy.dto.js';

@Injectable()
export class RoutingPolicyService {
  constructor(
    @Inject(IROUTING_POLICY_REPOSITORY)
    private readonly repository: IRoutingPolicyRepository,
  ) {}

  async create(dto: CreateRoutingPolicyDto, actorId: string): Promise<RoutingPolicy> {
    const existing = await this.repository.findByName(dto.name);
    if (existing) {
      throw new ConflictException(`Routing policy "${dto.name}" already exists`);
    }

    const policy = this.buildPolicy(dto);
    await this.repository.save(policy, actorId);
    return policy;
  }

  async findAll(options?: RoutingPolicyListOptions): Promise<RoutingPolicy[]> {
    return this.repository.findAll(options);
  }

  async findById(id: string): Promise<RoutingPolicy> {
    const policy = await this.repository.findById(id);
    if (!policy) {
      throw new NotFoundException(`Routing policy "${id}" not found`);
    }
    return policy;
  }

  async findEffective(options: {
    workspaceId?: string;
    featureFlag?: string;
  }): Promise<RoutingPolicy | null> {
    return this.repository.findEffective(options);
  }

  async update(id: string, dto: CreateRoutingPolicyDto, actorId: string): Promise<RoutingPolicy> {
    const current = await this.findById(id);
    const duplicate = await this.repository.findByName(dto.name);

    if (duplicate && duplicate.id !== current.id) {
      throw new ConflictException(`Routing policy "${dto.name}" already exists`);
    }

    const policy = this.buildPolicy(dto, id);
    await this.repository.save(policy, current.id, actorId);
    return policy;
  }

  async setEnabled(id: string, enabled: boolean, actorId: string): Promise<RoutingPolicy> {
    const current = await this.findById(id);

    const policy = RoutingPolicy.create({
      id: current.id,
      name: current.name,
      policyType: current.policyType,
      config: current.config,
      enabled,
      workspaceId: current.workspaceId ?? undefined,
      featureFlag: current.featureFlag ?? undefined,
      rules: current.rules,
    });

    await this.repository.save(policy, current.id, actorId);
    return policy;
  }

  async delete(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }

  private buildPolicy(
    dto: CreateRoutingPolicyDto,
    id: string = crypto.randomUUID(),
  ): RoutingPolicy {
    if (!dto.rules || dto.rules.length === 0) {
      throw new BadRequestException('At least one routing rule is required');
    }

    const rules = dto.rules.map((rule: RoutingRuleDto) => ({
      providerId: rule.providerId,
      modelId: rule.modelId,
      priority: rule.priority,
      weight: rule.weight,
      conditions: rule.conditions ?? {},
    }));

    return RoutingPolicy.create({
      id,
      name: dto.name,
      policyType: dto.policyType as RoutingPolicyType,
      config: dto.config ?? {},
      enabled: dto.enabled ?? true,
      workspaceId: dto.workspaceId,
      featureFlag: dto.featureFlag,
      rules,
    });
  }
}
