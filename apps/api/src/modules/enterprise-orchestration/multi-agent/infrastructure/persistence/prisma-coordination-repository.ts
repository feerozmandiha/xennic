import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { CoordinationPlan, CoordinationTask } from '../../domain/coordination-plan.entity.js';
import type {
  ICoordinationRepository,
  ListPlanOptions,
} from '../../domain/coordination-repository.interface.js';
import type { AgentRole } from '../../domain/agent-role.enum.js';
import type { PaginatedResult } from '../../../shared/types/index.js';

@Injectable()
export class PrismaCoordinationRepository implements ICoordinationRepository {
  private readonly logger = new Logger(PrismaCoordinationRepository.name);

  async savePlan(plan: CoordinationPlan): Promise<void> {
    const planData = {
      goal: plan.goal,
      assignments: plan.assignments,
      metadata: plan.metadata,
    } as unknown as Record<string, unknown>;

    await prisma.coordination_plans.upsert({
      where: { id: plan.id },
      create: {
        id: plan.id,
        execution_id: plan.workflowExecutionId,
        plan: planData,
        status: plan.status,
      },
      update: {
        execution_id: plan.workflowExecutionId,
        plan: planData,
        status: plan.status,
      },
    });

    for (const task of plan.tasks) {
      await prisma.coordination_tasks.upsert({
        where: { id: task.id },
        create: {
          id: task.id,
          plan_id: plan.id,
          agent_role: task.role,
          task_type: task.description,
          input: task.input as any,
          output: (task.output ?? null) as any,
          status: task.status,
          assigned_to: task.assignedTo,
          started_at: null,
          completed_at: null,
        },
        update: {
          agent_role: task.role,
          task_type: task.description,
          input: task.input as any,
          output: (task.output ?? null) as any,
          status: task.status,
          assigned_to: task.assignedTo,
        },
      });
    }

    this.logger.debug(`Saved coordination plan ${plan.id}`);
  }

  async getPlan(id: string): Promise<CoordinationPlan | null> {
    const row = await prisma.coordination_plans.findUnique({ where: { id } });
    if (!row) return null;

    return this.rowToPlan(row);
  }

  async findPlanByExecution(executionId: string): Promise<CoordinationPlan | null> {
    const row = await prisma.coordination_plans.findFirst({
      where: { execution_id: executionId },
    });
    if (!row) return null;

    return this.rowToPlan(row);
  }

  async saveTask(task: CoordinationTask): Promise<void> {
    const planRow = await prisma.coordination_plans.findFirst({
      where: { execution_id: task.assignedTo },
      orderBy: { created_at: 'desc' },
    });

    await prisma.coordination_tasks.upsert({
      where: { id: task.id },
      create: {
        id: task.id,
        plan_id: planRow?.id ?? 'orphaned',
        agent_role: task.role,
        task_type: task.description,
        input: task.input as any,
        output: (task.output ?? null) as any,
        status: task.status,
        assigned_to: task.assignedTo,
        started_at: null,
        completed_at: null,
      },
      update: {
        agent_role: task.role,
        task_type: task.description,
        input: task.input as any,
        output: (task.output ?? null) as any,
        status: task.status,
        assigned_to: task.assignedTo,
      },
    });
    this.logger.debug(`Task ${task.id} saved`);
  }

  async updateTask(taskId: string, updates: Partial<CoordinationTask>): Promise<CoordinationTask | null> {
    const data: Record<string, unknown> = {};
    if (updates.description !== undefined) data.task_type = updates.description;
    if (updates.role !== undefined) data.agent_role = updates.role;
    if (updates.input !== undefined) data.input = updates.input as any;
    if (updates.output !== undefined) data.output = (updates.output ?? null) as any;
    if (updates.status !== undefined) data.status = updates.status;
    if (updates.assignedTo !== undefined) data.assigned_to = updates.assignedTo;

    try {
      await prisma.coordination_tasks.update({
        where: { id: taskId },
        data: data as any,
      });
    } catch {
      return null;
    }

    const row = await prisma.coordination_tasks.findUnique({ where: { id: taskId } });
    if (!row) return null;

    return this.rowToTask(row);
  }

  async getPendingTasks(role?: AgentRole): Promise<CoordinationTask[]> {
    const where: Record<string, unknown> = { status: 'pending' };
    if (role) {
      where.agent_role = role;
    }

    const rows = await prisma.coordination_tasks.findMany({
      where: where as any,
      orderBy: { created_at: 'asc' },
    });

    return rows.map(row => this.rowToTask(row));
  }

  async listPlans(options?: ListPlanOptions): Promise<PaginatedResult<CoordinationPlan>> {
    const where: Record<string, unknown> = {};
    if (options?.status) {
      where.status = options.status;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.coordination_plans.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.coordination_plans.count({ where: where as any }),
    ]);

    const items = await Promise.all(rows.map(row => this.rowToPlan(row)));

    return { items, total, offset, limit };
  }

  private async rowToPlan(row: any): Promise<CoordinationPlan> {
    const planData = row.plan as Record<string, unknown> ?? {};
    const taskRows = await prisma.coordination_tasks.findMany({
      where: { plan_id: row.id },
      orderBy: { created_at: 'asc' },
    });

    const tasks: CoordinationTask[] = taskRows.map(t => this.rowToTask(t));

    const { CoordinationPlan: Plan } = await import('../../domain/coordination-plan.entity.js');
    return Plan.reconstitute(
      row.id,
      row.execution_id,
      (planData.goal as string) ?? '',
      (planData.assignments as any[]) ?? [],
      tasks,
      row.status as any,
      (planData.metadata as any) ?? {},
      row.created_at,
      row.updated_at,
    ) as CoordinationPlan;
  }

  private rowToTask(row: any): CoordinationTask {
    return {
      id: row.id,
      description: row.task_type,
      assignedTo: row.assigned_to ?? '',
      role: row.agent_role as AgentRole,
      input: (row.input as Record<string, unknown>) ?? {},
      output: (row.output as Record<string, unknown> | null) ?? null,
      status: row.status as any,
      dependsOn: [],
      createdAt: row.created_at,
    } as CoordinationTask;
  }
}
