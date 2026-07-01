import { SetMetadata, Injectable, type ExecutionContext, type CallHandler, type NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { type Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CacheService } from './cache.service.js';

export const CACHE_KEY_METADATA = 'cache_key';
export const CACHE_TTL_METADATA = 'cache_ttl';

export function Cacheable(cacheKey: string, ttl?: number): MethodDecorator {
  return (target, propertyKey, descriptor) => {
    SetMetadata(CACHE_KEY_METADATA, cacheKey)(target, propertyKey, descriptor);
    if (ttl !== undefined) {
      SetMetadata(CACHE_TTL_METADATA, ttl)(target, propertyKey, descriptor);
    }
    return descriptor;
  };
}

@Injectable()
export class CacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cacheService: CacheService,
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const cacheKeyTemplate = this.reflector.get<string>(CACHE_KEY_METADATA, context.getHandler());
    if (!cacheKeyTemplate) {
      return next.handle();
    }

    const ttl = this.reflector.get<number | undefined>(CACHE_TTL_METADATA, context.getHandler());
    const args = context.getArgs();
    const cacheKey = this.resolveKey(cacheKeyTemplate, args);

    const cached = await this.cacheService.get(cacheKey);
    if (cached !== null) {
      return of(cached);
    }

    return next.handle().pipe(
      tap(async (data) => {
        await this.cacheService.set(cacheKey, data, ttl);
      }),
    );
  }

  private resolveKey(template: string, args: any[]): string {
    return template.replace(/\{(\w+)(?:\.(\w+))?\}/g, (_, key: string, subKey?: string) => {
      const idx = parseInt(key, 10);
      if (!isNaN(idx)) {
        const val = args[idx];
        if (subKey !== undefined && val !== null && typeof val === 'object') {
          return String(val[subKey] ?? '');
        }
        return String(val ?? '');
      }
      for (const arg of args) {
        if (arg !== null && typeof arg === 'object' && key in arg) {
          const val = arg[key];
          if (subKey !== undefined && val !== null && typeof val === 'object') {
            return String(val[subKey] ?? '');
          }
          return String(val ?? '');
        }
      }
      return `{${key}}`;
    });
  }
}
