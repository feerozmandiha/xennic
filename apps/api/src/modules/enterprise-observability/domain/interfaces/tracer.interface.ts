export const ITRACER = 'ITracer' as const;

export interface Span {
  readonly spanId: string;
  readonly traceId: string;
  readonly parentSpanId?: string;
  readonly name: string;
  readonly startTime: bigint;
  endTime?: bigint;
  attributes: Record<string, string | number | boolean>;
  status: 'OK' | 'ERROR';
  errorMessage?: string;
}

export interface ITracer {
  startSpan(name: string, attributes?: Record<string, string | number | boolean>): Span;
  endSpan(span: Span): void;
  recordError(span: Span, error: Error): void;
  injectContext(span: Span): Record<string, string>;
  extractContext(carrier: Record<string, string>): string | undefined;
}
