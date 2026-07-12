import { Injectable, Logger, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import { ICALCULATION_REPOSITORY } from '../ports/calculation-repository.interface.js';
import type { ICalculationRepository } from '../ports/calculation-repository.interface.js';
import { CalculationCategoryEntity } from '../../domain/entities/calculation-category.entity.js';
import { CalculationDefinitionEntity } from '../../domain/entities/calculation-definition.entity.js';
import { CalculationVersionEntity } from '../../domain/entities/calculation-version.entity.js';
import { FormulaDefinitionEntity } from '../../domain/entities/formula-definition.entity.js';
import { FormulaVariableEntity } from '../../domain/entities/formula-variable.entity.js';
import { DslDefinition } from '../../domain/value-objects/dsl-definition.value-object.js';

@Injectable()
export class CalculationRegistryService {
  private readonly logger = new Logger(CalculationRegistryService.name);

  constructor(
    @Inject(ICALCULATION_REPOSITORY)
    private readonly repo: ICalculationRepository,
  ) {}

  // ── Categories ──

  async createCategory(data: {
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
    icon?: string | null;
    sortOrder?: number;
  }): Promise<CalculationCategoryEntity> {
    const existing = await this.repo.findCategoryBySlug(data.slug);
    if (existing) throw new ConflictException(`Category with slug '${data.slug}' already exists`);
    const entity = CalculationCategoryEntity.create(data);
    await this.repo.saveCategory(entity);
    this.logger.log(`Category created: ${entity.name} (${entity.id})`);
    return entity;
  }

  async getCategoryById(id: string): Promise<CalculationCategoryEntity> {
    const entity = await this.repo.findCategoryById(id);
    if (!entity) throw new NotFoundException(`Category ${id} not found`);
    return entity;
  }

  async getAllCategories(): Promise<CalculationCategoryEntity[]> {
    return this.repo.findAllCategories();
  }

  async updateCategory(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      icon: string | null;
      sortOrder: number;
    }>,
  ): Promise<CalculationCategoryEntity> {
    const entity = await this.getCategoryById(id);
    entity.update(data);
    await this.repo.saveCategory(entity);
    return entity;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.getCategoryById(id);
    await this.repo.deleteCategory(id);
  }

  // ── Definitions ──

  async createDefinition(data: {
    categoryId: string;
    slug: string;
    name: string;
    description?: string | null;
    standard?: string | null;
    standardRef?: string | null;
    enabled?: boolean;
    aiReview?: boolean;
    certificate?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<CalculationDefinitionEntity> {
    const existing = await this.repo.existsBySlug(data.slug);
    if (existing) throw new ConflictException(`Definition with slug '${data.slug}' already exists`);
    await this.getCategoryById(data.categoryId);
    const entity = CalculationDefinitionEntity.create(data);
    await this.repo.saveDefinition(entity);
    this.logger.log(`Definition created: ${entity.name} (${entity.slug})`);
    return entity;
  }

  async getDefinitionById(id: string): Promise<CalculationDefinitionEntity> {
    const entity = await this.repo.findDefinitionById(id);
    if (!entity) throw new NotFoundException(`Definition ${id} not found`);
    return entity;
  }

  async getDefinitionBySlug(slug: string): Promise<CalculationDefinitionEntity> {
    const entity = await this.repo.findDefinitionBySlug(slug);
    if (!entity) throw new NotFoundException(`Definition '${slug}' not found`);
    return entity;
  }

  async getAllDefinitions(options?: {
    categoryId?: string;
    enabled?: boolean;
  }): Promise<CalculationDefinitionEntity[]> {
    return this.repo.findAllDefinitions(options);
  }

  async updateDefinition(
    id: string,
    data: Partial<{
      name: string;
      description: string | null;
      standard: string | null;
      standardRef: string | null;
      enabled: boolean;
      aiReview: boolean;
      certificate: boolean;
      metadata: Record<string, unknown>;
    }>,
  ): Promise<CalculationDefinitionEntity> {
    const entity = await this.getDefinitionById(id);
    entity.update(data);
    await this.repo.saveDefinition(entity);
    return entity;
  }

  async enableDefinition(id: string): Promise<CalculationDefinitionEntity> {
    const entity = await this.getDefinitionById(id);
    entity.enable();
    await this.repo.saveDefinition(entity);
    return entity;
  }

  async disableDefinition(id: string): Promise<CalculationDefinitionEntity> {
    const entity = await this.getDefinitionById(id);
    entity.disable();
    await this.repo.saveDefinition(entity);
    return entity;
  }

  // ── Versions ──

  async createVersion(data: {
    definitionId: string;
    version: string;
    dslDefinition: DslDefinition;
    changeLog?: string | null;
    createdBy: string;
  }): Promise<CalculationVersionEntity> {
    await this.getDefinitionById(data.definitionId);
    const entity = CalculationVersionEntity.create(data);
    await this.repo.saveVersion(entity);
    this.logger.log(`Version created: ${data.version} for definition ${data.definitionId}`);
    return entity;
  }

  async getVersionById(id: string): Promise<CalculationVersionEntity> {
    const entity = await this.repo.findVersionById(id);
    if (!entity) throw new NotFoundException(`Version ${id} not found`);
    return entity;
  }

  async getVersionsByDefinitionId(definitionId: string): Promise<CalculationVersionEntity[]> {
    return this.repo.findVersionsByDefinitionId(definitionId);
  }

  async getActiveVersion(definitionId: string): Promise<CalculationVersionEntity | null> {
    return this.repo.findActiveVersion(definitionId);
  }

  async publishVersion(id: string): Promise<CalculationVersionEntity> {
    const entity = await this.getVersionById(id);
    entity.publish();
    await this.repo.saveVersion(entity);
    return entity;
  }

  // ── Formulas ──

  async createFormula(data: {
    definitionId?: string | null;
    versionId?: string | null;
    name: string;
    expression: string;
    description?: string | null;
    returnType?: string;
    metadata?: Record<string, unknown>;
  }): Promise<FormulaDefinitionEntity> {
    const entity = FormulaDefinitionEntity.create(data);
    await this.repo.saveFormula(entity);
    return entity;
  }

  async getFormulaById(id: string): Promise<FormulaDefinitionEntity> {
    const entity = await this.repo.findFormulaById(id);
    if (!entity) throw new NotFoundException(`Formula ${id} not found`);
    return entity;
  }

  async getFormulasByDefinitionId(definitionId: string): Promise<FormulaDefinitionEntity[]> {
    return this.repo.findFormulasByDefinitionId(definitionId);
  }

  async updateFormula(
    id: string,
    data: Partial<{
      name: string;
      expression: string;
      description: string | null;
      returnType: string;
      metadata: Record<string, unknown>;
    }>,
  ): Promise<FormulaDefinitionEntity> {
    const entity = await this.getFormulaById(id);
    entity.update(data);
    await this.repo.saveFormula(entity);
    return entity;
  }

  async deleteFormula(id: string): Promise<void> {
    await this.getFormulaById(id);
    await this.repo.deleteFormula(id);
  }

  // ── Formula Variables ──

  async createVariable(data: {
    formulaId: string;
    name: string;
    label?: string | null;
    type?: 'number' | 'string' | 'boolean' | 'enum' | 'table';
    unitId?: string | null;
    required?: boolean;
    defaultValue?: unknown;
    minValue?: number;
    maxValue?: number;
    enumValues?: string[] | null;
    description?: string | null;
    sortOrder?: number;
  }): Promise<FormulaVariableEntity> {
    const entity = FormulaVariableEntity.create(data);
    await this.repo.saveVariable(entity);
    return entity;
  }

  async getVariablesByFormulaId(formulaId: string): Promise<FormulaVariableEntity[]> {
    return this.repo.findVariablesByFormulaId(formulaId);
  }
}
