export class AiRuntimeException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'AI_RUNTIME_ERROR',
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'AiRuntimeException';
  }
}
