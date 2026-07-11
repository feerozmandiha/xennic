import { Injectable, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { ICalculationRepository } from '../../application/ports/calculation-repository.interface.js';
import { CalculationCategoryEntity } from '../../domain/entities/calculation-category.entity.js';
import { CalculationDefinitionEntity } from '../../domain/entities/calculation-definition.entity.js';
import { CalculationVersionEntity } from '../../domain/entities/calculation-version.entity.js';
import { FormulaDefinitionEntity } from '../../domain/entities/formula-definition.entity.js';
import { FormulaVariableEntity } from '../../domain/entities/formula-variable.entity.js';

@Injectable()
export class PrismaCalculationRepository implements ICalculationRepository {
  private readonly logger = new Logger(PrismaCalculationRepository.name);

  // ── Categories ──

  async findCategoryById(id: string): Promise<CalculationCategoryEntity | null> {
    const row = await prisma.calculation_categories.findUnique({ where: { id } });
    return row ? CalculationCategoryEntity.reconstitute(row) : null;
  }

  async findCategoryBySlug(slug: string): Promise<CalculationCategoryEntity | null> {
    const row = await prisma.calculation_categories.findUnique({ where: { slug } });
    return row ? CalculationCategoryEntity.reconstitute(row) : null;
  }

  async findAllCategories(): Promise<CalculationCategoryEntity[]> {
    const rows = await prisma.calculation_categories.findMany({ orderBy: { sort_order: 'asc' } });
    return rows.map(CalculationCategoryEntity.reconstitute);
  }

  async saveCategory(category: CalculationCategoryEntity): Promise<void> {
    await prisma.calculation_categories.upsert({
      where: { id: category.id },
      update: {
        name: category.name,
        description: category.description,
        icon: category.icon,
        sort_order: category.sortOrder,
        parent_id: category.parentId,
        updated_at: category.updatedAt,
      },
      create: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        sort_order: category.sortOrder,
        parent_id: category.parentId,
        created_at: category.createdAt,
        updated_at: category.updatedAt,
      },
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await prisma.calculation_categories.delete({ where: { id } });
  }

  // ── Definitions ──

  async findDefinitionById(id: string): Promise<CalculationDefinitionEntity | null> {
    const row = await prisma.calculation_definitions.findUnique({ where: { id } });
    return row
      ? CalculationDefinitionEntity.reconstitute({ ...row, metadata: row.metadata as any })
      : null;
  }

  async findDefinitionBySlug(slug: string): Promise<CalculationDefinitionEntity | null> {
    const row = await prisma.calculation_definitions.findUnique({ where: { slug } });
    return row
      ? CalculationDefinitionEntity.reconstitute({ ...row, metadata: row.metadata as any })
      : null;
  }

  async findAllDefinitions(options?: {
    categoryId?: string;
    enabled?: boolean;
  }): Promise<CalculationDefinitionEntity[]> {
    const where: Record<string, unknown> = {};
    if (options?.categoryId) where.category_id = options.categoryId;
    if (options?.enabled !== undefined) where.enabled = options.enabled;
    const rows = await prisma.calculation_definitions.findMany({ where, orderBy: { name: 'asc' } });
    return rows.map((r) =>
      CalculationDefinitionEntity.reconstitute({ ...r, metadata: r.metadata as any }),
    );
  }

  async saveDefinition(definition: CalculationDefinitionEntity): Promise<void> {
    await prisma.calculation_definitions.upsert({
      where: { id: definition.id },
      update: {
        name: definition.name,
        description: definition.description,
        standard: definition.standard,
        standard_ref: definition.standardRef,
        enabled: definition.enabled,
        ai_review: definition.aiReview,
        certificate: definition.certificate,
        metadata: definition.metadata as any,
        updated_at: definition.updatedAt,
      },
      create: {
        id: definition.id,
        category_id: definition.categoryId,
        slug: definition.slug,
        name: definition.name,
        description: definition.description,
        standard: definition.standard,
        standard_ref: definition.standardRef,
        enabled: definition.enabled,
        ai_review: definition.aiReview,
        certificate: definition.certificate,
        metadata: definition.metadata as any,
        created_at: definition.createdAt,
        updated_at: definition.updatedAt,
      },
    });
  }

  async deleteDefinition(id: string): Promise<void> {
    await prisma.calculation_definitions.delete({ where: { id } });
  }

  async existsBySlug(slug: string): Promise<boolean> {
    const count = await prisma.calculation_definitions.count({ where: { slug } });
    return count > 0;
  }

  // ── Versions ──

  async findVersionById(id: string): Promise<CalculationVersionEntity | null> {
    const row = await prisma.calculation_versions.findUnique({ where: { id } });
    return row
      ? CalculationVersionEntity.reconstitute({ ...row, dsl_definition: row.dsl_definition as any })
      : null;
  }

  async findVersionsByDefinitionId(definitionId: string): Promise<CalculationVersionEntity[]> {
    const rows = await prisma.calculation_versions.findMany({
      where: { definition_id: definitionId },
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) =>
      CalculationVersionEntity.reconstitute({ ...r, dsl_definition: r.dsl_definition as any }),
    );
  }

  async findActiveVersion(definitionId: string): Promise<CalculationVersionEntity | null> {
    const row = await prisma.calculation_versions.findFirst({
      where: { definition_id: definitionId, status: 'active' },
    });
    return row
      ? CalculationVersionEntity.reconstitute({ ...row, dsl_definition: row.dsl_definition as any })
      : null;
  }

  async saveVersion(version: CalculationVersionEntity): Promise<void> {
    await prisma.calculation_versions.upsert({
      where: { id: version.id },
      update: {
        status: version.status,
        dsl_definition: version.dslDefinition.toJson() as any,
        change_log: version.changeLog,
        published_at: version.publishedAt,
      },
      create: {
        id: version.id,
        definition_id: version.definitionId,
        version: version.version,
        status: version.status,
        dsl_definition: version.dslDefinition.toJson() as any,
        change_log: version.changeLog,
        published_at: version.publishedAt,
        created_by: version.createdBy,
        created_at: version.createdAt,
      },
    });
  }

  // ── Formulas ──

  async findFormulaById(id: string): Promise<FormulaDefinitionEntity | null> {
    const row = await prisma.formula_definitions.findUnique({ where: { id } });
    return row
      ? FormulaDefinitionEntity.reconstitute({ ...row, metadata: row.metadata as any })
      : null;
  }

  async findFormulasByDefinitionId(definitionId: string): Promise<FormulaDefinitionEntity[]> {
    const rows = await prisma.formula_definitions.findMany({
      where: { definition_id: definitionId },
    });
    return rows.map((r) =>
      FormulaDefinitionEntity.reconstitute({ ...r, metadata: r.metadata as any }),
    );
  }

  async saveFormula(formula: FormulaDefinitionEntity): Promise<void> {
    await prisma.formula_definitions.upsert({
      where: { id: formula.id },
      update: {
        name: formula.name,
        expression: formula.expression,
        description: formula.description,
        return_type: formula.returnType,
        metadata: formula.metadata as any,
        updated_at: formula.updatedAt,
      },
      create: {
        id: formula.id,
        definition_id: formula.definitionId,
        version_id: formula.versionId,
        name: formula.name,
        expression: formula.expression,
        description: formula.description,
        return_type: formula.returnType,
        metadata: formula.metadata as any,
        created_at: formula.createdAt,
        updated_at: formula.updatedAt,
      },
    });
  }

  async deleteFormula(id: string): Promise<void> {
    await prisma.formula_definitions.delete({ where: { id } });
  }

  // ── Formula Variables ──

  async findVariablesByFormulaId(formulaId: string): Promise<FormulaVariableEntity[]> {
    const rows = await prisma.formula_variables.findMany({
      where: { formula_id: formulaId },
      orderBy: { sort_order: 'asc' },
    });
    return rows.map((r) =>
      FormulaVariableEntity.reconstitute({
        ...r,
        default_value: r.default_value as any,
        enum_values: r.enum_values as any,
      }),
    );
  }

  async saveVariable(variable: FormulaVariableEntity): Promise<void> {
    await prisma.formula_variables.upsert({
      where: { id: variable.id },
      update: {
        name: variable.name,
        label: variable.label,
        type: variable.type,
        unit_id: variable.unitId,
        required: variable.required,
        default_value: variable.defaultValue as any,
        min_value: variable.minValue,
        max_value: variable.maxValue,
        enum_values: variable.enumValues as any,
        description: variable.description,
        sort_order: variable.sortOrder,
      },
      create: {
        id: variable.id,
        formula_id: variable.formulaId,
        name: variable.name,
        label: variable.label,
        type: variable.type,
        unit_id: variable.unitId,
        required: variable.required,
        default_value: variable.defaultValue as any,
        min_value: variable.minValue,
        max_value: variable.maxValue,
        enum_values: variable.enumValues as any,
        description: variable.description,
        sort_order: variable.sortOrder,
        created_at: variable.createdAt,
      },
    });
  }

  async deleteVariable(id: string): Promise<void> {
    await prisma.formula_variables.delete({ where: { id } });
  }
}
