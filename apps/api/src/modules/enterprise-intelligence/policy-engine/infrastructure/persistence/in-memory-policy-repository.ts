import { Injectable, Logger } from '@nestjs/common';
import type { PaginatedResult } from '../../../shared/types/index.js';
import type { PolicyEntity, PolicyEffect } from '../../domain/policy.entity.js';
import type { IPolicyRepository, PolicyFindOptions } from '../../domain/policy-repository.interface.js';

@Injectable()
export class InMemoryPolicyRepository implements IPolicyRepository {
  private readonly logger = new Logger(InMemoryPolicyRepository.name);
  private readonly store = new Map<string, PolicyEntity>();

  async save(entity: PolicyEntity): Promise<void> {
    this.store.set(entity.id, entity);
    this.logger.debug(`Saved policy ${entity.id}`);
  }

  async get(id: string): Promise<PolicyEntity | null> {
    return this.store.get(id) ?? null;
  }

  async list(options?: PolicyFindOptions): Promise<PaginatedResult<PolicyEntity>> {
    let items = Array.from(this.store.values());
    if (options?.enabled !== undefined) {
      items = items.filter(e => e.enabled === options.enabled);
    }
    return this.paginate(items, options);
  }

  async findByResource(resource: string, scope?: string): Promise<PolicyEntity[]> {
    return Array.from(this.store.values()).filter(e => {
      const resourceMatch = this.matchPattern(e.resource, resource);
      if (!resourceMatch) return false;
      if (scope !== undefined) {
        return e.scope === scope || e.scope === 'global';
      }
      return true;
    });
  }

  async findByAction(action: string): Promise<PolicyEntity[]> {
    return Array.from(this.store.values()).filter(e => this.matchPattern(e.action, action));
  }

  async findByEffect(effect: PolicyEffect): Promise<PolicyEntity[]> {
    return Array.from(this.store.values()).filter(e => e.effect === effect);
  }

  async findByScope(scope: string): Promise<PolicyEntity[]> {
    return Array.from(this.store.values()).filter(e => e.scope === scope);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  private matchPattern(pattern: string, value: string): boolean {
    if (pattern === '*') return true;
    const regexStr = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${regexStr}$`).test(value);
  }

  private paginate(
    items: PolicyEntity[],
    options?: PolicyFindOptions,
  ): PaginatedResult<PolicyEntity> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;
    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }
}
