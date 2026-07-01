import { AppError } from './app-error.js';

export class AIError extends AppError {
  constructor(message = 'AI service error', details?: Record<string, unknown>) {
    super('AI_ERROR', message, 502, details);
  }
}
