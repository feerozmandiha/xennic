import { Injectable, Logger, Inject } from '@nestjs/common';
import { ICALCULATION_REPOSITORY } from '../ports/calculation-repository.interface.js';
import type { ICalculationRepository } from '../ports/calculation-repository.interface.js';
import { ValidationEngine } from '../../infrastructure/engines/validation-engine.js';
import { DslRuntime } from '../../infrastructure/engines/dsl-runtime.js';

@Injectable()
export class CalculationValidationService {
  private readonly logger = new Logger(CalculationValidationService.name);

  constructor(
    @Inject(ICALCULATION_REPOSITORY)
    private readonly repo: ICalculationRepository,
    private readonly validationEngine: ValidationEngine,
    private readonly dslRuntime: DslRuntime,
  ) {}

  async validateInputs(definitionId: string, inputs: Record<string, unknown>) {
    const definition = await this.repo.findDefinitionById(definitionId);
    if (!definition) throw new Error(`Definition ${definitionId} not found`);

    const version = await this.repo.findActiveVersion(definitionId);
    if (!version) throw new Error(`No active version for definition ${definitionId}`);

    const dsl = version.dslDefinition;

    const inputValidation = this.validationEngine.validateInputs(inputs, dsl.inputs);
    const limitValidation = this.validationEngine.validateEngineeringLimits(inputs, dsl.inputs);
    const ruleValidation = this.validationEngine.validateAgainstDslRules(inputs, dsl.validations);

    return {
      valid: inputValidation.valid && ruleValidation.valid,
      errors: [...inputValidation.errors, ...ruleValidation.errors],
      warnings: [...inputValidation.warnings, ...limitValidation.warnings, ...ruleValidation.warnings],
      inputCount: dsl.inputs.length,
      outputCount: dsl.outputs.length,
      formulaCount: dsl.formulas.length,
    };
  }

  async validateFormula(expression: string) {
    const result = this.validationEngine['formulaEngine'].validateExpression(expression);
    if (result.valid) {
      const variables = this.validationEngine['formulaEngine'].extractVariables(expression);
      return { valid: true, variables };
    }
    return { valid: false, error: result.error };
  }

  async validateDsl(dslJson: Record<string, unknown>) {
    const errors = this.dslRuntime.validateDsl(dslJson as any);
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  async detectCircularDependencies(formulas: Array<{ name: string; expression: string }>) {
    const circular = this.validationEngine.detectCircularDependency(formulas);
    return { hasCircularDependency: circular !== null, message: circular };
  }

  async validateAll(definitionId: string, inputs: Record<string, unknown>) {
    const [inputResult, definition] = await Promise.all([
      this.validateInputs(definitionId, inputs),
      this.repo.findDefinitionById(definitionId),
    ]);

    const version = await this.repo.findActiveVersion(definitionId);
    const formulas = version ? version.dslDefinition.formulas.map(f => ({ name: f.name, expression: f.expression })) : [];
    const circularResult = await this.detectCircularDependencies(formulas);

    return {
      inputValidation: inputResult,
      circularDependency: circularResult,
      definitionStatus: definition?.enabled ? 'enabled' : 'disabled',
      hasActiveVersion: version !== null,
    };
  }
}
