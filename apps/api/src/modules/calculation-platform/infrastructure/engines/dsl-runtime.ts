import { Injectable, Logger } from '@nestjs/common';
import type { DslDefinition, DslInput } from '../../domain/value-objects/dsl-definition.value-object.js';
import type { CalculationDsl } from '../../shared/types/dsl-types.js';
import { FormulaEngine } from './formula-engine.js';
import { UnitConversionEngine } from './unit-conversion-engine.js';
import { ValidationEngine } from './validation-engine.js';

export interface DslExecutionContext {
  definitionId?: string;
  versionId?: string;
  inputs: Record<string, unknown>;
  workspaceId: string;
  userId: string;
  correlationId?: string;
}

export interface DslExecutionResult {
  outputs: Record<string, unknown>;
  durationMs: number;
  formulaCount: number;
  errors: string[];
  intermediateValues: Record<string, unknown>;
}

@Injectable()
export class DslRuntime {
  private readonly logger = new Logger(DslRuntime.name);

  constructor(
    private readonly formulaEngine: FormulaEngine,
    private readonly unitEngine: UnitConversionEngine,
    private readonly validationEngine: ValidationEngine,
  ) {}

  async execute(dsl: DslDefinition, context: DslExecutionContext): Promise<DslExecutionResult> {
    const startTime = Date.now();
    const errors: string[] = [];
    const intermediateValues: Record<string, unknown> = {};

    const variables: Record<string, unknown> = { ...context.inputs };

    for (const formula of dsl.formulas) {
      try {
        const result = this.formulaEngine.evaluate(formula.expression, variables);
        variables[formula.name] = result;
        intermediateValues[formula.name] = result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Formula execution error';
        errors.push(`Formula '${formula.name}': ${message}`);
        this.logger.error(`DSL formula execution failed: ${formula.name} - ${message}`);
      }
    }

    const outputs: Record<string, unknown> = {};
    for (const outputDef of dsl.outputs) {
      const value = variables[outputDef.name];
      if (value !== undefined) {
        outputs[outputDef.name] = value;
      }
    }

    const durationMs = Date.now() - startTime;

    return {
      outputs,
      durationMs,
      formulaCount: dsl.formulas.length,
      errors,
      intermediateValues,
    };
  }

  validateDsl(dsl: CalculationDsl): string[] {
    const errors: string[] = [];

    if (!dsl.id) errors.push('DSL missing required field: id');
    if (!dsl.version) errors.push('DSL missing required field: version');
    if (!dsl.inputs?.length) errors.push('DSL must have at least one input');
    if (!dsl.outputs?.length) errors.push('DSL must have at least one output');
    if (!dsl.formulas?.length) errors.push('DSL must have at least one formula');

    for (const input of dsl.inputs) {
      if (!input.name) errors.push('DSL input missing required field: name');
      if (!input.label) errors.push(`DSL input '${input.name}' missing required field: label`);
    }

    for (const output of dsl.outputs) {
      if (!output.name) errors.push('DSL output missing required field: name');
    }

    for (const formula of dsl.formulas) {
      if (!formula.name) errors.push('DSL formula missing required field: name');
      if (!formula.expression) errors.push(`DSL formula '${formula.name}' missing required field: expression`);
      else {
        const validation = this.formulaEngine.validateExpression(formula.expression);
        if (!validation.valid) {
          errors.push(`DSL formula '${formula.name}' has invalid expression: ${validation.error}`);
        }
      }
    }

    return errors;
  }
}
