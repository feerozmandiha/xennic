import { Injectable, Logger } from '@nestjs/common';
import type { ILazyLoader } from '../../domain/interfaces/performance-interfaces.js';

@Injectable()
export class LazyLoaderService implements ILazyLoader {
  private readonly logger = new Logger(LazyLoaderService.name);
  private cache = new Map<string, { value: unknown; expiresAt: number }>();

  async load<T>(id: string, loader: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.cache.get(id);
    if (cached && (ttl === undefined || Date.now() < cached.expiresAt)) {
      return cached.value as T;
    }
    const value = await loader();
    if (ttl !== undefined) this.cache.set(id, { value, expiresAt: Date.now() + ttl * 1000 });
    return value;
  }

  async preload<T>(ids: string[], loader: (id: string) => Promise<T>): Promise<void> {
    await Promise.all(ids.map(async (id) => {
      if (!this.cache.has(id)) {
        const value = await loader(id);
        this.cache.set(id, { value, expiresAt: Infinity });
      }
    }));
  }

  invalidate(id: string): void {
    this.cache.delete(id);
  }

  clear(): void {
    this.cache.clear();
  }
}
