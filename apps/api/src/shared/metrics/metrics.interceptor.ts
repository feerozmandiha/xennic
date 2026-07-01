import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from './metrics.service.js';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    const routeUrl: string = request.routeOptions?.url ?? request.url;

    if (routeUrl === '/metrics' || routeUrl === '/api/v1/metrics') {
      return next.handle();
    }

    const method = request.method;

    this.metricsService.trackInFlightRequest(1);

    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = context.switchToHttp().getResponse<FastifyReply>();
          const durationMs = Date.now() - start;
          this.metricsService.incrementHttpRequestsTotal(method, routeUrl, response.statusCode);
          this.metricsService.observeHttpRequestDuration(method, routeUrl, durationMs);
          this.metricsService.trackInFlightRequest(-1);
        },
        error: () => {
          const durationMs = Date.now() - start;
          this.metricsService.incrementHttpRequestsTotal(method, routeUrl, 500);
          this.metricsService.observeHttpRequestDuration(method, routeUrl, durationMs);
          this.metricsService.trackInFlightRequest(-1);
        },
      }),
    );
  }
}
