import { AppError } from './app-error.js';

export class InfrastructureError extends AppError {
  constructor(message = 'Infrastructure error', details?: Record<string, unknown>) {
    super('INFRASTRUCTURE_ERROR', message, 503, details);
  }
}
