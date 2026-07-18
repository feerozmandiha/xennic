import { Injectable, Logger } from '@nestjs/common';
import { PlanEntity } from '../../domain/plan.entity.js';
import type {
  IPlannerRepository,
  ListPlanOptions,
} from '../../domain/planner-repository.interface.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class InMemoryPlannerRepository implements IPlannerRepository {
  private readonly logger = new Logger(InMemoryPlannerRepository.name);
  private readonly plans = new Map<string, PlanEntity>();

  async savePlan(plan: PlanEntity): Promise<void> {
    this.plans.set(plan.id, plan);
    this.logger.debug(`Saved plan ${plan.id}`);
  }

  async getPlan(id: string): Promise<PlanEntity | null> {
    return this.plans.get(id) ?? null;
  }

  async updatePlan(id: string, updates: Partial<PlanEntity>): Promise<PlanEntity | null> {
    const existing = this.plans.get(id);
    if (!existing) {
      return null;
    }

    const updated = PlanEntity.reconstitute(
      updates.id ?? existing.id,
      updates.goal ?? existing.goal,
      updates.tasks ?? existing.tasks,
      updates.dependencies ?? existing.dependencies,
      updates.status ?? existing.status,
      updates.metadata ?? existing.metadata,
      updates.createdAt ?? existing.createdAt,
      new Date(),
    );

    this.plans.set(id, updated);
    this.logger.debug(`Updated plan ${id}`);
    return updated;
  }

  async listPlans(options?: ListPlanOptions): Promise<PaginatedResult<PlanEntity>> {
    let items = Array.from(this.plans.values());

    if (options?.status) {
      items = items.filter((p) => p.status === options.status);
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async deletePlan(id: string): Promise<void> {
    this.plans.delete(id);
    this.logger.debug(`Deleted plan ${id}`);
  }
}
