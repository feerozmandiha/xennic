import { Injectable, Logger } from '@nestjs/common';
import type { SagaDefinition, SagaInstance, SagaStep, ISagaOrchestrator } from '../../domain/interfaces/saga.interface.js';
import { SagaInstanceEntity } from '../../domain/entities/saga-instance.entity.js';

@Injectable()
export class SagaOrchestratorService implements ISagaOrchestrator {
  private readonly logger = new Logger(SagaOrchestratorService.name);
  private readonly sagaDefinitions = new Map<string, SagaDefinition>();
  private readonly instances = new Map<string, SagaInstanceEntity>();

  registerSaga(definition: SagaDefinition): void {
    this.sagaDefinitions.set(definition.sagaName, definition);
    this.logger.log(`Registered saga: ${definition.sagaName} (${definition.steps.length} steps)`);
  }

  async start<TContext>(sagaName: string, context: TContext): Promise<string> {
    const definition = this.sagaDefinitions.get(sagaName);
    if (!definition) throw new Error(`No saga definition found: ${sagaName}`);

    const instance = SagaInstanceEntity.create(sagaName, context);
    instance.markExecuting();
    this.instances.set(instance.id, instance);

    this.logger.log(`Starting saga ${sagaName} (${instance.id})`);

    setImmediate(async () => {
      try {
        await this._executeSteps(instance, definition);
      } catch (error) {
        this.logger.error(`Saga ${instance.id} failed: ${error instanceof Error ? error.message : 'Unknown'}`);
      }
    });

    return instance.id;
  }

  async getStatus(sagaId: string): Promise<SagaInstance | null> {
    const instance = this.instances.get(sagaId);
    return instance?.toJSON() ?? null;
  }

  async list(limit = 50): Promise<SagaInstance[]> {
    const all = Array.from(this.instances.values());
    return all.slice(-limit).reverse().map(i => i.toJSON());
  }

  private async _executeSteps(instance: SagaInstanceEntity, definition: SagaDefinition): Promise<void> {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Saga timeout after ${definition.timeoutMs}ms`)), definition.timeoutMs),
    );

    try {
      for (let i = instance.currentStep; i < definition.steps.length; i++) {
        const step = definition.steps[i]!;
        instance.currentStep = i;
        instance.setStepStatus(step.name, 'EXECUTING');

        try {
          await Promise.race([step.execute(instance.context), timeout]);
          instance.setStepStatus(step.name, 'COMPLETED');
          this.logger.debug(`Step ${step.name} completed for saga ${instance.id}`);
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'Step failed';
          instance.addError(step.name, errMsg);
          instance.setStepStatus(step.name, 'FAILED');
          this.logger.error(`Step ${step.name} failed for saga ${instance.id}: ${errMsg}`);

          if (definition.compensable) {
            await this._compensate(instance, definition, step.name, error instanceof Error ? error : new Error(errMsg));
          } else {
            instance.markFailed();
          }
          return;
        }
      }

      instance.markCompleted();
      this.logger.log(`Saga ${instance.id} completed successfully`);
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'Saga execution error';
      this.logger.error(`Saga ${instance.id} execution error: ${errMsg}`);

      if (definition.compensable) {
        await this._compensate(instance, definition, '', error instanceof Error ? error : new Error(errMsg));
      } else {
        instance.markFailed();
      }
    }
  }

  private async _compensate(
    instance: SagaInstanceEntity,
    definition: SagaDefinition,
    failedStep: string,
    error: Error,
  ): Promise<void> {
    instance.markCompensating();
    this.logger.log(`Compensating saga ${instance.id} after step "${failedStep}"`);

    const completedSteps = Array.from(instance.stepStatuses.entries())
      .filter(([, status]) => status === 'COMPLETED')
      .map(([name]) => definition.steps.find(s => s.name === name))
      .filter(Boolean) as SagaStep[];

    for (const step of completedSteps.reverse()) {
      try {
        await step.compensate(instance.context, error);
        instance.setStepStatus(step.name, 'COMPENSATED');
        this.logger.debug(`Compensated step ${step.name} for saga ${instance.id}`);
      } catch (compError) {
        const errMsg = compError instanceof Error ? compError.message : 'Compensation failed';
        instance.addError(`${step.name}:compensate`, errMsg);
        this.logger.error(`Compensation of step ${step.name} failed: ${errMsg}`);
      }
    }

    instance.markCompensated();
    this.logger.log(`Saga ${instance.id} compensated`);
  }
}
