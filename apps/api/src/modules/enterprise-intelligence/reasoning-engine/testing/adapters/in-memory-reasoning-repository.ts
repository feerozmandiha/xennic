import { Logger } from '@nestjs/common';
import type { PaginatedResult } from '../../../shared/types/index.js';
import type { IReasoningRepository, ListPlansOptions } from '../../domain/reasoning-repository.interface.js';
import { ReasoningPlan } from '../../domain/reasoning-plan.entity.js';
import { ExecutionGraph } from '../../domain/execution-graph.entity.js';

export class InMemoryReasoningRepository implements IReasoningRepository {
  private readonly logger = new Logger(InMemoryReasoningRepository.name);
  private readonly plans = new Map<string, ReasoningPlan>();
  private readonly graphs = new Map<string, ExecutionGraph>();

  async savePlan(plan: ReasoningPlan): Promise<void> {
    this.plans.set(plan.id, plan);
    this.logger.debug(`Saved plan ${plan.id}`);
  }

  async getPlan(id: string): Promise<ReasoningPlan | null> {
    return this.plans.get(id) ?? null;
  }

  async listPlans(options?: ListPlansOptions): Promise<PaginatedResult<ReasoningPlan>> {
    let items = Array.from(this.plans.values());

    if (options?.status) {
      items = items.filter(p => p.status === options.status);
    }

    items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? items.length;

    return {
      items: items.slice(offset, offset + limit),
      total: items.length,
      offset,
      limit,
    };
  }

  async saveGraph(graph: ExecutionGraph): Promise<void> {
    this.graphs.set(graph.planId, graph);
    this.logger.debug(`Saved graph for plan ${graph.planId}`);
  }

  async getGraph(planId: string): Promise<ExecutionGraph | null> {
    return this.graphs.get(planId) ?? null;
  }

  async deletePlan(id: string): Promise<void> {
    this.plans.delete(id);
    this.graphs.delete(id);
    this.logger.debug(`Deleted plan ${id}`);
  }
}
