import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { ICALCULATION_REPOSITORY } from '../ports/calculation-repository.interface.js';
import type { ICalculationRepository } from '../ports/calculation-repository.interface.js';
import { CalculationVersionEntity } from '../../domain/entities/calculation-version.entity.js';
import { DslDefinition } from '../../domain/value-objects/dsl-definition.value-object.js';

@Injectable()
export class CalculationVersioningService {
  private readonly logger = new Logger(CalculationVersioningService.name);

  constructor(
    @Inject(ICALCULATION_REPOSITORY)
    private readonly repo: ICalculationRepository,
  ) {}

  async createVersion(data: {
    definitionId: string; version: string; dslJson: Record<string, unknown>;
    changeLog?: string | null; createdBy: string;
  }): Promise<CalculationVersionEntity> {
    const definition = await this.repo.findDefinitionById(data.definitionId);
    if (!definition) throw new NotFoundException(`Definition ${data.definitionId} not found`);

    const dsl = DslDefinition.fromJson(data.dslJson);
    const versions = await this.repo.findVersionsByDefinitionId(data.definitionId);
    const versionExists = versions.some(v => v.version === data.version);
    if (versionExists) throw new BadRequestException(`Version '${data.version}' already exists for this definition`);

    const entity = CalculationVersionEntity.create({
      definitionId: data.definitionId,
      version: data.version,
      dslDefinition: dsl,
      changeLog: data.changeLog,
      createdBy: data.createdBy,
    });

    await this.repo.saveVersion(entity);
    this.logger.log(`Version ${data.version} created for definition '${definition.name}'`);
    return entity;
  }

  async publishVersion(id: string, userId: string): Promise<CalculationVersionEntity> {
    const entity = await this.repo.findVersionById(id);
    if (!entity) throw new NotFoundException(`Version ${id} not found`);

    const currentActive = await this.repo.findActiveVersion(entity.definitionId);
    if (currentActive && currentActive.id !== id) {
      currentActive.deprecate();
      await this.repo.saveVersion(currentActive);
    }

    entity.publish();
    await this.repo.saveVersion(entity);
    this.logger.log(`Version ${entity.version} published for definition ${entity.definitionId}`);
    return entity;
  }

  async deprecateVersion(id: string): Promise<CalculationVersionEntity> {
    const entity = await this.repo.findVersionById(id);
    if (!entity) throw new NotFoundException(`Version ${id} not found`);
    entity.deprecate();
    await this.repo.saveVersion(entity);
    return entity;
  }

  async rollback(definitionId: string, targetVersion: string, userId: string): Promise<CalculationVersionEntity> {
    const versions = await this.repo.findVersionsByDefinitionId(definitionId);
    const target = versions.find(v => v.version === targetVersion);
    if (!target) throw new NotFoundException(`Version '${targetVersion}' not found for definition ${definitionId}`);

    const currentActive = versions.find(v => v.status === 'active');
    if (currentActive) {
      currentActive.supersede();
      await this.repo.saveVersion(currentActive);
    }

    const rollbackEntity = await this.repo.findVersionById(target.id);
    if (!rollbackEntity) throw new NotFoundException(`Target version ${target.id} not found`);
    rollbackEntity.publish();
    await this.repo.saveVersion(rollbackEntity);

    this.logger.log(`Definition ${definitionId} rolled back to version ${targetVersion}`);
    return rollbackEntity;
  }

  async getVersionHistory(definitionId: string): Promise<CalculationVersionEntity[]> {
    return this.repo.findVersionsByDefinitionId(definitionId);
  }

  async getActiveVersion(definitionId: string): Promise<CalculationVersionEntity | null> {
    return this.repo.findActiveVersion(definitionId);
  }
}
