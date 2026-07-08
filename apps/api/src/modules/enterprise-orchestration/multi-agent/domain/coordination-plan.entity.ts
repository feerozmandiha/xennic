import { randomUUID } from 'node:crypto';
import type { ExecutionStatus, Metadata } from '../../shared/types/index.js';
import type { AgentAssignment, AgentRole } from './agent-role.enum.js';

export interface CoordinationTask {
  id: string;
  description: string;
  assignedTo: string;
  role: AgentRole;
  input: Record<string, unknown>;
  output?: Record<string, unknown> | null;
  status: ExecutionStatus;
  dependsOn: string[];
  createdAt: Date;
}

export interface CoordinationPlanOptions {
  workflowExecutionId: string;
  goal: string;
  assignments?: AgentAssignment[];
  tasks?: CoordinationTask[];
  metadata: Metadata;
}

export class CoordinationPlan {
  public readonly id: string;
  public readonly workflowExecutionId: string;
  public readonly goal: string;
  public readonly assignments: AgentAssignment[];
  public readonly tasks: CoordinationTask[];
  public readonly status: ExecutionStatus;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    workflowExecutionId: string,
    goal: string,
    assignments: AgentAssignment[],
    tasks: CoordinationTask[],
    status: ExecutionStatus,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.workflowExecutionId = workflowExecutionId;
    this.goal = goal;
    this.assignments = assignments;
    this.tasks = tasks;
    this.status = status;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(opts: CoordinationPlanOptions): CoordinationPlan {
    const now = new Date();
    return new CoordinationPlan(
      randomUUID(),
      opts.workflowExecutionId,
      opts.goal,
      opts.assignments ?? [],
      opts.tasks ?? [],
      'pending',
      opts.metadata,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    workflowExecutionId: string,
    goal: string,
    assignments: AgentAssignment[],
    tasks: CoordinationTask[],
    status: ExecutionStatus,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ): CoordinationPlan {
    return new CoordinationPlan(
      id,
      workflowExecutionId,
      goal,
      assignments,
      tasks,
      status,
      metadata,
      createdAt,
      updatedAt,
    );
  }
}
