import { AiRuntimeException } from './ai-runtime.exception.js';

export class SessionException extends AiRuntimeException {
  constructor(message: string, code: string = 'SESSION_ERROR', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'SessionException';
  }
}

export class SessionNotFoundException extends SessionException {
  constructor(public readonly sessionId: string) {
    super(`Session not found: ${sessionId}`, 'SESSION_NOT_FOUND');
    this.name = 'SessionNotFoundException';
  }
}

export class SessionExpiredException extends SessionException {
  constructor(public readonly sessionId: string) {
    super(`Session expired: ${sessionId}`, 'SESSION_EXPIRED');
    this.name = 'SessionExpiredException';
  }
}
