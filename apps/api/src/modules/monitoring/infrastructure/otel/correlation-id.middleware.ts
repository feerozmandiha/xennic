import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

/**
 * Correlation/request id propagation middleware.
 *
 * Important: the API uses NestJS with the Fastify adapter, but Nest middleware is
 * executed through `@fastify/middie`. In that layer `res` is a Node
 * `ServerResponse`, not a `FastifyReply`, so Fastify-only helpers such as
 * `reply.header()` are not guaranteed to exist. Use the raw Node response API
 * and keep a defensive fallback for tests or alternate adapters.
 */
@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware<IncomingMessage, ServerResponse> {
  use(req: IncomingMessage, res: ServerResponse, next: () => void): void {
    const incomingCorrelationId = req.headers[CORRELATION_ID_HEADER];
    const correlationId = Array.isArray(incomingCorrelationId)
      ? (incomingCorrelationId[0] ?? randomUUID())
      : (incomingCorrelationId ?? randomUUID());
    const requestId = randomUUID();

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    req.headers[REQUEST_ID_HEADER] = requestId;

    this.setResponseHeader(res, CORRELATION_ID_HEADER, correlationId);
    this.setResponseHeader(res, REQUEST_ID_HEADER, requestId);

    next();
  }

  private setResponseHeader(res: ServerResponse, name: string, value: string): void {
    const response = res as ServerResponse & {
      header?: (key: string, val: string) => unknown;
      raw?: ServerResponse;
    };

    if (typeof response.setHeader === 'function' && !response.headersSent) {
      response.setHeader(name, value);
      return;
    }

    if (response.raw && typeof response.raw.setHeader === 'function' && !response.raw.headersSent) {
      response.raw.setHeader(name, value);
      return;
    }

    if (typeof response.header === 'function') {
      response.header(name, value);
    }
  }
}
