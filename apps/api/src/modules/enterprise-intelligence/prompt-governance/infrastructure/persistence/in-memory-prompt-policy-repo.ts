import { Injectable, Logger } from '@nestjs/common';
import type { PaginatedResult } from '../../../shared/types/index.js';
import type { PromptPolicyEntity, PolicyEffect } from '../../domain/prompt-policy.entity.js';
import type { IPromptPolicyRepository, PolicyFindOptions } from '../../domain/prompt-policy-repository.interface.js';

@Injectable()
export class InMemoryPromptPolicyRepo implements IPromptPolicyRepository {
  private readonly logger = new Logger(InMemoryPromptPolicyRepo.name);
  private readonly store = new Map<string, PromptPolicyEntity>();

  async save(entity: PromptPolicyEntity): Promise<void> {
    this.store.set(entity.id, entity);
    this.logger.debug(`Saved policy ${entity.id}`);
  }

  async get(id: string): Promise<PromptPolicyEntity | null> {
    return this.store.get(id) ?? null;
  }

  async list(options?: PolicyFindOptions): Promise<PaginatedResult<PromptPolicyEntity>> {
    const items = Array.from(this.store.values());
    return this.paginate(items, options);
  }

  async findByEffect(effect: PolicyEffect): Promise<PromptPolicyEntity[]> {
    return Array.from(this.store.values()).filter(e => e.effect === effect);
  }

  async delete(id: string): Promise<void> {
    this.store.delete(id);
  }

  private paginate(
    items: PromptPolicyEntity[],
    options?: PolicyFindOptions,
  ): PaginatedResult<PromptPolicyEntity> {
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
