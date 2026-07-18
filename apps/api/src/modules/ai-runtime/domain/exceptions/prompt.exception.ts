import { AiRuntimeException } from './ai-runtime.exception.js';

export class PromptException extends AiRuntimeException {
  constructor(message: string, code: string = 'PROMPT_ERROR', details?: Record<string, unknown>) {
    super(message, code, details);
    this.name = 'PromptException';
  }
}

export class PromptNotFoundException extends PromptException {
  constructor(public readonly templateKey: string) {
    super(`Prompt template not found: ${templateKey}`, 'PROMPT_NOT_FOUND');
    this.name = 'PromptNotFoundException';
  }
}

export class PromptRenderingException extends PromptException {
  constructor(templateKey: string, reason: string) {
    super(`Failed to render prompt "${templateKey}": ${reason}`, 'PROMPT_RENDERING_ERROR', {
      templateKey,
    });
    this.name = 'PromptRenderingException';
  }
}
