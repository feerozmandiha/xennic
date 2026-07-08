import { randomUUID } from 'node:crypto';
import type { ExecutionStatus, Metadata } from '../../shared/types/index.js';

export type TaskStatus = 'pending' | 'assigned' | 'running' | 'completed' | 'failed';
export type DependencyType = 'hard' | 'soft';

export interface PlanTask {
  id: string;
  description: string;
  type: string;
  status: TaskStatus;
  dependsOn: string[];
  input?: Record<string, unknown>;
  expectedOutput?: string;
  result?: Record<string, unknown>;
}

export interface Dependency {
  from: string;
  to: string;
  type: DependencyType;
}

export interface PlanEntityOptions {
  goal: string;
  tasks: PlanTask[];
  dependencies: Dependency[];
  metadata: Metadata;
}

export class PlanEntity {
  public readonly id: string;
  public readonly goal: string;
  public readonly tasks: PlanTask[];
  public readonly dependencies: Dependency[];
  public readonly status: ExecutionStatus;
  public readonly metadata: Metadata;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    goal: string,
    tasks: PlanTask[],
    dependencies: Dependency[],
    status: ExecutionStatus,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.goal = goal;
    this.tasks = tasks;
    this.dependencies = dependencies;
    this.status = status;
    this.metadata = metadata;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(opts: PlanEntityOptions): PlanEntity {
    const now = new Date();
    const tasks = opts.tasks.map(t => ({
      ...t,
      id: t.id ?? randomUUID(),
      status: t.status ?? ('pending' as TaskStatus),
    }));
    return new PlanEntity(
      randomUUID(),
      opts.goal,
      tasks,
      opts.dependencies,
      'pending',
      opts.metadata,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    goal: string,
    tasks: PlanTask[],
    dependencies: Dependency[],
    status: ExecutionStatus,
    metadata: Metadata,
    createdAt: Date,
    updatedAt: Date,
  ): PlanEntity {
    return new PlanEntity(id, goal, tasks, dependencies, status, metadata, createdAt, updatedAt);
  }
}
