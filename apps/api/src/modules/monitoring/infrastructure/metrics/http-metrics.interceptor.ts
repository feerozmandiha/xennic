import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { randomUUID } from 'node:crypto';
import { FastifyRequest, FastifyReply } from 'fastify';
import { MetricRecorderService } from '../../application/services/metric-recorder.service.js';

@Injectable()
export class HttpMetricsInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpMetricsInterceptor.name);

  constructor(private readonly metrics: MetricRecorderService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const { method, url } = request;
    const start = Date.now();

    const requestId = randomUUID();
    const correlationId =
      (request.headers['x-correlation-id'] as string) || requestId;

    const reply = http.getResponse<FastifyReply>();
    reply.header('x-request-id', requestId);
    reply.header('x-correlation-id', correlationId);

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - start;
          const route = this.getRoutePath(request);
          const statusCode = reply.statusCode ?? 200;
          this.metrics.recordHttpRequest(method, route, statusCode, duration);
          this.logger.log({
            msg: 'request completed',
            method,
            route,
            statusCode,
            duration,
            requestId,
            correlationId,
          });
        },
        error: (err: Error) => {
          const duration = Date.now() - start;
          const route = this.getRoutePath(request);
          this.metrics.recordHttpRequest(method, route, 500, duration);
          this.logger.error({
            msg: 'request failed',
            method,
            route,
            error: err.message,
            duration,
            requestId,
            correlationId,
          });
        },
      }),
    );
  }

  private getRoutePath(request: FastifyRequest): string {
    const url = request.url ?? '';
    const path = url.split('?')[0] || '/';
    try {
      return request.routeOptions?.url ?? path;
    } catch {
      return path;
    }
  }
}
