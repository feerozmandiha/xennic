import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ExecutionStatus, PaginatedResult } from '../../../shared/types/index.js';
import type { IExecutionRepository, ListExecutionOptions } from '../../domain/execution-repository.interface.js';
import type { WorkflowExecution } from '../../domain/workflow-execution.entity.js';
import type { CompensationEntry } from '../../domain/compensation.entity.js';

@Injectable()
export class PrismaExecutionRepository implements IExecutionRepository {
  private readonly logger = new Logger(PrismaExecutionRepository.name);

  async save(execution: WorkflowExecution): Promise<void> {
    const input = {
      steps: execution.steps,
      context: execution.context,
      metadata: execution.metadata,
      workflowName: execution.metadata?.createdBy ?? 'unknown',
    } as unknown as Record<string, unknown>;

    await prisma.workflow_executions.upsert({
      where: { id: execution.id },
      create: {
        id: execution.id,
        workflow_id: execution.workflowId,
        workflow_name: input.workflowName as string,
        workflow_version: execution.workflowVersion,
        status: execution.status,
        input,
        output: execution.output as any,
        error: execution.error,
        started_at: execution.startedAt,
        completed_at: execution.completedAt,
      },
      update: {
        status: execution.status,
        input,
        output: execution.output as any,
        error: execution.error,
        started_at: execution.startedAt,
        completed_at: execution.completedAt,
      },
    });
    this.logger.debug(`Saved execution ${execution.id}`);
  }

  async get(id: string): Promise<WorkflowExecution | null> {
    const row = await prisma.workflow_executions.findUnique({ where: { id } });
    if (!row) return null;

    const { WorkflowExecution: WfExec } = await import('../../domain/workflow-execution.entity.js');
    const input = row.input as Record<string, unknown> | null;
    return WfExec.reconstitute(
      row.id,
      row.workflow_id,
      row.workflow_version,
      row.status as ExecutionStatus,
      (input?.steps as any[]) ?? [],
      (input?.context as Record<string, unknown>) ?? {},
      row.output as Record<string, unknown> | null,
      row.error,
      row.started_at,
      row.completed_at,
      (input?.metadata as any) ?? {},
      row.created_at,
    ) as WorkflowExecution;
  }

  async findByWorkflow(workflowId: string, options?: ListExecutionOptions): Promise<PaginatedResult<WorkflowExecution>> {
    const where: Record<string, unknown> = { workflow_id: workflowId };
    if (options?.status) {
      where.status = options.status;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.workflow_executions.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.workflow_executions.count({ where: where as any }),
    ]);

    const { WorkflowExecution: WfExec } = await import('../../domain/workflow-execution.entity.js');
    const items = rows.map(row => {
      const input = row.input as Record<string, unknown> | null;
      return WfExec.reconstitute(
        row.id,
        row.workflow_id,
        row.workflow_version,
        row.status as ExecutionStatus,
        (input?.steps as any[]) ?? [],
        (input?.context as Record<string, unknown>) ?? {},
        row.output as Record<string, unknown> | null,
        row.error,
        row.started_at,
        row.completed_at,
        (input?.metadata as any) ?? {},
        row.created_at,
      ) as WorkflowExecution;
    });

    return { items, total, offset, limit };
  }

  async list(options?: ListExecutionOptions): Promise<PaginatedResult<WorkflowExecution>> {
    const where: Record<string, unknown> = {};
    if (options?.status) {
      where.status = options.status;
    }
    if (options?.workflowId) {
      where.workflow_id = options.workflowId;
    }

    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const [rows, total] = await Promise.all([
      prisma.workflow_executions.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.workflow_executions.count({ where: where as any }),
    ]);

    const { WorkflowExecution: WfExec } = await import('../../domain/workflow-execution.entity.js');
    const items = rows.map(row => {
      const input = row.input as Record<string, unknown> | null;
      return WfExec.reconstitute(
        row.id,
        row.workflow_id,
        row.workflow_version,
        row.status as ExecutionStatus,
        (input?.steps as any[]) ?? [],
        (input?.context as Record<string, unknown>) ?? {},
        row.output as Record<string, unknown> | null,
        row.error,
        row.started_at,
        row.completed_at,
        (input?.metadata as any) ?? {},
        row.created_at,
      ) as WorkflowExecution;
    });

    return { items, total, offset, limit };
  }

  async updateStatus(id: string, status: ExecutionStatus): Promise<void> {
    await prisma.workflow_executions.update({
      where: { id },
      data: { status },
    });
    this.logger.debug(`Updated execution ${id} status to ${status}`);
  }

  async saveCompensation(entry: CompensationEntry): Promise<void> {
    await prisma.compensation_entries.upsert({
      where: { id: entry.id },
      create: {
        id: entry.id,
        execution_id: entry.executionId,
        step_id: entry.stepId,
        action: entry.action,
        status: entry.status,
        payload: entry.output as any,
        error: entry.error,
        executed_at: null,
      },
      update: {
        status: entry.status,
        payload: entry.output as any,
        error: entry.error,
      },
    });
    this.logger.debug(`Saved compensation entry ${entry.id}`);
  }

  async getCompensations(executionId: string): Promise<CompensationEntry[]> {
    const rows = await prisma.compensation_entries.findMany({
      where: { execution_id: executionId },
      orderBy: { created_at: 'asc' },
    });

    const { CompensationEntry: Comp } = await import('../../domain/compensation.entity.js');
    return rows.map(row =>
      Comp.reconstitute(
        row.id,
        row.execution_id,
        row.step_id,
        row.action,
        row.status as any,
        row.payload as Record<string, unknown> | null,
        row.error,
        row.created_at,
      ) as CompensationEntry,
    );
  }
}
