import { AppError } from './app-error.js';

export class BusinessError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('BUSINESS_ERROR', message, 422, details);
  }
}
