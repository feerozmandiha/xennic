import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { PaginatedResult } from '../../../shared/types/index.js';
import type { IReasoningRepository, ListPlansOptions } from '../../domain/reasoning-repository.interface.js';
import {
  ReasoningPlan,
  type PlanStatus,
  type PlanStep,
  type ReasoningPlanMetadata,
} from '../../domain/reasoning-plan.entity.js';
import {
  ExecutionGraph,
  type ExecutionNode,
  type ExecutionEdge,
  type ExecutionGraphMetadata,
  NodeStatus,
} from '../../domain/execution-graph.entity.js';

@Injectable()
export class PrismaReasoningRepository implements IReasoningRepository {
  private readonly logger = new Logger(PrismaReasoningRepository.name);

  async savePlan(plan: ReasoningPlan): Promise<void> {
    await prisma.reasoning_plans.upsert({
      where: { id: plan.id },
      update: {
        goal: plan.goal,
        steps: plan.steps as unknown as Record<string, unknown>,
        status: plan.status,
        metadata: plan.metadata as unknown as Record<string, unknown>,
        version: plan.version,
      },
      create: {
        id: plan.id,
        workspace_id: null,
        goal: plan.goal,
        steps: plan.steps as unknown as Record<string, unknown>,
        status: plan.status,
        metadata: plan.metadata as unknown as Record<string, unknown>,
        version: plan.version,
      },
    });
    this.logger.debug(`Saved plan ${plan.id}`);
  }

  async getPlan(id: string): Promise<ReasoningPlan | null> {
    const row = await prisma.reasoning_plans.findUnique({ where: { id } });
    if (!row) return null;
    return ReasoningPlan.reconstitute(
      row.id,
      row.goal,
      row.steps as unknown as PlanStep[],
      row.status as PlanStatus,
      row.metadata as unknown as ReasoningPlanMetadata,
      row.version,
      row.created_at,
      row.updated_at,
    );
  }

  async listPlans(options?: ListPlansOptions): Promise<PaginatedResult<ReasoningPlan>> {
    const where: Record<string, unknown> = {};
    if (options?.status) where.status = options.status;
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 50;
    const [items, total] = await Promise.all([
      prisma.reasoning_plans.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.reasoning_plans.count({ where }),
    ]);
    return {
      items: items.map(r =>
        ReasoningPlan.reconstitute(
          r.id,
          r.goal,
          r.steps as unknown as PlanStep[],
          r.status as PlanStatus,
          r.metadata as unknown as ReasoningPlanMetadata,
          r.version,
          r.created_at,
          r.updated_at,
        ),
      ),
      total,
      offset,
      limit,
    };
  }

  async saveGraph(graph: ExecutionGraph): Promise<void> {
    await prisma.reasoning_graphs.upsert({
      where: { id: graph.id },
      update: {
        plan_id: graph.planId,
        nodes: graph.nodes as unknown as Record<string, unknown>,
        edges: graph.edges as unknown as Record<string, unknown>,
        status: graph.status,
        metadata: graph.metadata as unknown as Record<string, unknown>,
      },
      create: {
        id: graph.id,
        plan_id: graph.planId,
        workspace_id: null,
        nodes: graph.nodes as unknown as Record<string, unknown>,
        edges: graph.edges as unknown as Record<string, unknown>,
        status: graph.status,
        metadata: graph.metadata as unknown as Record<string, unknown>,
      },
    });
    this.logger.debug(`Saved graph for plan ${graph.planId}`);
  }

  async getGraph(planId: string): Promise<ExecutionGraph | null> {
    const row = await prisma.reasoning_graphs.findFirst({
      where: { plan_id: planId },
    });
    if (!row) return null;
    return ExecutionGraph.reconstitute(
      row.id,
      row.plan_id,
      row.nodes as unknown as ExecutionNode[],
      row.edges as unknown as ExecutionEdge[],
      row.status as NodeStatus,
      row.metadata as unknown as ExecutionGraphMetadata,
      row.created_at,
      row.updated_at,
    );
  }

  async deletePlan(id: string): Promise<void> {
    await prisma.reasoning_graphs.deleteMany({ where: { plan_id: id } });
    await prisma.reasoning_plans.delete({ where: { id } }).catch(() => {});
    this.logger.debug(`Deleted plan ${id}`);
  }
}
