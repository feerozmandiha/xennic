import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req: FastifyRequest = context.switchToHttp().getRequest();
    const start = Date.now();
    const requestId = (req.headers['x-request-id'] as string) ?? randomUUID();
    const correlationId = (req.headers['x-correlation-id'] as string) ?? '';
    const workspaceId = (req.headers['x-workspace-id'] as string) ?? '';

    return next.handle().pipe(
      tap({
        next: () => {
          const res: FastifyReply = context.switchToHttp().getResponse();
          const duration = Date.now() - start;
          this.logger.log({
            msg: 'request completed',
            requestId,
            correlationId,
            workspaceId,
            method: req.method,
            url: req.url,
            status: res.statusCode,
            durationMs: duration,
            userAgent: req.headers['user-agent'],
          });
        },
        error: (err: Error) => {
          const duration = Date.now() - start;
          this.logger.error({
            msg: 'request failed',
            requestId,
            correlationId,
            workspaceId,
            method: req.method,
            url: req.url,
            durationMs: duration,
            error: err.message,
            stack: err.stack,
          });
        },
      }),
    );
  }
}
