import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import type { ICoordinationRepository } from '../domain/coordination-repository.interface.js';

export interface CritiqueResult {
  taskId: string;
  observations: string[];
  score: number;
  suggestions: string[];
}

export interface PlanAnalysis {
  planId: string;
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  blockedTasks: number;
  efficiency: number;
  bottlenecks: string[];
  recommendations: string[];
}

@Injectable()
export class CriticService {
  private readonly logger = new Logger(CriticService.name);

  constructor(
    @Inject('ICoordinationRepository')
    private readonly repository: ICoordinationRepository,
  ) {}

  async critique(taskId: string, result: Record<string, unknown>): Promise<CritiqueResult> {
    const task = await this.repository.updateTask(taskId, { status: 'running' });
    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`);
    }

    this.logger.log(`Critiquing task ${taskId}`);

    const observations: string[] = [];
    const suggestions: string[] = [];

    if (!result.output || Object.keys(result.output).length === 0) {
      observations.push('No output produced');
      suggestions.push('Ensure task produces meaningful output');
    }
    if (result.error) {
      observations.push(`Task encountered error: ${result.error}`);
      suggestions.push('Handle errors gracefully and retry');
    }
    const duration = result.duration as number | undefined;
    if (duration === undefined || duration < 0) {
      observations.push('Missing or invalid duration');
    }

    const issues = observations.length;
    const score = Math.max(0, 10 - issues * 3);

    if (score < 5) {
      suggestions.push('Review task requirements and re-execute');
    }

    await this.repository.updateTask(taskId, { status: 'completed' });
    this.logger.log(
      `Critique for task ${taskId}: score=${score}, observations=${observations.length}`,
    );

    return { taskId, observations, score, suggestions };
  }

  async analyzePlan(planId: string): Promise<PlanAnalysis> {
    const plan = await this.repository.getPlan(planId);
    if (!plan) {
      throw new NotFoundException(`Plan ${planId} not found`);
    }

    const totalTasks = plan.tasks.length;
    const completedTasks = plan.tasks.filter((t) => t.status === 'completed').length;
    const failedTasks = plan.tasks.filter((t) => t.status === 'failed').length;
    const pendingTasks = plan.tasks.filter((t) => t.status === 'pending').length;
    const runningTasks = plan.tasks.filter((t) => t.status === 'running').length;

    const failedIds = plan.tasks.filter((t) => t.status === 'failed').map((t) => t.id);
    const blockedTasks = plan.tasks.filter(
      (t) => t.status === 'pending' && t.dependsOn.some((d) => failedIds.includes(d)),
    ).length;

    const efficiency = totalTasks > 0 ? completedTasks / totalTasks : 0;

    const bottlenecks: string[] = [];
    if (failedTasks > 0) {
      bottlenecks.push(`${failedTasks} task(s) have failed`);
    }
    if (blockedTasks > 0) {
      bottlenecks.push(`${blockedTasks} task(s) are blocked`);
    }
    if (pendingTasks > 0 && runningTasks === 0) {
      bottlenecks.push('No tasks currently running');
    }

    const recommendations: string[] = [];
    if (failedTasks > 0) {
      recommendations.push('Investigate and fix failed tasks');
    }
    if (blockedTasks > 0) {
      recommendations.push('Resolve blocking dependencies');
    }
    if (efficiency < 0.5) {
      recommendations.push('Consider redistributing workload');
    }

    this.logger.log(`Analyzed plan ${planId}: ${totalTasks} tasks, efficiency ${efficiency}`);

    return {
      planId,
      totalTasks,
      completedTasks,
      failedTasks,
      blockedTasks,
      efficiency,
      bottlenecks,
      recommendations,
    };
  }

  async suggestImprovements(planId: string): Promise<string[]> {
    const analysis = await this.analyzePlan(planId);
    return analysis.recommendations;
  }
}
