import { Injectable, Logger } from '@nestjs/common';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import type { Span, SpanOptions, Attributes } from '@opentelemetry/api';

@Injectable()
export class TracingService {
  private readonly logger = new Logger(TracingService.name);
  private readonly tracer = trace.getTracer('xennic-platform');

  startSpan(name: string, options?: SpanOptions): Span {
    return this.tracer.startSpan(name, options);
  }

  async trace<T>(
    name: string,
    fn: (span: Span) => Promise<T>,
    attributes?: Attributes,
  ): Promise<T> {
    const span = this.tracer.startSpan(name, { attributes });
    try {
      const result = await fn(span);
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
      span.recordException(error as Error);
      throw error;
    } finally {
      span.end();
    }
  }

  setAttribute(span: Span, key: string, value: string | number | boolean): void {
    span.setAttribute(key, value);
  }

  addEvent(span: Span, name: string, attributes?: Attributes): void {
    span.addEvent(name, attributes);
  }

  getCurrentTraceId(): string | undefined {
    const span = trace.getSpan(context.active());
    return span?.spanContext().traceId;
  }

  getCurrentSpanId(): string | undefined {
    const span = trace.getSpan(context.active());
    return span?.spanContext().spanId;
  }
}
