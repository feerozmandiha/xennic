import { randomUUID } from 'node:crypto';
import type { Versioned } from '../../shared/types/index.js';

export enum PlanStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum PlanStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export interface PlanStep {
  id: string;
  description: string;
  order: number;
  status: PlanStepStatus;
  dependsOn: string[];
  input: Record<string, unknown>;
  expectedOutput: string | null;
}

export interface ReasoningPlanMetadata {
  totalSteps: number;
  estimatedDuration: number | null;
  tags: string[];
  source: string;
  goal: string;
}

export class ReasoningPlan implements Versioned {
  public readonly id: string;
  public readonly goal: string;
  public readonly steps: PlanStep[];
  public readonly status: PlanStatus;
  public readonly metadata: ReasoningPlanMetadata;
  public readonly version: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(
    id: string,
    goal: string,
    steps: PlanStep[],
    status: PlanStatus,
    metadata: ReasoningPlanMetadata,
    version: number,
    createdAt: Date,
    updatedAt: Date,
  ) {
    this.id = id;
    this.goal = goal;
    this.steps = steps;
    this.status = status;
    this.metadata = metadata;
    this.version = version;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static create(
    goal: string,
    steps: Omit<PlanStep, 'id' | 'status' | 'dependsOn'>[],
    dependsOnMap: Record<number, string[]> = {},
    tags: string[] = [],
    estimatedDuration: number | null = null,
    source = 'manual',
  ): ReasoningPlan {
    const now = new Date();
    const planSteps = steps.map((s) => ({
      id: randomUUID(),
      description: s.description,
      order: s.order,
      status: PlanStepStatus.PENDING,
      dependsOn: dependsOnMap[s.order] ?? [],
      input: s.input,
      expectedOutput: s.expectedOutput ?? null,
    }));

    return new ReasoningPlan(
      randomUUID(),
      goal,
      planSteps,
      PlanStatus.PENDING,
      {
        totalSteps: planSteps.length,
        estimatedDuration,
        tags,
        source,
        goal,
      },
      1,
      now,
      now,
    );
  }

  static reconstitute(
    id: string,
    goal: string,
    steps: PlanStep[],
    status: PlanStatus,
    metadata: ReasoningPlanMetadata,
    version: number,
    createdAt: Date,
    updatedAt: Date,
  ): ReasoningPlan {
    return new ReasoningPlan(id, goal, steps, status, metadata, version, createdAt, updatedAt);
  }

  withStatus(status: PlanStatus): ReasoningPlan {
    return new ReasoningPlan(
      this.id,
      this.goal,
      this.steps,
      status,
      this.metadata,
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }

  withStepStatus(stepId: string, status: PlanStepStatus): ReasoningPlan {
    const steps = this.steps.map(s =>
      s.id === stepId ? { ...s, status } : s,
    );
    return new ReasoningPlan(
      this.id,
      this.goal,
      steps,
      this.status,
      this.metadata,
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }

  withSteps(steps: PlanStep[]): ReasoningPlan {
    return new ReasoningPlan(
      this.id,
      this.goal,
      steps,
      this.status,
      { ...this.metadata, totalSteps: steps.length },
      this.version + 1,
      this.createdAt,
      new Date(),
    );
  }
}
