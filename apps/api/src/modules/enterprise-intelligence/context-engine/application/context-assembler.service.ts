import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ContextScope } from '../../shared/types/index.js';
import { ContextSnapshot } from '../domain/context-snapshot.vo.js';
import type { ContextSource } from '../domain/context-source.vo.js';
import type { IContextAssembler } from '../domain/context-assembler.interface.js';
import type { IContextRepository } from '../domain/context-repository.interface.js';
import { ContextCacheService } from './context-cache.service.js';

@Injectable()
export class ContextAssemblerService implements IContextAssembler {
  private readonly logger = new Logger(ContextAssemblerService.name);
  private readonly sourceConfigs = new Map<string, { priority: number; ttl: number }>();

  constructor(
    @Inject('IContextRepository')
    private readonly repository: IContextRepository,
    private readonly cache: ContextCacheService,
  ) {}

  configureSource(source: string, priority: number, ttl: number): void {
    this.sourceConfigs.set(source, { priority, ttl });
    this.logger.debug(`Source configured: ${source} (priority=${priority}, ttl=${ttl}s)`);
  }

  getSourcePriority(source: string): number {
    return this.sourceConfigs.get(source)?.priority ?? 100;
  }

  async assemble(
    scope: ContextScope,
    scopeId: string,
    sources?: ContextSource[],
  ): Promise<ContextSnapshot> {
    const cacheKey = `${scope}:${scopeId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ${cacheKey}`);
      return cached;
    }

    const entities = await this.repository.findByScope(scope, scopeId);
    if (entities.items.length === 0) {
      return ContextSnapshot.create([]);
    }

    const snapshot = ContextSnapshot.create(entities.items);

    const ttl = sources?.length ? Math.min(...sources.map((s) => s.ttl)) : 300;
    this.cache.set(cacheKey, snapshot, ttl);

    this.logger.debug(`Context assembled for ${scope}:${scopeId} (${entities.total} sources)`);
    return snapshot;
  }
}
