import { Injectable, Logger } from '@nestjs/common';
import type { ReasoningPlan } from '../../reasoning-engine/domain/reasoning-plan.entity.js';
import { ReasoningEngineService } from '../../reasoning-engine/application/reasoning-engine.service.js';

export interface PlanStepInput {
  description: string;
  input: Record<string, unknown>;
  expectedOutput?: string;
}

@Injectable()
export class ReasoningApi {
  private readonly logger = new Logger(ReasoningApi.name);

  constructor(private readonly engine: ReasoningEngineService) {}

  async plan(
    goal: string,
    steps: PlanStepInput[],
    dependencies?: Record<number, string[]>,
    tags?: string[],
  ): Promise<ReasoningPlan> {
    this.logger.debug(`plan(goal=${goal})`);
    return this.engine.createPlan({ goal, steps, dependencies, tags });
  }

  async execute(planId: string): Promise<ReasoningPlan> {
    this.logger.debug(`execute(planId=${planId})`);
    return this.engine.executePlan(planId);
  }

  async getPlan(id: string): Promise<ReasoningPlan> {
    return this.engine.getPlan(id);
  }

  async verify(stepId: string, _result: Record<string, unknown>): Promise<boolean> {
    this.logger.debug(`verify(stepId=${stepId})`);
    return true;
  }

  async reflect(stepId: string, result: Record<string, unknown>): Promise<Record<string, unknown>> {
    this.logger.debug(`reflect(stepId=${stepId})`);
    return { stepId, result, reflection: 'completed' };
  }
}
