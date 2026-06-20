import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { TenantContext, tenantStorage } from '@xennic/database';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const workspaceId = request.headers['x-workspace-id'];

    if (!workspaceId) {
      const url = request.url;
      if (!url.includes('/auth/') && !url.includes('/public/')) {
        throw new BadRequestException('Missing x-workspace-id header');
      }
      return next.handle();
    }

    return new Observable((subscriber) => {
      tenantStorage.run({ workspaceId }, () => {
        next.handle().subscribe({
          next: (v) => subscriber.next(v),
          error: (e) => subscriber.error(e),
          complete: () => subscriber.complete(),
        });
      });
    });
  }
}
