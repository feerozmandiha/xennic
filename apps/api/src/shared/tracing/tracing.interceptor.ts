import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { trace, context as otelContext } from '@opentelemetry/api';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const method: string = request.method ?? 'UNKNOWN';
    const url: string = request.url ?? '/';

    const tracer = trace.getTracer('xennic-api');
    const span = tracer.startSpan(`${method} ${url}`, {
      attributes: {
        'http.method': method,
        'http.url': url,
      },
    });

    request.traceId = span.spanContext().traceId;

    const ctx = trace.setSpan(otelContext.active(), span);

    return otelContext.with(ctx, () =>
      next.handle().pipe(
        tap({
          next: () => {
            const response = context.switchToHttp().getResponse();
            span.setAttribute('http.status_code', response.statusCode ?? 0);

            if (request.user?.id) {
              span.setAttribute('user.id', request.user.id);
            }
            if (request.workspaceId) {
              span.setAttribute('workspace.id', request.workspaceId);
            }
          },
          error: (err: Error) => {
            const status =
              err instanceof Object && 'status' in err
                ? (err as { status: number }).status
                : 500;
            span.setAttribute('http.status_code', status);
            span.recordException(err);
          },
          finalize: () => {
            span.end();
          },
        }),
      ),
    );
  }
}
