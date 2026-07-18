import { Injectable, Logger, Inject } from '@nestjs/common';
import type { Metadata } from '../../shared/types/index.js';
import type {
  WorkflowDefinition,
  WorkflowStep,
} from '../../workflow-engine/domain/workflow-definition.entity.js';
import type { IExecutionRepository } from '../domain/execution-repository.interface.js';
import { WorkflowExecution, type ExecutionStep } from '../domain/workflow-execution.entity.js';
import { RetryHandlerService } from './retry-handler.service.js';
import { TimeoutHandlerService } from './timeout-handler.service.js';
import { CompensationService } from './compensation.service.js';

@Injectable()
export class WorkflowExecutorService {
  private readonly logger = new Logger(WorkflowExecutorService.name);

  constructor(
    @Inject('IExecutionRepository')
    private readonly repository: IExecutionRepository,
    private readonly retryHandler: RetryHandlerService,
    private readonly timeoutHandler: TimeoutHandlerService,
    private readonly compensation: CompensationService,
  ) {}

  async start(
    workflowId: string,
    definition: WorkflowDefinition,
    input?: Record<string, unknown>,
    createdBy?: string,
  ): Promise<WorkflowExecution> {
    const metadata: Metadata = {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: createdBy ?? 'system',
      updatedBy: null,
    };

    const execution = WorkflowExecution.create({
      workflowId,
      workflowVersion: definition.version,
      definition,
      context: { __definition_steps__: definition.steps },
      input,
      metadata,
    });

    execution.status = 'running';
    execution.startedAt = new Date();

    await this.repository.save(execution);
    this.logger.log(`Started execution ${execution.id} for workflow ${workflowId}`);

    await this.processNextSteps(execution.id);

    const updated = await this.repository.get(execution.id);
    return updated ?? execution;
  }

  async executeStep(executionId: string, step: ExecutionStep): Promise<void> {
    this.logger.log(`Executing step ${step.stepId} for execution ${executionId}`);

    step.status = 'running';
    step.startedAt = new Date();
    step.attempts += 1;

    const executor = async (): Promise<Record<string, unknown>> => {
      return {};
    };

    try {
      const defStep = await this.findDefinitionStep(executionId, step.stepId);
      let result: Record<string, unknown>;

      if (defStep?.timeoutMs) {
        result = await this.timeoutHandler.executeWithTimeout(step, executor, defStep.timeoutMs);
      } else if (defStep?.retryConfig) {
        result = await this.retryHandler.executeWithRetry(executionId, step, executor);
      } else {
        result = await executor();
      }

      step.status = 'completed';
      step.output = result;
      step.completedAt = new Date();
      this.logger.log(`Step ${step.stepId} completed`);

      await this.compensation.registerCompensation(
        executionId,
        step.stepId,
        `compensate:${step.stepId}`,
      );
    } catch (error) {
      step.status = 'failed';
      step.error = error instanceof Error ? error.message : String(error);
      step.completedAt = new Date();
      this.logger.error(`Step ${step.stepId} failed: ${step.error}`);

      const defStep = await this.findDefinitionStep(executionId, step.stepId);
      if (defStep?.onFailure) {
        const onFailureStep = await this.findExecutionStep(executionId, defStep.onFailure);
        if (onFailureStep) {
          await this.executeStep(executionId, onFailureStep);
        }
      }
    }

    const execution = await this.repository.get(executionId);
    if (execution) {
      const idx = execution.steps.findIndex((s) => s.stepId === step.stepId);
      if (idx >= 0) {
        execution.steps[idx] = step;
      }
      await this.repository.save(execution);
    }
  }

  async processNextSteps(executionId: string): Promise<void> {
    const execution = await this.repository.get(executionId);
    if (!execution) {
      throw new Error(`Execution ${executionId} not found`);
    }

    if (execution.status === 'cancelled' || execution.status === 'paused') {
      return;
    }

    const nextSteps = await this.findNextExecutableSteps(executionId);

    if (nextSteps.length === 0) {
      await this.finalizeExecution(execution);
      return;
    }

    const allAreParallel = nextSteps.every((s) => s.type === 'parallel' || s.type === 'task');

    if (nextSteps.length > 1 && allAreParallel) {
      await Promise.all(nextSteps.map((s) => this.executeStep(executionId, s)));
    } else {
      for (const step of nextSteps) {
        const defStep = await this.findDefinitionStep(executionId, step.stepId);
        if (defStep?.type === 'conditional') {
          const config = defStep.config ?? {};
          const conditionResult = config.condition === true;
          await this.evaluateConditional(execution, step, conditionResult);
        } else {
          await this.executeStep(executionId, step);
        }
      }
    }

    await this.processNextSteps(executionId);
  }

  private async findNextExecutableSteps(executionId: string): Promise<ExecutionStep[]> {
    const execution = await this.repository.get(executionId);
    if (!execution) return [];

    const pending = execution.steps.filter((s) => s.status === 'pending');

    if (pending.length === execution.steps.length) {
      return pending.length > 0 ? [pending[0] as ExecutionStep] : [];
    }

    const completedIds = new Set(
      execution.steps.filter((s) => s.status === 'completed').map((s) => s.stepId),
    );

    if (completedIds.size === 0) {
      return pending.length > 0 ? [pending[0] as ExecutionStep] : [];
    }

    const result: ExecutionStep[] = [];
    for (const s of pending) {
      const defStep = await this.findDefinitionStep(execution.id, s.stepId);
      if (!defStep) continue;

      for (const step of execution.steps) {
        const ds = await this.findDefinitionStep(execution.id, step.stepId);
        if (ds?.next?.includes(s.stepId) && completedIds.has(step.stepId)) {
          result.push(s);
          break;
        }
      }
    }
    return result;
  }

  private async findExecutionStep(
    executionId: string,
    stepId: string,
  ): Promise<ExecutionStep | null> {
    const execution = await this.repository.get(executionId);
    if (!execution) return null;
    return execution.steps.find((s) => s.stepId === stepId) ?? null;
  }

  private async findDefinitionStep(
    executionId: string,
    stepId: string,
  ): Promise<WorkflowStep | null> {
    const execution = await this.repository.get(executionId);
    if (!execution) return null;
    const steps = execution.context.__definition_steps__ as WorkflowStep[] | undefined;
    if (!steps) return null;
    return steps.find((s) => s.id === stepId) ?? null;
  }

  private async evaluateConditional(
    execution: WorkflowExecution,
    step: ExecutionStep,
    conditionResult: boolean,
  ): Promise<void> {
    step.status = 'running';
    step.startedAt = new Date();
    step.output = { conditionResult, taken: conditionResult ? 'true' : 'false' };
    step.status = 'completed';
    step.completedAt = new Date();
    await this.repository.save(execution);
    this.logger.log(`Conditional step ${step.stepId} evaluated to ${conditionResult}`);
  }

  private async finalizeExecution(execution: WorkflowExecution): Promise<void> {
    const allCompleted = execution.steps.every((s) => s.status === 'completed');
    const anyFailed = execution.steps.some((s) => s.status === 'failed');

    if (allCompleted) {
      execution.status = 'completed';
      execution.completedAt = new Date();
      this.logger.log(`Execution ${execution.id} completed`);
    } else if (anyFailed) {
      execution.status = 'failed';
      execution.error = 'One or more steps failed';
      execution.completedAt = new Date();
      this.logger.error(`Execution ${execution.id} failed`);
    }

    await this.repository.save(execution);
  }
}
