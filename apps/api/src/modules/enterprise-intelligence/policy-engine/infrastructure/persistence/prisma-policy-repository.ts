import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { PaginatedResult, Metadata, ContextScope } from '../../../shared/types/index.js';
import { PolicyEntity, type PolicyEffect } from '../../domain/policy.entity.js';
import type { IPolicyRepository, PolicyFindOptions } from '../../domain/policy-repository.interface.js';

@Injectable()
export class PrismaPolicyRepository implements IPolicyRepository {
  private readonly logger = new Logger(PrismaPolicyRepository.name);

  async save(entity: PolicyEntity): Promise<void> {
    await prisma.policies.upsert({
      where: { id: entity.id },
      update: {
        name: entity.name,
        description: entity.description,
        scope: entity.scope,
        scope_id: entity.scopeId,
        resource: entity.resource,
        action: entity.action,
        effect: entity.effect,
        priority: entity.priority,
        conditions: entity.conditions as any,
        enabled: entity.enabled,
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        name: entity.name,
        description: entity.description,
        scope: entity.scope,
        scope_id: entity.scopeId,
        resource: entity.resource,
        action: entity.action,
        effect: entity.effect,
        priority: entity.priority,
        conditions: entity.conditions as any,
        enabled: entity.enabled,
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
      },
    });
    this.logger.debug(`Saved policy ${entity.id}`);
  }

  async get(id: string): Promise<PolicyEntity | null> {
    const row = await prisma.policies.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async list(options?: PolicyFindOptions): Promise<PaginatedResult<PolicyEntity>> {
    const where: Record<string, unknown> = {};
    if (options?.enabled !== undefined) where.enabled = options.enabled;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.policies.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { priority: 'asc' },
      }),
      prisma.policies.count({ where }),
    ]);
    return {
      items: items.map(r => this.toEntity(r)),
      total,
      offset,
      limit,
    };
  }

  async findByResource(resource: string, scope?: string): Promise<PolicyEntity[]> {
    const rows = await prisma.policies.findMany();
    return rows
      .filter(r => {
        const resourceMatch = this.matchPattern(r.resource, resource);
        if (!resourceMatch) return false;
        if (scope !== undefined) {
          return r.scope === scope || r.scope === 'global';
        }
        return true;
      })
      .map(r => this.toEntity(r));
  }

  async findByAction(action: string): Promise<PolicyEntity[]> {
    const rows = await prisma.policies.findMany();
    return rows
      .filter(r => this.matchPattern(r.action, action))
      .map(r => this.toEntity(r));
  }

  async findByEffect(effect: PolicyEffect): Promise<PolicyEntity[]> {
    const rows = await prisma.policies.findMany({ where: { effect } });
    return rows.map(r => this.toEntity(r));
  }

  async findByScope(scope: string): Promise<PolicyEntity[]> {
    const rows = await prisma.policies.findMany({ where: { scope } });
    return rows.map(r => this.toEntity(r));
  }

  async delete(id: string): Promise<void> {
    await prisma.policies.delete({ where: { id } });
  }

  private matchPattern(pattern: string, value: string): boolean {
    if (pattern === '*') return true;
    const regexStr = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    return new RegExp(`^${regexStr}$`).test(value);
  }

  private toEntity(r: {
    id: string;
    name: string;
    description: string;
    scope: string;
    scope_id: string | null;
    resource: string;
    action: string;
    effect: string;
    priority: number;
    conditions: unknown;
    enabled: boolean;
    created_by: string;
    updated_by: string | null;
    created_at: Date;
    updated_at: Date;
  }): PolicyEntity {
    const metadata: Metadata = {
      createdBy: r.created_by,
      updatedBy: r.updated_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
    return PolicyEntity.reconstitute({
      id: r.id,
      name: r.name,
      description: r.description,
      scope: r.scope as ContextScope,
      scopeId: r.scope_id,
      resource: r.resource,
      action: r.action,
      effect: r.effect as PolicyEffect,
      priority: r.priority,
      conditions: r.conditions as Record<string, unknown> | null,
      metadata,
      enabled: r.enabled,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    });
  }
}
