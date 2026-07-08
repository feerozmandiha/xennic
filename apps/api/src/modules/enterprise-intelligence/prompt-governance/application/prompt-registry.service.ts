import { Injectable, Inject, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import type { PaginatedResult } from '../../shared/types/index.js';
import { PromptEntity, PromptStatus } from '../domain/prompt.entity.js';
import type { IPromptRegistry, PromptFindOptions } from '../domain/prompt-registry.interface.js';

@Injectable()
export class PromptRegistryService {
  private readonly logger = new Logger(PromptRegistryService.name);

  constructor(
    @Inject('IPromptRegistry') private readonly registry: IPromptRegistry,
  ) {}

  async register(
    name: string,
    content: string,
    variables: string[],
    tags: string[],
    createdBy: string,
    description = '',
  ): Promise<PromptEntity> {
    const existing = await this.registry.getByName(name);
    if (existing) {
      throw new ConflictException(`Prompt "${name}" already exists`);
    }

    const entity = PromptEntity.create(name, description, content, variables, createdBy, tags);
    await this.registry.register(entity);
    this.logger.debug(`Registered prompt ${entity.id} (${name})`);
    return entity;
  }

  async get(id: string): Promise<PromptEntity> {
    const entity = await this.registry.get(id);
    if (!entity) {
      throw new NotFoundException(`Prompt ${id} not found`);
    }
    return entity;
  }

  async getByName(name: string, version?: number): Promise<PromptEntity | null> {
    return this.registry.getByName(name, version);
  }

  async createVersion(id: string, content: string, updatedBy: string): Promise<PromptEntity> {
    const existing = await this.registry.get(id);
    if (!existing) {
      throw new NotFoundException(`Prompt ${id} not found`);
    }

    const next = existing.withNewVersion(content, updatedBy);
    await this.registry.register(next);
    this.logger.debug(`Created version ${next.version} for prompt ${id}`);
    return next;
  }

  async list(options?: PromptFindOptions): Promise<PaginatedResult<PromptEntity>> {
    return this.registry.list(options);
  }

  async archive(id: string, updatedBy: string): Promise<PromptEntity> {
    const entity = await this.get(id);
    const archived = entity.withStatus(PromptStatus.ARCHIVED, updatedBy);
    await this.registry.register(archived);
    this.logger.debug(`Archived prompt ${id}`);
    return archived;
  }

  async activate(id: string, updatedBy: string): Promise<PromptEntity> {
    const entity = await this.get(id);
    const activated = entity.withStatus(PromptStatus.ACTIVE, updatedBy);
    await this.registry.register(activated);
    this.logger.debug(`Activated prompt ${id}`);
    return activated;
  }

  async search(query: string, options?: PromptFindOptions): Promise<PaginatedResult<PromptEntity>> {
    return this.registry.search(query, options);
  }

  async delete(id: string): Promise<void> {
    await this.get(id);
    await this.registry.delete(id);
    this.logger.debug(`Deleted prompt ${id}`);
  }
}
