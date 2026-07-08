import { Injectable, Logger } from '@nestjs/common';
import type { ContextScope } from '../../shared/types/index.js';
import type { ContextSource } from '../../context-engine/domain/context-source.vo.js';
import { ContextBuilderService } from '../../context-engine/application/context-builder.service.js';
import { ContextAssemblerService } from '../../context-engine/application/context-assembler.service.js';
import { ContextCacheService } from '../../context-engine/application/context-cache.service.js';
import type { ContextSnapshot } from '../../context-engine/domain/context-snapshot.vo.js';
import type { ContextEntity } from '../../context-engine/domain/context.entity.js';

@Injectable()
export class ContextApi {
  private readonly logger = new Logger(ContextApi.name);

  constructor(
    private readonly builder: ContextBuilderService,
    private readonly assembler: ContextAssemblerService,
    private readonly cache: ContextCacheService,
  ) {}

  async getContext(
    scope: ContextScope,
    scopeId: string,
    sources?: ContextSource[],
  ): Promise<ContextSnapshot> {
    this.logger.debug(`getContext(${scope}, ${scopeId})`);
    return this.assembler.assemble(scope, scopeId, sources);
  }

  async buildContext(
    scope: ContextScope,
    scopeId: string,
    source: string,
    key: string,
    value: Record<string, unknown>,
    createdBy: string,
  ): Promise<ContextEntity> {
    this.logger.debug(`buildContext(${scope}, ${scopeId})`);
    return this.builder.build(scope, scopeId, source, key, value, createdBy);
  }

  async invalidateCache(scope: ContextScope, scopeId: string): Promise<void> {
    this.logger.debug(`invalidateCache(${scope}, ${scopeId})`);
    this.cache.invalidate(scope, scopeId);
  }

  async getSource(
    source: string,
    scope: ContextScope,
    scopeId: string,
  ): Promise<Record<string, unknown>> {
    this.logger.debug(`getSource(${source}, ${scope}, ${scopeId})`);
    const snapshot = await this.assembler.assemble(scope, scopeId);
    const value = (snapshot.data as Record<string, unknown>)[source];
    return (value as Record<string, unknown>) ?? {};
  }
}
