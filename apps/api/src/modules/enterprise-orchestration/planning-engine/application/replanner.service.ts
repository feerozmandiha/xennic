import { Injectable, Logger, Inject, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PlanTask, TaskStatus } from '../domain/plan.entity.js';
import { PlanEntity } from '../domain/plan.entity.js';
import { TaskGraph } from '../domain/task-graph.vo.js';
import type { IPlannerRepository } from '../domain/planner-repository.interface.js';

export interface PlanChange {
  taskId: string;
  type: 'dependency' | 'description' | 'status' | 'remove';
  value: unknown;
}

@Injectable()
export class ReplannerService {
  private readonly logger = new Logger(ReplannerService.name);

  constructor(
    @Inject('IPlannerRepository')
    private readonly repository: IPlannerRepository,
  ) {}

  async replan(
    planId: string,
    failedTaskIds: string[],
    newTasks?: PlanTask[],
  ): Promise<PlanEntity> {
    const plan = await this.getPlanOrThrow(planId);
    const failedSet = new Set(failedTaskIds);

    const updatedTasks = plan.tasks
      .filter((t) => !failedSet.has(t.id))
      .map((t) => {
        const updatedDeps = t.dependsOn.filter((d) => !failedSet.has(d));
        return { ...t, dependsOn: updatedDeps };
      });

    if (newTasks) {
      for (const task of newTasks) {
        if (!task.id) {
          task.id = randomUUID();
        }
        updatedTasks.push(task);
      }
    }

    const now = new Date();
    const dependencies = plan.dependencies.filter(
      (d) => !failedSet.has(d.from) && !failedSet.has(d.to),
    );

    const updated = PlanEntity.reconstitute(
      plan.id,
      plan.goal,
      updatedTasks,
      dependencies,
      plan.status,
      {
        createdAt: plan.metadata.createdAt,
        updatedAt: now,
        createdBy: plan.metadata.createdBy,
        updatedBy: plan.metadata.updatedBy,
      },
      plan.createdAt,
      now,
    );

    await this.repository.savePlan(updated);
    this.logger.log(`Plan replanned: ${planId}, removed ${failedTaskIds.length} failed tasks`);

    return updated;
  }

  async adjustForChanges(planId: string, changes: PlanChange[]): Promise<PlanEntity> {
    const plan = await this.getPlanOrThrow(planId);
    const taskMap = new Map(plan.tasks.map((t) => [t.id, { ...t }]));

    for (const change of changes) {
      const task = taskMap.get(change.taskId);
      if (!task) {
        this.logger.warn(`Task ${change.taskId} not found for change`);
        continue;
      }

      switch (change.type) {
        case 'dependency':
          task.dependsOn = change.value as string[];
          break;
        case 'description':
          task.description = change.value as string;
          break;
        case 'status':
          task.status = change.value as TaskStatus;
          break;
        case 'remove':
          taskMap.delete(change.taskId);
          break;
      }
    }

    const updatedTasks = Array.from(taskMap.values());
    const now = new Date();
    const updated = PlanEntity.reconstitute(
      plan.id,
      plan.goal,
      updatedTasks,
      plan.dependencies,
      plan.status,
      {
        createdAt: plan.metadata.createdAt,
        updatedAt: now,
        createdBy: plan.metadata.createdBy,
        updatedBy: plan.metadata.updatedBy,
      },
      plan.createdAt,
      now,
    );

    await this.repository.savePlan(updated);
    this.logger.log(`Plan adjusted: ${planId}, ${changes.length} changes applied`);

    return updated;
  }

  async optimizeOrder(planId: string): Promise<PlanEntity> {
    const plan = await this.getPlanOrThrow(planId);
    const graph = TaskGraph.create(plan);

    const orderedIds = graph.nodes
      .sort((a, b) => a.level - b.level || a.order - b.order)
      .map((n) => n.taskId);

    const taskMap = new Map(plan.tasks.map((t) => [t.id, t]));
    const reorderedTasks = orderedIds.map((id) => taskMap.get(id)!).filter(Boolean);

    const now = new Date();
    const updated = PlanEntity.reconstitute(
      plan.id,
      plan.goal,
      reorderedTasks,
      plan.dependencies,
      plan.status,
      {
        createdAt: plan.metadata.createdAt,
        updatedAt: now,
        createdBy: plan.metadata.createdBy,
        updatedBy: plan.metadata.updatedBy,
      },
      plan.createdAt,
      now,
    );

    await this.repository.savePlan(updated);
    this.logger.log(`Plan order optimized: ${planId}`);

    return updated;
  }

  async mergePlans(primaryId: string, secondaryId: string): Promise<PlanEntity> {
    const [primary, secondary] = await Promise.all([
      this.getPlanOrThrow(primaryId),
      this.getPlanOrThrow(secondaryId),
    ]);

    const existingIds = new Set(primary.tasks.map((t) => t.id));
    const mergedTasks = [
      ...primary.tasks,
      ...secondary.tasks.filter((t) => !existingIds.has(t.id)),
    ];

    const mergedDeps = [
      ...primary.dependencies,
      ...secondary.dependencies.filter(
        (d) => !primary.dependencies.some((pd) => pd.from === d.from && pd.to === d.to),
      ),
    ];

    const now = new Date();
    const merged = PlanEntity.reconstitute(
      randomUUID(),
      primary.goal,
      mergedTasks,
      mergedDeps,
      'pending',
      {
        createdAt: now,
        updatedAt: now,
        createdBy: primary.metadata.createdBy,
        updatedBy: null,
      },
      now,
      now,
    );

    await this.repository.savePlan(merged);
    this.logger.log(`Plans merged: ${primaryId} + ${secondaryId} = ${merged.id}`);

    return merged;
  }

  private async getPlanOrThrow(id: string): Promise<PlanEntity> {
    const plan = await this.repository.getPlan(id);
    if (!plan) {
      throw new NotFoundException(`Plan ${id} not found`);
    }
    return plan;
  }
}
