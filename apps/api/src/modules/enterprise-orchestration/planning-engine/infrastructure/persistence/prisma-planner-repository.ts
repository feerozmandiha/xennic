import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type {
  IPlannerRepository,
  ListPlanOptions,
} from '../../domain/planner-repository.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class PrismaPlannerRepository implements IPlannerRepository {
  private readonly logger = new Logger(PrismaPlannerRepository.name);

  async savePlan(plan: import('../../domain/plan.entity.js').PlanEntity): Promise<void> {
    await prisma.execution_plans.upsert({
      where: { id: plan.id },
      create: {
        id: plan.id,
        goal: plan.goal,
        steps: plan.tasks as any,
        status: plan.status,
        metadata: plan.metadata as any,
      },
      update: {
        goal: plan.goal,
        steps: plan.tasks as any,
        status: plan.status,
        metadata: plan.metadata as any,
      },
    });
    this.logger.debug(`Saved plan ${plan.id}`);
  }

  async getPlan(id: string): Promise<import('../../domain/plan.entity.js').PlanEntity | null> {
    const row = await prisma.execution_plans.findUnique({ where: { id } });
    if (!row) return null;

    const { PlanEntity } = await import('../../domain/plan.entity.js');
    const steps = row.steps as Record<string, unknown> | null;
    return PlanEntity.reconstitute(
      row.id,
      row.goal,
      (steps?.tasks as any[]) ?? [],
      (steps?.dependencies as any[]) ?? [],
      row.status as any,
      (row.metadata as any) ?? {},
      row.created_at,
      row.updated_at,
    ) as import('../../domain/plan.entity.js').PlanEntity;
  }

  async updatePlan(
    id: string,
    updates: Partial<import('../../domain/plan.entity.js').PlanEntity>,
  ): Promise<import('../../domain/plan.entity.js').PlanEntity | null> {
    const existing = await this.getPlan(id);
    if (!existing) return null;

    const { PlanEntity } = await import('../../domain/plan.entity.js');
    const updated = PlanEntity.reconstitute(
      updates.id ?? existing.id,
      updates.goal ?? existing.goal,
      updates.tasks ?? existing.tasks,
      updates.dependencies ?? existing.dependencies,
      updates.status ?? existing.status,
      updates.metadata ?? existing.metadata,
      updates.createdAt ?? existing.createdAt,
      new Date(),
    ) as import('../../domain/plan.entity.js').PlanEntity;

    await this.savePlan(updated);
    this.logger.debug(`Updated plan ${id}`);
    return updated;
  }

  async listPlans(
    options?: ListPlanOptions,
  ): Promise<PaginatedResult<import('../../domain/plan.entity.js').PlanEntity>> {
    const where: Record<string, unknown> = {};
    if (options?.status) {
      where.status = options.status;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.execution_plans.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.execution_plans.count({ where: where as any }),
    ]);

    const { PlanEntity } = await import('../../domain/plan.entity.js');
    const items = rows.map((row) => {
      const steps = row.steps as Record<string, unknown> | null;
      return PlanEntity.reconstitute(
        row.id,
        row.goal,
        (steps?.tasks as any[]) ?? [],
        (steps?.dependencies as any[]) ?? [],
        row.status as any,
        (row.metadata as any) ?? {},
        row.created_at,
        row.updated_at,
      ) as import('../../domain/plan.entity.js').PlanEntity;
    });

    return { items, total, offset, limit };
  }

  async deletePlan(id: string): Promise<void> {
    await prisma.execution_plans.delete({ where: { id } });
    this.logger.debug(`Deleted plan ${id}`);
  }
}
