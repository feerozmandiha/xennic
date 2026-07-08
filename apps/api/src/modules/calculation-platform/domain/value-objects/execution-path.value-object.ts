export interface ExecutionStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  durationMs?: number;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export class ExecutionPath {
  private constructor(public readonly steps: readonly ExecutionStep[]) {}

  static create(steps?: ExecutionStep[]): ExecutionPath {
    return new ExecutionPath(Object.freeze([...(steps ?? [])]));
  }

  addStep(step: ExecutionStep): ExecutionPath {
    return new ExecutionPath(Object.freeze([...this.steps, step]));
  }

  updateStep(index: number, updates: Partial<ExecutionStep>): ExecutionPath {
    const current = this.steps[index];
    const updated = [...this.steps];
    updated[index] = { ...current, ...updates } as ExecutionStep;
    return new ExecutionPath(Object.freeze(updated));
  }

  toJson(): Record<string, unknown>[] {
    return this.steps.map(s => ({ ...s }));
  }

  get failed(): boolean { return this.steps.some(s => s.status === 'failed'); }
  get duration(): number { return this.steps.reduce((acc, s) => acc + (s.durationMs ?? 0), 0); }
}
