import { AppError } from './app-error.js';

export class ValidationError extends AppError {
  constructor(message = 'Validation failed', details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}
