import { Injectable, Logger } from '@nestjs/common';
import { CoordinationPlan } from '../../domain/coordination-plan.entity.js';
import type { CoordinationTask } from '../../domain/coordination-plan.entity.js';
import type {
  ICoordinationRepository,
  ListPlanOptions,
} from '../../domain/coordination-repository.interface.js';
import type { AgentRole } from '../../domain/agent-role.enum.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class InMemoryCoordinationRepository implements ICoordinationRepository {
  private readonly logger = new Logger(InMemoryCoordinationRepository.name);
  private readonly plans = new Map<string, CoordinationPlan>();

  async savePlan(plan: CoordinationPlan): Promise<void> {
    this.plans.set(plan.id, plan);
    this.logger.debug(`Saved coordination plan ${plan.id}`);
  }

  async getPlan(id: string): Promise<CoordinationPlan | null> {
    return this.plans.get(id) ?? null;
  }

  async findPlanByExecution(executionId: string): Promise<CoordinationPlan | null> {
    for (const plan of this.plans.values()) {
      if (plan.workflowExecutionId === executionId) {
        return plan;
      }
    }
    return null;
  }

  async saveTask(task: CoordinationTask): Promise<void> {
    for (const plan of this.plans.values()) {
      const idx = plan.tasks.findIndex(t => t.id === task.id);
      if (idx !== -1) {
        plan.tasks[idx] = task;
        return;
      }
    }
    this.logger.debug(`Task ${task.id} saved but not linked to any plan in memory`);
  }

  async updateTask(taskId: string, updates: Partial<CoordinationTask>): Promise<CoordinationTask | null> {
    for (const plan of this.plans.values()) {
      const existing = plan.tasks.find(t => t.id === taskId);
      if (!existing) {
        continue;
      }
      const updated: CoordinationTask = {
        id: updates.id ?? existing.id,
        description: updates.description ?? existing.description,
        assignedTo: updates.assignedTo ?? existing.assignedTo,
        role: updates.role ?? existing.role,
        input: updates.input ?? existing.input,
        output: updates.output !== undefined ? updates.output : existing.output,
        status: updates.status ?? existing.status,
        dependsOn: updates.dependsOn ?? existing.dependsOn,
        createdAt: updates.createdAt ?? existing.createdAt,
      };
      const idx = plan.tasks.indexOf(existing);
      plan.tasks[idx] = updated;
      return updated;
    }
    return null;
  }

  async getPendingTasks(role?: AgentRole): Promise<CoordinationTask[]> {
    const pending: CoordinationTask[] = [];
    for (const plan of this.plans.values()) {
      for (const task of plan.tasks) {
        if (task.status === 'pending') {
          if (role && task.role !== role) {
            continue;
          }
          pending.push(task);
        }
      }
    }
    return pending;
  }

  async listPlans(options?: ListPlanOptions): Promise<PaginatedResult<CoordinationPlan>> {
    let items = Array.from(this.plans.values());

    if (options?.status) {
      items = items.filter(p => p.status === options.status);
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
}
