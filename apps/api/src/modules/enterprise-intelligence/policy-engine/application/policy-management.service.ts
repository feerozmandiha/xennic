import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { IPolicyRepository } from '../domain/policy-repository.interface.js';
import { PolicyEntity, type PolicyEffect } from '../domain/policy.entity.js';
import type { ContextScope, PaginatedResult } from '../../shared/types/index.js';
import type { PolicyFindOptions } from '../domain/policy-repository.interface.js';

export interface CreatePolicyData {
  name: string;
  description: string;
  scope: ContextScope;
  scopeId?: string;
  resource: string;
  action: string;
  effect: PolicyEffect;
  priority: number;
  conditions?: Record<string, unknown> | null;
  createdBy: string;
  enabled?: boolean;
}

export interface UpdatePolicyData {
  name?: string;
  description?: string;
  scope?: ContextScope;
  scopeId?: string;
  resource?: string;
  action?: string;
  effect?: PolicyEffect;
  priority?: number;
  conditions?: Record<string, unknown> | null;
  updatedBy: string;
}

@Injectable()
export class PolicyManagementService {
  private readonly logger = new Logger(PolicyManagementService.name);

  constructor(
    @Inject('IPolicyRepository')
    private readonly policyRepository: IPolicyRepository,
  ) {}

  async create(data: CreatePolicyData): Promise<PolicyEntity> {
    const policy = PolicyEntity.create(data);
    await this.policyRepository.save(policy);
    this.logger.log(`Created policy ${policy.id} — ${policy.name}`);
    return policy;
  }

  async get(id: string): Promise<PolicyEntity> {
    const policy = await this.policyRepository.get(id);
    if (!policy) {
      throw new NotFoundException(`Policy ${id} not found`);
    }
    return policy;
  }

  async update(id: string, data: UpdatePolicyData): Promise<PolicyEntity> {
    const existing = await this.get(id);
    const now = new Date();

    const updated = PolicyEntity.reconstitute({
      id: existing.id,
      name: data.name ?? existing.name,
      description: data.description ?? existing.description,
      scope: data.scope ?? existing.scope,
      scopeId: data.scopeId !== undefined ? data.scopeId : existing.scopeId,
      resource: data.resource ?? existing.resource,
      action: data.action ?? existing.action,
      effect: data.effect ?? existing.effect,
      priority: data.priority ?? existing.priority,
      conditions: data.conditions !== undefined ? data.conditions : existing.conditions,
      metadata: { ...existing.metadata, updatedAt: now, updatedBy: data.updatedBy },
      enabled: existing.enabled,
      createdAt: existing.createdAt,
      updatedAt: now,
    });

    await this.policyRepository.save(updated);
    this.logger.log(`Updated policy ${id}`);
    return updated;
  }

  async enable(id: string, updatedBy: string): Promise<PolicyEntity> {
    const existing = await this.get(id);
    const now = new Date();

    const updated = PolicyEntity.reconstitute({
      ...existing,
      enabled: true,
      metadata: { ...existing.metadata, updatedAt: now, updatedBy },
      updatedAt: now,
    });

    await this.policyRepository.save(updated);
    this.logger.log(`Enabled policy ${id}`);
    return updated;
  }

  async disable(id: string, updatedBy: string): Promise<PolicyEntity> {
    const existing = await this.get(id);
    const now = new Date();

    const updated = PolicyEntity.reconstitute({
      ...existing,
      enabled: false,
      metadata: { ...existing.metadata, updatedAt: now, updatedBy },
      updatedAt: now,
    });

    await this.policyRepository.save(updated);
    this.logger.log(`Disabled policy ${id}`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.get(id);
    await this.policyRepository.delete(id);
    this.logger.log(`Deleted policy ${id}`);
  }

  async list(options?: PolicyFindOptions): Promise<PaginatedResult<PolicyEntity>> {
    return this.policyRepository.list(options);
  }

  async findByResource(resource: string, scope?: string): Promise<PolicyEntity[]> {
    return this.policyRepository.findByResource(resource, scope);
  }

  async getEffectivePolicies(scope: ContextScope, scopeId: string): Promise<PolicyEntity[]> {
    const allPolicies = await this.policyRepository.list();
    return allPolicies.items.filter((p) => {
      if (!p.enabled) return false;
      if (p.scope === 'global') return true;
      if (p.scope === scope) {
        return p.scopeId === '*' || p.scopeId === scopeId;
      }
      return false;
    });
  }
}
