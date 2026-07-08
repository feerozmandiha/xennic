import { Injectable, NestMiddleware } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';
export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: FastifyRequest, res: FastifyReply, next: () => void): void {
    const correlationId = (req.headers[CORRELATION_ID_HEADER] as string) ?? randomUUID();
    const requestId = randomUUID();

    req.headers[CORRELATION_ID_HEADER] = correlationId;
    req.headers[REQUEST_ID_HEADER] = requestId;

    void res.header(CORRELATION_ID_HEADER, correlationId);
    void res.header(REQUEST_ID_HEADER, requestId);

    next();
  }
}
