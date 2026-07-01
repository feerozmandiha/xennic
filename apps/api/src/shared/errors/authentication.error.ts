import { AppError } from './app-error.js';

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', details?: Record<string, unknown>) {
    super('AUTHENTICATION_ERROR', message, 401, details);
  }
}
