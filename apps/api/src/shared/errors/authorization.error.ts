import { AppError } from './app-error.js';

export class AuthorizationError extends AppError {
  constructor(message = 'Access denied', details?: Record<string, unknown>) {
    super('AUTHORIZATION_ERROR', message, 403, details);
  }
}
