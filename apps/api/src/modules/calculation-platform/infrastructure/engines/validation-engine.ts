import { Injectable, Logger } from '@nestjs/common';
import type {
  DslInput,
  DslValidation,
} from '../../domain/value-objects/dsl-definition.value-object.js';
import { ValidationResult } from '../../domain/value-objects/validation-result.value-object.js';
import type { ValidationError } from '../../domain/value-objects/validation-result.value-object.js';
import { FormulaEngine } from './formula-engine.js';
import { UnitConversionEngine } from './unit-conversion-engine.js';

@Injectable()
export class ValidationEngine {
  private readonly logger = new Logger(ValidationEngine.name);

  constructor(
    private readonly formulaEngine: FormulaEngine,
    private readonly unitEngine: UnitConversionEngine,
  ) {}

  validateInputs(
    inputs: Record<string, unknown>,
    inputDefs: readonly DslInput[],
  ): ValidationResult {
    const errors: ValidationError[] = [];

    for (const def of inputDefs) {
      const value = inputs[def.name];

      if (def.required && (value === undefined || value === null || value === '')) {
        errors.push({
          field: def.name,
          message: `Required field '${def.name}' is missing`,
          severity: 'error',
          code: 'REQUIRED_FIELD_MISSING',
        });
        continue;
      }

      if (value === undefined || value === null) continue;

      if (def.type === 'number') {
        const num = Number(value);
        if (isNaN(num)) {
          errors.push({
            field: def.name,
            message: `Field '${def.name}' must be a number, got ${typeof value}`,
            severity: 'error',
            code: 'INVALID_NUMBER',
          });
          continue;
        }

        if (def.min !== undefined && num < def.min) {
          errors.push({
            field: def.name,
            message: `Field '${def.name}' value ${num} is below minimum ${def.min}`,
            severity: 'error',
            code: 'VALUE_BELOW_MIN',
          });
        }

        if (def.max !== undefined && num > def.max) {
          errors.push({
            field: def.name,
            message: `Field '${def.name}' value ${num} exceeds maximum ${def.max}`,
            severity: 'error',
            code: 'VALUE_EXCEEDS_MAX',
          });
        }
      }

      if (def.type === 'enum' && def.enumValues && !def.enumValues.includes(String(value))) {
        errors.push({
          field: def.name,
          message: `Field '${def.name}' value '${value}' is not in allowed values: ${def.enumValues.join(', ')}`,
          severity: 'error',
          code: 'INVALID_ENUM_VALUE',
        });
      }

      if (def.unit && value !== undefined && value !== null) {
        const category = this.unitEngine.getCategory(def.unit);
        if (!category) {
          errors.push({
            field: def.name,
            message: `Unknown unit '${def.unit}' for field '${def.name}'`,
            severity: 'warning',
            code: 'UNKNOWN_UNIT',
          });
        }
      }
    }

    return ValidationResult.create(errors);
  }

  validateEngineeringLimits(
    inputs: Record<string, unknown>,
    inputDefs: readonly DslInput[],
  ): ValidationResult {
    const warnings: ValidationError[] = [];

    for (const def of inputDefs) {
      if (def.type === 'number' && inputs[def.name] !== undefined) {
        const value = Number(inputs[def.name]);
        if (def.min !== undefined && def.max !== undefined) {
          const range = def.max - def.min;
          const margin = range * 0.1;
          if (value < def.min + margin) {
            warnings.push({
              field: def.name,
              message: `Value ${value} is near the lower engineering limit (${def.min})`,
              severity: 'warning',
              code: 'NEAR_LOWER_LIMIT',
            });
          }
          if (value > def.max - margin) {
            warnings.push({
              field: def.name,
              message: `Value ${value} is near the upper engineering limit (${def.max})`,
              severity: 'warning',
              code: 'NEAR_UPPER_LIMIT',
            });
          }
        }
      }
    }

    return ValidationResult.create([], warnings);
  }

  validateAgainstDslRules(
    inputs: Record<string, unknown>,
    validations: readonly DslValidation[],
  ): ValidationResult {
    const errors: ValidationError[] = [];

    for (const rule of validations) {
      try {
        const result = this.formulaEngine.evaluate(rule.expression, inputs);
        if (!result) {
          errors.push({
            field: rule.rule,
            message: rule.message,
            severity: rule.severity === 'error' ? 'error' : 'warning',
            code: 'VALIDATION_RULE_FAILED',
          });
        }
      } catch (error) {
        errors.push({
          field: rule.rule,
          message: `Validation rule evaluation error: ${error instanceof Error ? error.message : 'Unknown'}`,
          severity: 'error',
          code: 'VALIDATION_RULE_ERROR',
        });
      }
    }

    const warnings = errors.filter((e) => e.severity === 'warning');
    const errs = errors.filter((e) => e.severity === 'error');
    return ValidationResult.create(errs, warnings);
  }

  detectCircularDependency(formulas: Array<{ name: string; expression: string }>): string | null {
    const graph = new Map<string, Set<string>>();

    for (const formula of formulas) {
      const variables = this.formulaEngine.extractVariables(formula.expression);
      const deps = new Set<string>();
      for (const v of variables) {
        if (formulas.some((f) => f.name === v)) {
          deps.add(v);
        }
      }
      graph.set(formula.name, deps);
    }

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function dfs(node: string): boolean {
      visited.add(node);
      recursionStack.add(node);
      const neighbors = graph.get(node);
      if (neighbors) {
        for (const neighbor of neighbors) {
          if (!visited.has(neighbor)) {
            if (dfs(neighbor)) return true;
          } else if (recursionStack.has(neighbor)) {
            return true;
          }
        }
      }
      recursionStack.delete(node);
      return false;
    }

    for (const node of graph.keys()) {
      if (!visited.has(node)) {
        if (dfs(node)) return `Circular dependency detected involving formula '${node}'`;
      }
    }

    return null;
  }
}
