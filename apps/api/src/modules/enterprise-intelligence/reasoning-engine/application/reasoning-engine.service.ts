import { Injectable, Inject, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import type { IReasoningRepository } from '../domain/reasoning-repository.interface.js';
import { ReasoningPlan, PlanStatus, PlanStepStatus } from '../domain/reasoning-plan.entity.js';
import { ExecutionGraph, NodeStatus } from '../domain/execution-graph.entity.js';
import type { PaginatedResult } from '../../shared/types/index.js';

interface CreatePlanInput {
  goal: string;
  steps: { description: string; input: Record<string, unknown>; expectedOutput?: string }[];
  dependencies?: Record<number, string[]>;
  tags?: string[];
}

@Injectable()
export class ReasoningEngineService {
  private readonly logger = new Logger(ReasoningEngineService.name);

  constructor(@Inject('IReasoningRepository') private readonly repo: IReasoningRepository) {}

  async createPlan(input: CreatePlanInput): Promise<ReasoningPlan> {
    const planSteps = input.steps.map((s, i) => ({
      description: s.description,
      order: i + 1,
      input: s.input,
      expectedOutput: s.expectedOutput ?? null,
    }));

    const plan = ReasoningPlan.create(
      input.goal,
      planSteps,
      input.dependencies ?? {},
      input.tags ?? [],
    );

    await this.repo.savePlan(plan);
    this.logger.debug(`Created plan ${plan.id} for goal: ${input.goal}`);
    return plan;
  }

  async executePlan(planId: string): Promise<ReasoningPlan> {
    let plan = await this.repo.getPlan(planId);
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found`);
    }

    if (plan.status === PlanStatus.COMPLETED) {
      throw new ConflictException(`Plan ${planId} is already completed`);
    }
    if (plan.status === PlanStatus.CANCELLED) {
      throw new ConflictException(`Plan ${planId} is cancelled`);
    }

    let graph = await this.repo.getGraph(planId);
    if (!graph) {
      graph = ExecutionGraph.create(plan);
      await this.repo.saveGraph(graph);
    }

    plan = plan.withStatus(PlanStatus.IN_PROGRESS);
    await this.repo.savePlan(plan);

    const executed = new Set<string>();

    while (executed.size < plan.steps.length) {
      const readyNodes = graph.getReadyNodes().filter((n) => !executed.has(n.stepId));

      if (readyNodes.length === 0) {
        const remaining = plan.steps.filter((s) => !executed.has(s.id));
        if (remaining.length > 0) {
          plan = plan.withStatus(PlanStatus.FAILED);
          await this.repo.savePlan(plan);
          this.logger.warn(
            `Plan ${planId} failed — blocked steps: ${remaining.map((s) => s.id).join(', ')}`,
          );
          throw new Error(
            `Plan ${planId} execution blocked — ${remaining.length} steps cannot proceed`,
          );
        }
        break;
      }

      for (const node of readyNodes) {
        graph = graph.withNodeStatus(node.stepId, NodeStatus.RUNNING);
        await this.repo.saveGraph(graph);
        plan = plan.withStepStatus(node.stepId, PlanStepStatus.IN_PROGRESS);
        await this.repo.savePlan(plan);

        graph = graph.withNodeStatus(node.stepId, NodeStatus.COMPLETED, {
          executed: true,
          timestamp: new Date().toISOString(),
        });
        await this.repo.saveGraph(graph);
        plan = plan.withStepStatus(node.stepId, PlanStepStatus.COMPLETED);
        await this.repo.savePlan(plan);

        executed.add(node.stepId);
        this.logger.debug(`Executed step ${node.stepId}`);
      }
    }

    plan = plan.withStatus(PlanStatus.COMPLETED);
    await this.repo.savePlan(plan);
    this.logger.log(`Plan ${planId} completed successfully`);
    return plan;
  }

  async getPlan(id: string): Promise<ReasoningPlan> {
    const plan = await this.repo.getPlan(id);
    if (!plan) {
      throw new NotFoundException(`Plan ${id} not found`);
    }
    return plan;
  }

  async getPlanStatus(id: string): Promise<{
    id: string;
    status: PlanStatus;
    progress: number;
    completedSteps: number;
    totalSteps: number;
  }> {
    const plan = await this.repo.getPlan(id);
    if (!plan) {
      throw new NotFoundException(`Plan ${id} not found`);
    }

    const completedSteps = plan.steps.filter(
      (s) => s.status === PlanStepStatus.COMPLETED || s.status === PlanStepStatus.FAILED,
    ).length;

    return {
      id: plan.id,
      status: plan.status,
      progress: plan.steps.length > 0 ? completedSteps / plan.steps.length : 0,
      completedSteps,
      totalSteps: plan.steps.length,
    };
  }

  async cancelPlan(id: string): Promise<ReasoningPlan> {
    let plan = await this.repo.getPlan(id);
    if (!plan) {
      throw new NotFoundException(`Plan ${id} not found`);
    }

    plan = plan.withStatus(PlanStatus.CANCELLED);
    await this.repo.savePlan(plan);
    this.logger.debug(`Cancelled plan ${id}`);
    return plan;
  }

  async listPlans(options?: {
    offset?: number;
    limit?: number;
    status?: PlanStatus;
  }): Promise<PaginatedResult<ReasoningPlan>> {
    return this.repo.listPlans(options);
  }
}
