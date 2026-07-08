import { Injectable, Logger } from '@nestjs/common';
import type { ExecutionStatus, PaginatedResult } from '../../../shared/types/index.js';
import type { IExecutionRepository, ListExecutionOptions } from '../../domain/execution-repository.interface.js';
import type { WorkflowExecution } from '../../domain/workflow-execution.entity.js';
import type { CompensationEntry } from '../../domain/compensation.entity.js';

@Injectable()
export class InMemoryExecutionRepository implements IExecutionRepository {
  private readonly logger = new Logger(InMemoryExecutionRepository.name);
  private readonly executions = new Map<string, WorkflowExecution>();
  private readonly workflowIndex = new Map<string, string[]>();
  private readonly compensations = new Map<string, CompensationEntry[]>();

  async save(execution: WorkflowExecution): Promise<void> {
    this.executions.set(execution.id, execution);

    const existing = this.workflowIndex.get(execution.workflowId) ?? [];
    if (!existing.includes(execution.id)) {
      existing.push(execution.id);
    }
    this.workflowIndex.set(execution.workflowId, existing);

    this.logger.debug(`Saved execution ${execution.id}`);
  }

  async get(id: string): Promise<WorkflowExecution | null> {
    return this.executions.get(id) ?? null;
  }

  async findByWorkflow(workflowId: string, options?: ListExecutionOptions): Promise<PaginatedResult<WorkflowExecution>> {
    const ids = this.workflowIndex.get(workflowId) ?? [];
    let items = ids.map(id => this.executions.get(id)).filter((e): e is WorkflowExecution => e !== undefined);

    if (options?.status) {
      items = items.filter(e => e.status === options.status);
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

  async list(options?: ListExecutionOptions): Promise<PaginatedResult<WorkflowExecution>> {
    let items = Array.from(this.executions.values());

    if (options?.status) {
      items = items.filter(e => e.status === options.status);
    }

    if (options?.workflowId) {
      items = items.filter(e => e.workflowId === options.workflowId);
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

  async updateStatus(id: string, status: ExecutionStatus): Promise<void> {
    const execution = this.executions.get(id);
    if (execution) {
      execution.status = status;
      this.executions.set(id, execution);
      this.logger.debug(`Updated execution ${id} status to ${status}`);
    }
  }

  async saveCompensation(entry: CompensationEntry): Promise<void> {
    const existing = this.compensations.get(entry.executionId) ?? [];
    existing.push(entry);
    this.compensations.set(entry.executionId, existing);
    this.logger.debug(`Saved compensation entry ${entry.id}`);
  }

  async getCompensations(executionId: string): Promise<CompensationEntry[]> {
    return this.compensations.get(executionId) ?? [];
  }
}
