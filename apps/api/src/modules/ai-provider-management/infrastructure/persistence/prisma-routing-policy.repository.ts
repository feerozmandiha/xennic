import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { prisma } from '@xennic/database';

import type {
  IRoutingPolicyRepository,
  RoutingPolicyListOptions,
} from '../../application/ports/routing-policy-repository.interface.js';
import { RoutingPolicy } from '../../domain/value-objects/routing-policy.value-object.js';

type StoredRule = {
  provider_id: string;
  model_id: string | null;
  priority: number;
  weight: number;
  conditions: Record<string, unknown>;
};

@Injectable()
export class PrismaRoutingPolicyRepository implements IRoutingPolicyRepository {
  async findById(id: string): Promise<RoutingPolicy | null> {
    const row = await prisma.ai_routing_policies.findFirst({
      where: {
        id,
        deleted_at: null,
      },
      include: {
        rules: {
          orderBy: {
            priority: 'asc',
          },
        },
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async findByName(name: string): Promise<RoutingPolicy | null> {
    const row = await prisma.ai_routing_policies.findFirst({
      where: {
        name,
        deleted_at: null,
      },
      include: {
        rules: {
          orderBy: {
            priority: 'asc',
          },
        },
      },
    });

    return row ? this.toDomain(row) : null;
  }

  async findAll(options?: RoutingPolicyListOptions): Promise<RoutingPolicy[]> {
    const where: Prisma.ai_routing_policiesWhereInput = {
      deleted_at: options?.includeDeleted ? undefined : null,
      enabled: options?.enabled,
      workspace_id: options?.workspaceId,
      feature_flag: options?.featureFlag,
    };

    const rows = await prisma.ai_routing_policies.findMany({
      where,
      include: {
        rules: {
          orderBy: {
            priority: 'asc',
          },
        },
      },
      orderBy: [
        {
          workspace_id: 'desc',
        },
        {
          created_at: 'desc',
        },
      ],
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findEffective(options: {
    workspaceId?: string;
    featureFlag?: string;
  }): Promise<RoutingPolicy | null> {
    const candidates = await prisma.ai_routing_policies.findMany({
      where: {
        enabled: true,
        deleted_at: null,
        OR: [
          {
            workspace_id: options.workspaceId,
          },
          {
            workspace_id: null,
          },
        ],
        AND: [
          {
            OR: [
              {
                feature_flag: options.featureFlag,
              },
              {
                feature_flag: null,
              },
            ],
          },
        ],
      },
      include: {
        rules: {
          orderBy: {
            priority: 'asc',
          },
        },
      },
      orderBy: [
        {
          workspace_id: 'desc',
        },
        {
          feature_flag: 'desc',
        },
        {
          created_at: 'desc',
        },
      ],
    });

    const row = candidates[0];
    return row ? this.toDomain(row) : null;
  }

  async save(policy: RoutingPolicy, createdBy: string, updatedBy?: string): Promise<void> {
    await prisma.$transaction(async (tx) => {
      await tx.ai_routing_policies.upsert({
        where: {
          id: policy.id,
        },
        update: {
          name: policy.name,
          policy_type: policy.policyType,
          config: policy.config as Prisma.InputJsonValue,
          enabled: policy.enabled,
          workspace_id: policy.workspaceId,
          feature_flag: policy.featureFlag,
          updated_by: updatedBy ?? createdBy,
          updated_at: new Date(),
          deleted_at: null,
        },
        create: {
          id: policy.id,
          name: policy.name,
          policy_type: policy.policyType,
          config: policy.config as Prisma.InputJsonValue,
          enabled: policy.enabled,
          workspace_id: policy.workspaceId,
          feature_flag: policy.featureFlag,
          created_by: createdBy,
          updated_by: updatedBy ?? createdBy,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });

      await tx.ai_routing_rules.deleteMany({
        where: {
          policy_id: policy.id,
        },
      });

      if (policy.rules.length > 0) {
        await tx.ai_routing_rules.createMany({
          data: policy.rules.map((rule) => ({
            id: crypto.randomUUID(),
            policy_id: policy.id,
            provider_id: rule.providerId,
            model_id: rule.modelId ?? null,
            priority: rule.priority,
            weight: rule.weight,
            conditions: (rule.conditions ?? {}) as Prisma.InputJsonValue,
          })),
        });
      }
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.ai_routing_policies.update({
      where: {
        id,
      },
      data: {
        deleted_at: new Date(),
        enabled: false,
        updated_at: new Date(),
      },
    });
  }

  async count(options?: { workspaceId?: string; enabled?: boolean }): Promise<number> {
    return prisma.ai_routing_policies.count({
      where: {
        deleted_at: null,
        workspace_id: options?.workspaceId,
        enabled: options?.enabled,
      },
    });
  }

  private toDomain(row: any): RoutingPolicy {
    return RoutingPolicy.reconstitute({
      id: row.id,
      name: row.name,
      policy_type: row.policy_type,
      config: (row.config as Record<string, unknown>) ?? {},
      enabled: row.enabled,
      workspace_id: row.workspace_id,
      feature_flag: row.feature_flag,
      rules: ((row.rules ?? []) as StoredRule[]).map((rule) => ({
        providerId: rule.provider_id,
        modelId: rule.model_id ?? undefined,
        priority: rule.priority,
        weight: rule.weight,
        conditions: rule.conditions ?? {},
      })),
    });
  }
}
