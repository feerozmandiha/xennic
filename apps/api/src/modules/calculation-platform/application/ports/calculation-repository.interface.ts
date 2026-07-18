import type { CalculationCategoryEntity } from '../../domain/entities/calculation-category.entity.js';
import type { CalculationDefinitionEntity } from '../../domain/entities/calculation-definition.entity.js';
import type { CalculationVersionEntity } from '../../domain/entities/calculation-version.entity.js';
import type { FormulaDefinitionEntity } from '../../domain/entities/formula-definition.entity.js';
import type { FormulaVariableEntity } from '../../domain/entities/formula-variable.entity.js';

export interface ICalculationRepository {
  // Categories
  findCategoryById(id: string): Promise<CalculationCategoryEntity | null>;
  findCategoryBySlug(slug: string): Promise<CalculationCategoryEntity | null>;
  findAllCategories(): Promise<CalculationCategoryEntity[]>;
  saveCategory(category: CalculationCategoryEntity): Promise<void>;
  deleteCategory(id: string): Promise<void>;

  // Definitions
  findDefinitionById(id: string): Promise<CalculationDefinitionEntity | null>;
  findDefinitionBySlug(slug: string): Promise<CalculationDefinitionEntity | null>;
  findAllDefinitions(options?: {
    categoryId?: string;
    enabled?: boolean;
  }): Promise<CalculationDefinitionEntity[]>;
  saveDefinition(definition: CalculationDefinitionEntity): Promise<void>;
  deleteDefinition(id: string): Promise<void>;
  existsBySlug(slug: string): Promise<boolean>;

  // Versions
  findVersionById(id: string): Promise<CalculationVersionEntity | null>;
  findVersionsByDefinitionId(definitionId: string): Promise<CalculationVersionEntity[]>;
  findActiveVersion(definitionId: string): Promise<CalculationVersionEntity | null>;
  saveVersion(version: CalculationVersionEntity): Promise<void>;

  // Formulas
  findFormulaById(id: string): Promise<FormulaDefinitionEntity | null>;
  findFormulasByDefinitionId(definitionId: string): Promise<FormulaDefinitionEntity[]>;
  saveFormula(formula: FormulaDefinitionEntity): Promise<void>;
  deleteFormula(id: string): Promise<void>;

  // Formula Variables
  findVariablesByFormulaId(formulaId: string): Promise<FormulaVariableEntity[]>;
  saveVariable(variable: FormulaVariableEntity): Promise<void>;
  deleteVariable(id: string): Promise<void>;
}

export const ICALCULATION_REPOSITORY = 'ICalculationRepository';
