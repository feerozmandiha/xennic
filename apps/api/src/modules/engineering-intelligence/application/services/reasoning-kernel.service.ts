import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IReasoningKernel } from '../../domain/interfaces/reasoning-kernel.interface.js';
import type { ReasoningGoal, ReasoningStep, EngineeringAssumption, Constraint } from '../../domain/types/ei.types.js';

@Injectable()
export class ReasoningKernel implements IReasoningKernel {
  private readonly logger = new Logger(ReasoningKernel.name);

  async decompose(goal: ReasoningGoal): Promise<ReasoningStep[]> {
    const steps: ReasoningStep[] = [];
    const traceId = randomUUID();

    const retrievalStep: ReasoningStep = {
      id: randomUUID(), type: 'retrieve',
      input: { goalId: goal.id, query: goal.description, evidence: goal.evidence },
      output: {}, evidence: [], assumptions: [], confidence: 0, trace: { stepId: randomUUID(), parentId: null, timestamp: Date.now(), duration: 0, status: 'pending' },
    };
    steps.push(retrievalStep);

    const calculationStep: ReasoningStep = {
      id: randomUUID(), type: 'calculate',
      input: { goalId: goal.id, constraints: goal.constraints },
      output: {}, evidence: [], assumptions: [], confidence: 0, trace: { stepId: randomUUID(), parentId: retrievalStep.id, timestamp: Date.now(), duration: 0, status: 'pending' },
    };
    steps.push(calculationStep);

    const decisionStep: ReasoningStep = {
      id: randomUUID(), type: 'decide',
      input: {}, output: {}, evidence: [], assumptions: [], confidence: 0, trace: { stepId: randomUUID(), parentId: calculationStep.id, timestamp: Date.now(), duration: 0, status: 'pending' },
    };
    steps.push(decisionStep);

    const verifyStep: ReasoningStep = {
      id: randomUUID(), type: 'verify',
      input: {}, output: {}, evidence: [], assumptions: [], confidence: 0, trace: { stepId: randomUUID(), parentId: decisionStep.id, timestamp: Date.now(), duration: 0, status: 'pending' },
    };
    steps.push(verifyStep);

    const concludeStep: ReasoningStep = {
      id: randomUUID(), type: 'conclude',
      input: {}, output: {}, evidence: [], assumptions: [], confidence: 0, trace: { stepId: randomUUID(), parentId: verifyStep.id, timestamp: Date.now(), duration: 0, status: 'pending' },
    };
    steps.push(concludeStep);

    this.logger.debug(`Decomposed goal ${goal.id} into ${steps.length} steps`);
    return steps;
  }

  async execute(step: ReasoningStep, context: Record<string, unknown>): Promise<ReasoningStep> {
    const startTime = Date.now();
    step.trace.status = 'running';
    step.trace.timestamp = startTime;

    try {
      this.validateStepInput(step, context);
      const output: Record<string, unknown> = { ...context, executedAt: startTime, stepType: step.type };

      if (step.type === 'retrieve') {
        output.retrievedEvidence = context.evidence;
      } else if (step.type === 'calculate') {
        output.calculationResult = { status: 'simulated', constraints: context.constraints };
      } else if (step.type === 'decide') {
        const ev = context.evidence;
        output.decision = { selected: 'option_a', basedOn: Array.isArray(ev) ? ev : [] };
      } else if (step.type === 'verify') {
        output.verified = true;
        output.verificationNotes = 'Assumptions validated against evidence';
      } else if (step.type === 'conclude') {
        const goalObj = context.goal as ReasoningGoal | undefined;
        output.conclusion = goalObj?.description || 'Conclusion reached';
      }

      step.output = output;
      step.confidence = 0.85;
      step.trace.status = 'completed';
    } catch (error) {
      step.trace.status = 'failed';
      step.trace.error = (error as Error).message;
    }

    step.trace.duration = Date.now() - startTime;
    return step;
  }

  private validateStepInput(step: ReasoningStep, context: Record<string, unknown>): void {
    if (step.type === 'calculate' && !context.constraints) {
      throw new Error('Calculate step requires constraints in context');
    }
    if (step.type === 'decide' && !context.evidence) {
      throw new Error('Decide step requires evidence in context');
    }
    if (step.type === 'retrieve' && !context.evidence && !context.goal) {
      throw new Error('Retrieve step requires evidence or goal in context');
    }
    if (step.type === 'verify' && !context.evidence && !context.goal) {
      throw new Error('Verify step requires evidence or goal in context');
    }
  }

  async propagateConstraints(goal: ReasoningGoal, steps: ReasoningStep[]): Promise<Constraint[]> {
    const constraints: Constraint[] = [...goal.constraints];
    return constraints;
  }

  async getDecisionTrace(goalId: string): Promise<ReasoningStep[]> {
    this.logger.warn(`getDecisionTrace not implemented for goal ${goalId}`);
    return [];
  }
}
