import { Injectable, Logger, Inject } from '@nestjs/common';
import type { ContextScope } from '../../shared/types/index.js';
import { ContextEntity } from '../domain/context.entity.js';
import type { IContextRepository } from '../domain/context-repository.interface.js';

@Injectable()
export class ContextBuilderService {
  private readonly logger = new Logger(ContextBuilderService.name);

  constructor(
    @Inject('IContextRepository')
    private readonly repository: IContextRepository,
  ) {}

  async fromWorkspace(id: string): Promise<Record<string, unknown>> {
    return { workspaceId: id, type: 'workspace' };
  }

  async fromUser(id: string): Promise<Record<string, unknown>> {
    return { userId: id, type: 'user' };
  }

  async fromProject(id: string): Promise<Record<string, unknown>> {
    return { projectId: id, type: 'project' };
  }

  async fromRole(id: string): Promise<Record<string, unknown>> {
    return { roleId: id, type: 'role' };
  }

  async fromKnowledge(id: string): Promise<Record<string, unknown>> {
    return { knowledgeId: id, type: 'knowledge' };
  }

  async fromStandards(id: string): Promise<Record<string, unknown>> {
    return { standardsId: id, type: 'standards' };
  }

  async fromEngineering(id: string): Promise<Record<string, unknown>> {
    return { engineeringId: id, type: 'engineering' };
  }

  async fromMarketplace(id: string): Promise<Record<string, unknown>> {
    return { marketplaceId: id, type: 'marketplace' };
  }

  async fromBilling(id: string): Promise<Record<string, unknown>> {
    return { billingId: id, type: 'billing' };
  }

  async fromStorage(id: string): Promise<Record<string, unknown>> {
    return { storageId: id, type: 'storage' };
  }

  async fromNotification(id: string): Promise<Record<string, unknown>> {
    return { notificationId: id, type: 'notification' };
  }

  async build(
    scope: ContextScope,
    scopeId: string,
    source: string,
    key: string,
    value: Record<string, unknown>,
    createdBy: string,
  ): Promise<ContextEntity> {
    const entity = ContextEntity.create(scope, scopeId, source, key, value, createdBy);
    await this.repository.save(entity);
    this.logger.debug(`Context built: ${source}/${key} for ${scope}:${scopeId}`);
    return entity;
  }
}
