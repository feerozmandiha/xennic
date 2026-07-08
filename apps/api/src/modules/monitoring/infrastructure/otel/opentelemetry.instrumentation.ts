import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { FastifyInstrumentation } from '@opentelemetry/instrumentation-fastify';

export function setupInstrumentations(): void {
  registerInstrumentations({
    instrumentations: [
      new HttpInstrumentation({
        requestHook: (span, request) => {
          const req = request as { headers?: Record<string, string> };
          if (req.headers?.['x-correlation-id']) {
            span.setAttribute('correlation_id', req.headers['x-correlation-id']);
          }
          if (req.headers?.['x-request-id']) {
            span.setAttribute('request_id', req.headers['x-request-id']);
          }
          if (req.headers?.['x-workspace-id']) {
            span.setAttribute('workspace_id', req.headers['x-workspace-id']);
          }
        },
      }),
      new FastifyInstrumentation(),
    ],
  });
}
