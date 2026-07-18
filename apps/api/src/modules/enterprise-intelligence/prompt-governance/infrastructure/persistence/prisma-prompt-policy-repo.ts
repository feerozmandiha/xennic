import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { PaginatedResult, Metadata } from '../../../shared/types/index.js';
import {
  PromptPolicyEntity,
  type PolicyEffect,
  type PolicyRule,
} from '../../domain/prompt-policy.entity.js';
import type {
  IPromptPolicyRepository,
  PolicyFindOptions,
} from '../../domain/prompt-policy-repository.interface.js';

@Injectable()
export class PrismaPromptPolicyRepo implements IPromptPolicyRepository {
  private readonly logger = new Logger(PrismaPromptPolicyRepo.name);

  async save(entity: PromptPolicyEntity): Promise<void> {
    await prisma.prompt_policies.upsert({
      where: { id: entity.id },
      update: {
        name: entity.name,
        description: entity.description,
        rules: [...entity.rules] as unknown as Record<string, unknown>,
        effect: entity.effect,
        priority: entity.priority,
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
      },
      create: {
        id: entity.id,
        workspace_id: null,
        name: entity.name,
        description: entity.description,
        rules: [...entity.rules] as unknown as Record<string, unknown>,
        effect: entity.effect,
        priority: entity.priority,
        created_by: entity.metadata.createdBy,
        updated_by: entity.metadata.updatedBy,
      },
    });
    this.logger.debug(`Saved policy ${entity.id}`);
  }

  async get(id: string): Promise<PromptPolicyEntity | null> {
    const row = await prisma.prompt_policies.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async list(options?: PolicyFindOptions): Promise<PaginatedResult<PromptPolicyEntity>> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.prompt_policies.findMany({
        skip: offset,
        take: limit,
        orderBy: { priority: 'asc' },
      }),
      prisma.prompt_policies.count(),
    ]);
    return {
      items: items.map((r) => this.toEntity(r)),
      total,
      offset,
      limit,
    };
  }

  async findByEffect(effect: PolicyEffect): Promise<PromptPolicyEntity[]> {
    const rows = await prisma.prompt_policies.findMany({
      where: { effect },
      orderBy: { priority: 'asc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async delete(id: string): Promise<void> {
    await prisma.prompt_policies.delete({ where: { id } });
  }

  private toEntity(r: {
    id: string;
    name: string;
    description: string;
    rules: unknown;
    effect: string;
    priority: number;
    created_by: string;
    updated_by: string | null;
    created_at: Date;
    updated_at: Date;
  }): PromptPolicyEntity {
    const metadata: Metadata = {
      createdBy: r.created_by,
      updatedBy: r.updated_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    };
    return PromptPolicyEntity.reconstitute(
      r.id,
      r.name,
      r.description,
      r.rules as PolicyRule[],
      r.effect as PolicyEffect,
      r.priority,
      metadata,
      r.created_at,
      r.updated_at,
    );
  }
}
