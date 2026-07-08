import { randomUUID } from 'node:crypto';
import type { SagaInstance, SagaStatus, SagaStepStatus } from '../interfaces/saga.interface.js';

export class SagaInstanceEntity<TContext = unknown> implements SagaInstance<TContext> {
  readonly id: string;
  sagaName: string;
  status: SagaStatus;
  context: TContext;
  currentStep: number;
  stepStatuses: Map<string, SagaStepStatus>;
  errors: Array<{ step: string; error: string }>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;

  private constructor(params: Partial<SagaInstance<TContext>> & { sagaName: string; context: TContext }) {
    this.id = params.id ?? randomUUID();
    this.sagaName = params.sagaName;
    this.status = params.status ?? 'PENDING';
    this.context = params.context;
    this.currentStep = params.currentStep ?? 0;
    this.stepStatuses = params.stepStatuses ?? new Map();
    this.errors = params.errors ?? [];
    this.createdAt = params.createdAt ?? new Date().toISOString();
    this.updatedAt = params.updatedAt ?? new Date().toISOString();
    this.completedAt = params.completedAt;
  }

  static create<T>(sagaName: string, context: T): SagaInstanceEntity<T> {
    return new SagaInstanceEntity({ sagaName, context });
  }

  static reconstitute<T>(data: SagaInstance<T>): SagaInstanceEntity<T> {
    return new SagaInstanceEntity(data);
  }

  markExecuting(): void {
    this.status = 'EXECUTING';
    this.updatedAt = new Date().toISOString();
  }

  markCompleted(): void {
    this.status = 'COMPLETED';
    this.completedAt = new Date().toISOString();
    this.updatedAt = this.completedAt;
  }

  markFailed(): void {
    this.status = 'FAILED';
    this.updatedAt = new Date().toISOString();
  }

  markCompensating(): void {
    this.status = 'COMPENSATING';
    this.updatedAt = new Date().toISOString();
  }

  markCompensated(): void {
    this.status = 'COMPENSATED';
    this.updatedAt = new Date().toISOString();
  }

  setStepStatus(stepName: string, status: SagaStepStatus): void {
    this.stepStatuses.set(stepName, status);
    this.updatedAt = new Date().toISOString();
  }

  addError(stepName: string, error: string): void {
    this.errors.push({ step: stepName, error });
    this.updatedAt = new Date().toISOString();
  }

  toJSON(): SagaInstance<TContext> {
    return {
      id: this.id,
      sagaName: this.sagaName,
      status: this.status,
      context: this.context,
      currentStep: this.currentStep,
      stepStatuses: this.stepStatuses,
      errors: [...this.errors],
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      completedAt: this.completedAt,
    };
  }
}
