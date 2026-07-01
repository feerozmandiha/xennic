export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'BUSINESS_ERROR'
  | 'INFRASTRUCTURE_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'KNOWLEDGE_ERROR'
  | 'AI_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  statusCode: number;
  correlationId?: string;
  details?: Record<string, unknown>;
}

export abstract class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly correlationId: string;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(code: ErrorCode, message: string, statusCode: number, details?: Record<string, unknown>) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    this.correlationId = '';
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  setCorrelationId(id: string): void {
    (this as { correlationId: string }).correlationId = id;
  }

  toJSON(): ErrorDetails {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      correlationId: this.correlationId,
      details: this.details,
    };
  }
}
