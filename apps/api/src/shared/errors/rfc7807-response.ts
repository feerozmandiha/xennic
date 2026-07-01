import type { ErrorDetails } from './app-error.js';

export interface RFC7807Problem {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  correlationId?: string;
  timestamp: string;
  errors?: Record<string, unknown>;
}

export function toRFC7807(error: ErrorDetails, path?: string): RFC7807Problem {
  const typeMap: Record<string, string> = {
    VALIDATION_ERROR: 'https://xennic.dev/errors/validation',
    BUSINESS_ERROR: 'https://xennic.dev/errors/business',
    INFRASTRUCTURE_ERROR: 'https://xennic.dev/errors/infrastructure',
    AUTHENTICATION_ERROR: 'https://xennic.dev/errors/authentication',
    AUTHORIZATION_ERROR: 'https://xennic.dev/errors/authorization',
    KNOWLEDGE_ERROR: 'https://xennic.dev/errors/knowledge',
    AI_ERROR: 'https://xennic.dev/errors/ai',
    NOT_FOUND: 'https://xennic.dev/errors/not-found',
    CONFLICT: 'https://xennic.dev/errors/conflict',
    RATE_LIMITED: 'https://xennic.dev/errors/rate-limited',
    INTERNAL_ERROR: 'https://xennic.dev/errors/internal',
  };

  return {
    type: typeMap[error.code] || 'https://xennic.dev/errors/generic',
    title: error.code,
    status: error.statusCode,
    detail: error.message,
    instance: path,
    correlationId: error.correlationId,
    timestamp: new Date().toISOString(),
    ...(error.details && { errors: error.details }),
  };
}
