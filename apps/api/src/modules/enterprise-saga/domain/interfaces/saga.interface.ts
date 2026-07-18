export const ISAGA_ORCHESTRATOR = 'ISagaOrchestrator' as const;

export type SagaStatus =
  | 'PENDING'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'COMPENSATING'
  | 'COMPENSATED';

export type SagaStepStatus =
  | 'PENDING'
  | 'EXECUTING'
  | 'COMPLETED'
  | 'FAILED'
  | 'COMPENSATING'
  | 'COMPENSATED';

export interface SagaStep<TContext = unknown> {
  readonly name: string;
  execute(context: TContext): Promise<void>;
  compensate(context: TContext, error: Error): Promise<void>;
}

export interface SagaDefinition<TContext = unknown> {
  readonly sagaName: string;
  readonly steps: SagaStep<TContext>[];
  readonly timeoutMs: number;
  readonly compensable: boolean;
}

export interface SagaInstance<TContext = unknown> {
  id: string;
  sagaName: string;
  status: SagaStatus;
  context: TContext;
  currentStep: number;
  stepStatuses: Map<string, SagaStepStatus>;
  errors: Array<{ step: string; error: string }>;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ISagaOrchestrator {
  start<TContext>(sagaName: string, context: TContext): Promise<string>;
  getStatus(sagaId: string): Promise<SagaInstance | null>;
  list(limit?: number): Promise<SagaInstance[]>;
}
