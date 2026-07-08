import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { Metadata } from '../../shared/types/index.js';
import type { PlanTask, Dependency } from '../domain/plan.entity.js';
import { PlanEntity } from '../domain/plan.entity.js';
import { TaskGraph } from '../domain/task-graph.vo.js';
import type { IPlannerRepository } from '../domain/planner-repository.interface.js';

export interface CreatePlanData {
  goal: string;
  tasks: PlanTask[];
  dependencies?: Dependency[];
  createdBy: string;
}

export interface ProgressAnalysis {
  completed: number;
  remaining: number;
  blocked: number;
  estimatedCompletion: Date | null;
}

@Injectable()
export class PlannerService {
  private readonly logger = new Logger(PlannerService.name);

  constructor(
    @Inject('IPlannerRepository')
    private readonly repository: IPlannerRepository,
  ) {}

  async createPlan(data: CreatePlanData): Promise<{ plan: PlanEntity; graph: TaskGraph }> {
    const metadata: Metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: data.createdBy,
      updatedBy: null,
    };

    const plan = PlanEntity.create({
      goal: data.goal,
      tasks: data.tasks,
      dependencies: data.dependencies ?? [],
      metadata,
    });

    const graph = TaskGraph.create(plan);

    await this.repository.savePlan(plan);
    this.logger.log(`Plan created: ${plan.id}`);

    return { plan, graph };
  }

  async getExecutionOrder(planId: string): Promise<string[]> {
    const plan = await this.getPlanOrThrow(planId);
    const graph = TaskGraph.create(plan);

    return graph.nodes
      .sort((a, b) => a.level - b.level || a.order - b.order)
      .map(n => n.taskId);
  }

  async getCriticalPath(planId: string): Promise<string[]> {
    const plan = await this.getPlanOrThrow(planId);
    const graph = TaskGraph.create(plan);

    return graph.getCriticalPath();
  }

  async getReadyTasks(planId: string, completedIds: string[]): Promise<PlanTask[]> {
    const plan = await this.getPlanOrThrow(planId);
    const graph = TaskGraph.create(plan);
    const readyIds = new Set(graph.getReadyTasks(completedIds).map(t => t.id));

    return plan.tasks.filter(t => readyIds.has(t.id));
  }

  async analyzeProgress(planId: string): Promise<ProgressAnalysis> {
    const plan = await this.getPlanOrThrow(planId);
    const completed = plan.tasks.filter(t => t.status === 'completed').length;
    const failed = plan.tasks.filter(t => t.status === 'failed').length;
    const remaining = plan.tasks.filter(t => t.status === 'pending').length;

    const failedIds = plan.tasks.filter(t => t.status === 'failed').map(t => t.id);
    const blockedByFailure = plan.tasks.filter(
      t => t.status === 'pending' && t.dependsOn.some(d => failedIds.includes(d)),
    ).length;
    const blocked = failed + blockedByFailure;

    const totalTasks = plan.tasks.length;
    const completedRatio = totalTasks > 0 ? completed / totalTasks : 0;
    const estimatedCompletion =
      completedRatio > 0 ? new Date(Date.now() + (1 - completedRatio) * 3600000) : null;

    return { completed, remaining, blocked, estimatedCompletion };
  }

  private async getPlanOrThrow(id: string): Promise<PlanEntity> {
    const plan = await this.repository.getPlan(id);
    if (!plan) {
      throw new NotFoundException(`Plan ${id} not found`);
    }
    return plan;
  }
}
