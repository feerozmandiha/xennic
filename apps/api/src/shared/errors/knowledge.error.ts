import { AppError } from './app-error.js';

export class KnowledgeError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('KNOWLEDGE_ERROR', message, 422, details);
  }
}
