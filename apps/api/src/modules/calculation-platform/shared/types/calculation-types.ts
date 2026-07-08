export interface CalculationContext {
  workspaceId: string;
  userId: string;
  correlationId?: string;
  definitionId?: string;
  versionId?: string;
}

export interface CalculationInput {
  name: string;
  value: unknown;
  unit?: string;
}

export interface CalculationOutput {
  name: string;
  value: unknown;
  unit?: string;
  label?: string;
}

export interface NamedValue {
  name: string;
  value: number;
  unit?: string;
}

export interface CalculationOptions {
  validateOnly?: boolean;
  skipAiReview?: boolean;
  skipCertificate?: boolean;
  providerId?: string;
}

export interface ExecutionResult {
  outputs: Record<string, unknown>;
  durationMs: number;
  steps: number;
  formulaCount: number;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
