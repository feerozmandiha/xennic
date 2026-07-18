import { Injectable, Logger, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { IPLUGIN_REPOSITORY } from '../ports/plugin-repository.interface.js';
import type { IPluginRepository } from '../ports/plugin-repository.interface.js';
import { CalculationPluginEntity } from '../../domain/entities/calculation-plugin.entity.js';
import { PluginRegistry } from '../../infrastructure/plugin-registry.js';

@Injectable()
export class PluginService {
  private readonly logger = new Logger(PluginService.name);

  constructor(
    @Inject(IPLUGIN_REPOSITORY)
    private readonly repo: IPluginRepository,
    private readonly registry: PluginRegistry,
  ) {}

  async register(data: {
    slug: string;
    name: string;
    description?: string | null;
    version: string;
    enabled?: boolean;
    config?: Record<string, unknown>;
  }): Promise<CalculationPluginEntity> {
    const exists = await this.repo.existsBySlug(data.slug);
    if (exists) throw new ConflictException(`Plugin '${data.slug}' already registered`);
    const entity = CalculationPluginEntity.create(data);
    await this.repo.save(entity);
    this.logger.log(`Plugin registered: ${entity.name} (${entity.slug})`);
    return entity;
  }

  async getById(id: string): Promise<CalculationPluginEntity> {
    const entity = await this.repo.findById(id);
    if (!entity) throw new NotFoundException(`Plugin ${id} not found`);
    return entity;
  }

  async getBySlug(slug: string): Promise<CalculationPluginEntity> {
    const entity = await this.repo.findBySlug(slug);
    if (!entity) throw new NotFoundException(`Plugin '${slug}' not found`);
    return entity;
  }

  async getAll(options?: { enabled?: boolean }): Promise<CalculationPluginEntity[]> {
    return this.repo.findAll(options);
  }

  async enable(id: string): Promise<CalculationPluginEntity> {
    const entity = await this.getById(id);
    entity.enable();
    await this.repo.save(entity);
    return entity;
  }

  async disable(id: string): Promise<CalculationPluginEntity> {
    const entity = await this.getById(id);
    entity.disable();
    await this.repo.save(entity);
    return entity;
  }

  async update(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      version: string;
      config: Record<string, unknown>;
    }>,
  ): Promise<CalculationPluginEntity> {
    const entity = await this.getById(id);
    entity.update(data);
    await this.repo.save(entity);
    return entity;
  }

  getBuiltInPlugins() {
    return this.registry.getAllPlugins();
  }

  getCapabilities() {
    return this.registry.getCapabilities();
  }

  async delete(id: string): Promise<void> {
    await this.getById(id);
    await this.repo.delete(id);
  }
}
