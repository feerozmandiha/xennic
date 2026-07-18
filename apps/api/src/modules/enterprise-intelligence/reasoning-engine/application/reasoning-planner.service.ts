import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import type { IReasoningRepository } from '../domain/reasoning-repository.interface.js';
import { ReasoningPlan, PlanStep } from '../domain/reasoning-plan.entity.js';

interface AvailableStep {
  id: string;
  description: string;
  input: Record<string, unknown>;
  expectedOutput?: string;
  dependencies?: string[];
}

@Injectable()
export class ReasoningPlannerService {
  private readonly logger = new Logger(ReasoningPlannerService.name);

  constructor(@Inject('IReasoningRepository') private readonly repo: IReasoningRepository) {}

  async plan(goal: string, availableSteps: AvailableStep[] = []): Promise<ReasoningPlan> {
    const planSteps = availableSteps.map((s, i) => ({
      description: s.description,
      order: i + 1,
      input: s.input,
      expectedOutput: s.expectedOutput ?? null,
    }));

    const plan = ReasoningPlan.create(goal, planSteps, {}, [], null, 'planner');

    const availIdToStepId = new Map<string, string>();
    for (const [i, step] of availableSteps.entries()) {
      availIdToStepId.set(step.id, plan.steps[i]!.id);
    }

    const updatedSteps = plan.steps.map((step, i) => {
      const availStep = availableSteps[i]!;
      const depIds = (availStep.dependencies ?? []).map(
        (depId) => availIdToStepId.get(depId) ?? depId,
      );
      return { ...step, dependsOn: depIds };
    });

    const finalPlan = plan.withSteps(updatedSteps);
    await this.repo.savePlan(finalPlan);
    this.logger.debug(`Created plan ${finalPlan.id} with ${finalPlan.steps.length} steps`);
    return finalPlan;
  }

  async optimizePlan(planId: string): Promise<ReasoningPlan> {
    const plan = await this.repo.getPlan(planId);
    if (!plan) {
      throw new BadRequestException(`Plan ${planId} not found`);
    }

    const steps = [...plan.steps];

    steps.sort((a, b) => {
      const aDeps = a.dependsOn.length;
      const bDeps = b.dependsOn.length;
      if (aDeps !== bDeps) return aDeps - bDeps;
      return a.order - b.order;
    });

    const mergedSteps: PlanStep[] = [];
    const depMap = new Map<string, string[]>();

    for (const step of steps) {
      const last = mergedSteps[mergedSteps.length - 1];
      if (
        last &&
        last.dependsOn.length === 0 &&
        step.dependsOn.length === 0 &&
        step.description.length < 50 &&
        last.description.length < 50
      ) {
        mergedSteps[mergedSteps.length - 1] = {
          ...last,
          description: `${last.description}; ${step.description}`,
          input: { ...last.input, ...step.input },
          expectedOutput: last.expectedOutput ?? step.expectedOutput,
        };
        continue;
      }

      const remappedDeps = (depMap.get(step.id) ?? step.dependsOn).map((depId) => {
        const depStep = mergedSteps.find((s) => s.description.includes(depId));
        return depStep ? depStep.id : depId;
      });

      mergedSteps.push({
        ...step,
        order: mergedSteps.length + 1,
        dependsOn: remappedDeps,
      });
    }

    const optimized = plan.withSteps(mergedSteps);
    await this.repo.savePlan(optimized);
    this.logger.debug(
      `Optimized plan ${planId}: ${plan.steps.length} → ${optimized.steps.length} steps`,
    );
    return optimized;
  }

  decomposeGoal(goal: string): { subgoals: string[]; dependencies: string[][] } {
    const sentences = goal.split(/[.?!\n]+/).filter((s) => s.trim().length > 0);
    const subgoals = sentences.map((s) => s.trim());
    const dependencies: string[][] = [];

    for (let i = 0; i < subgoals.length; i++) {
      const deps: string[] = [];
      for (let j = 0; j < i; j++) {
        const sub = subgoals[j]!;
        if (this.hasTermDependency(subgoals[i]!, sub)) {
          deps.push(sub);
        }
      }
      dependencies.push(deps);
    }

    return { subgoals, dependencies };
  }

  async validatePlan(
    planId: string,
  ): Promise<{ valid: boolean; errors: string[]; warnings: string[] }> {
    const plan = await this.repo.getPlan(planId);
    if (!plan) {
      throw new BadRequestException(`Plan ${planId} not found`);
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    if (plan.steps.length === 0) {
      errors.push('Plan has no steps');
      return { valid: false, errors, warnings };
    }

    if (this.hasCycles(plan.steps)) {
      errors.push('Plan contains circular dependencies');
    }

    const stepIds = new Set(plan.steps.map((s) => s.id));
    for (const step of plan.steps) {
      for (const depId of step.dependsOn) {
        if (!stepIds.has(depId)) {
          errors.push(`Step ${step.id} depends on non-existent step ${depId}`);
        }
        if (depId === step.id) {
          errors.push(`Step ${step.id} has a self-dependency`);
        }
      }
    }

    const missingDescriptions = plan.steps.filter(
      (s) => !s.description || s.description.trim().length === 0,
    );
    if (missingDescriptions.length > 0) {
      warnings.push(`${missingDescriptions.length} step(s) have empty descriptions`);
    }

    return { valid: errors.length === 0, errors, warnings };
  }

  private hasCycles(steps: PlanStep[]): boolean {
    const adj = new Map<string, string[]>();
    for (const step of steps) {
      adj.set(step.id, [...step.dependsOn]);
    }

    const visited = new Set<string>();
    const inStack = new Set<string>();

    function dfs(nodeId: string): boolean {
      if (inStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;

      visited.add(nodeId);
      inStack.add(nodeId);

      for (const neighbor of adj.get(nodeId) ?? []) {
        if (dfs(neighbor)) return true;
      }

      inStack.delete(nodeId);
      return false;
    }

    for (const step of steps) {
      if (dfs(step.id)) return true;
    }

    return false;
  }

  private hasTermDependency(subgoal: string, potentialDep: string): boolean {
    const terms = potentialDep
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 3);
    const subgoalLower = subgoal.toLowerCase();
    const matchCount = terms.filter((t) => subgoalLower.includes(t)).length;
    return terms.length > 0 && matchCount >= Math.ceil(terms.length / 2);
  }
}
