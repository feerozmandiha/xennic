import { Injectable } from '@nestjs/common';
import { type Span, type Tracer, trace } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

@Injectable()
export class TracingService {
  private sdk: NodeSDK | null = null;
  private tracer: Tracer | null = null;

  async init(): Promise<void> {
    if (process.env['SKIP_INFRA_CONNECT'] === 'true') {
      return;
    }
    const endpoint =
      process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] ?? 'http://localhost:4318';
    process.env['OTEL_EXPORTER_OTLP_ENDPOINT'] = endpoint;

    this.sdk = new NodeSDK({
      serviceName: 'xennic-api',
      instrumentations: [getNodeAutoInstrumentations()],
    });

    this.sdk.start();

    this.tracer = trace.getTracer('xennic-api');
  }

  async shutdown(): Promise<void> {
    if (this.sdk) {
      try {
        await this.sdk.shutdown();
      } catch {
        // ignore shutdown errors
      }
    }
  }

  startSpan(name: string, attributes?: Record<string, unknown>): Span {
    const span = this.tracer!.startSpan(name);
    if (attributes) {
      span.setAttributes(attributes as Record<string, string | number | boolean>);
    }
    return span;
  }

  getTraceId(): string | undefined {
    const activeSpan = trace.getActiveSpan();
    if (!activeSpan) {
      return undefined;
    }
    return activeSpan.spanContext().traceId;
  }
}
