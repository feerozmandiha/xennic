import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { XennicLogger } from './xennic-logger.js';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new XennicLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - now;

        this.logger.info(`${method} ${url} ${response.statusCode} ${duration}ms`, {
          correlationId:
            request.correlationId ?? request.headers['x-correlation-id'],
          userId: request.user?.id,
          workspaceId:
            request.workspaceId ?? request.headers['x-workspace-id'],
        });
      }),
    );
  }
}
