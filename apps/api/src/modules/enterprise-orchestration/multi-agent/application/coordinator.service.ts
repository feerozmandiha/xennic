import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { ICoordinationRepository } from '../domain/coordination-repository.interface.js';
import type { CoordinationTask } from '../domain/coordination-plan.entity.js';
import { CoordinationPlan } from '../domain/coordination-plan.entity.js';
import type { AgentRole } from '../domain/agent-role.enum.js';

export interface AgentWorkload {
  agentId: string;
  currentTasks: CoordinationTask[];
  count: number;
}

@Injectable()
export class CoordinatorService {
  private readonly logger = new Logger(CoordinatorService.name);

  constructor(
    @Inject('ICoordinationRepository')
    private readonly repository: ICoordinationRepository,
  ) {}

  async assignTask(
    planId: string,
    description: string,
    agentId: string,
    role: AgentRole,
    input: Record<string, unknown> = {},
    dependsOn: string[] = [],
  ): Promise<CoordinationPlan> {
    const plan = await this.getPlanOrThrow(planId);

    const task: CoordinationTask = {
      id: randomUUID(),
      description,
      assignedTo: agentId,
      role,
      input,
      output: null,
      status: 'pending',
      dependsOn,
      createdAt: new Date(),
    };

    plan.tasks.push(task);
    await this.repository.saveTask(task);
    this.logger.log(`Task ${task.id} assigned to ${agentId} (${role}) in plan ${planId}`);
    return plan;
  }

  async distribute(planId: string): Promise<CoordinationTask[]> {
    const plan = await this.getPlanOrThrow(planId);
    const assigned: CoordinationTask[] = [];

    for (const task of plan.tasks) {
      if (task.status !== 'pending') {
        continue;
      }

      const depsMet = task.dependsOn.every((depId) => {
        const dep = plan.tasks.find((t) => t.id === depId);
        return dep && dep.status === 'completed';
      });

      if (!depsMet) {
        continue;
      }

      task.status = 'running';
      await this.repository.updateTask(task.id, { status: 'running' });
      assigned.push(task);
      this.logger.log(`Distributed task ${task.id} to agent ${task.assignedTo}`);
    }

    return assigned;
  }

  async getWorkload(agentId: string): Promise<AgentWorkload> {
    const { items: plans } = await this.repository.listPlans();
    const currentTasks: CoordinationTask[] = [];

    for (const plan of plans) {
      for (const task of plan.tasks) {
        if (
          task.assignedTo === agentId &&
          (task.status === 'running' || task.status === 'pending')
        ) {
          currentTasks.push(task);
        }
      }
    }

    return {
      agentId,
      currentTasks,
      count: currentTasks.length,
    };
  }

  async rebalance(planId: string): Promise<CoordinationPlan> {
    const plan = await this.getPlanOrThrow(planId);
    const runningTasks = plan.tasks.filter((t) => t.status === 'running');
    const pendingTasks = plan.tasks.filter((t) => t.status === 'pending');

    if (runningTasks.length === 0 && pendingTasks.length === 0) {
      return plan;
    }

    const agentAssignments = this.calculateWorkloadDistribution(plan);
    for (const [agentId, taskCount] of agentAssignments) {
      this.logger.debug(`Agent ${agentId}: ${taskCount} tasks after rebalance`);
    }

    plan.tasks.sort((a, b) => {
      const aDeps = a.dependsOn.length;
      const bDeps = b.dependsOn.length;
      return aDeps - bDeps;
    });

    this.logger.log(`Rebalanced plan ${planId}: ${plan.tasks.length} tasks`);
    return plan;
  }

  private calculateWorkloadDistribution(plan: CoordinationPlan): Map<string, number> {
    const distribution = new Map<string, number>();
    for (const task of plan.tasks) {
      const count = distribution.get(task.assignedTo) ?? 0;
      distribution.set(task.assignedTo, count + 1);
    }
    return distribution;
  }

  private async getPlanOrThrow(id: string): Promise<CoordinationPlan> {
    const plan = await this.repository.getPlan(id);
    if (!plan) {
      throw new NotFoundException(`Plan ${id} not found`);
    }
    return plan;
  }
}
