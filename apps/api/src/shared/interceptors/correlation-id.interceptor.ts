import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { Observable } from 'rxjs';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

@Injectable()
export class CorrelationIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const correlationId = request.headers[CORRELATION_ID_HEADER] || randomUUID();
    request.correlationId = correlationId;
    const response = context.switchToHttp().getResponse();
    response.header(CORRELATION_ID_HEADER, correlationId);
    return next.handle();
  }
}
