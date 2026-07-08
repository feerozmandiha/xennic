import { Injectable } from '@nestjs/common';

const MAX_DSL_SIZE = 1024 * 1024; // 1MB
const MAX_INPUTS = 100;
const MAX_OUTPUTS = 50;
const MAX_FORMULAS = 200;
const MAX_VALIDATIONS = 100;
const MAX_STRING_LENGTH = 5000;

@Injectable()
export class DslValidator {
  validate(dsl: Record<string, unknown>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    const jsonSize = Buffer.byteLength(JSON.stringify(dsl), 'utf-8');
    if (jsonSize > MAX_DSL_SIZE) {
      errors.push(`DSL size ${jsonSize} bytes exceeds maximum of ${MAX_DSL_SIZE} bytes`);
      return { valid: false, errors };
    }

    if (!dsl.id || typeof dsl.id !== 'string') errors.push('DSL must have a string id');
    if (!dsl.version || typeof dsl.version !== 'string') errors.push('DSL must have a string version');

    if (dsl.standard && typeof dsl.standard !== 'string') errors.push('DSL standard must be a string');

    const inputs = dsl.inputs as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(inputs) || inputs.length === 0) {
      errors.push('DSL must have at least one input');
    } else if (inputs.length > MAX_INPUTS) {
      errors.push(`DSL inputs count ${inputs.length} exceeds maximum of ${MAX_INPUTS}`);
    } else {
      for (const input of inputs) {
        if (typeof input.name !== 'string') errors.push('Each input must have a string name');
        if (typeof input.label !== 'string') errors.push(`Input '${input.name}' must have a string label`);
        if (input.type && !['number', 'string', 'boolean', 'enum', 'table'].includes(input.type as string)) {
          errors.push(`Input '${input.name}' has invalid type '${input.type}'`);
        }
        if (input.description && typeof input.description === 'string' && input.description.length > MAX_STRING_LENGTH) {
          errors.push(`Input '${input.name}' description exceeds maximum length`);
        }
      }
    }

    const outputs = dsl.outputs as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(outputs) || outputs.length === 0) {
      errors.push('DSL must have at least one output');
    } else if (outputs.length > MAX_OUTPUTS) {
      errors.push(`DSL outputs count ${outputs.length} exceeds maximum of ${MAX_OUTPUTS}`);
    } else {
      for (const output of outputs) {
        if (typeof output.name !== 'string') errors.push('Each output must have a string name');
      }
    }

    const formulas = dsl.formulas as Array<Record<string, unknown>> | undefined;
    if (!Array.isArray(formulas) || formulas.length === 0) {
      errors.push('DSL must have at least one formula');
    } else if (formulas.length > MAX_FORMULAS) {
      errors.push(`DSL formulas count ${formulas.length} exceeds maximum of ${MAX_FORMULAS}`);
    }

    const validations = dsl.validation as Array<Record<string, unknown>> | undefined;
    if (validations && validations.length > MAX_VALIDATIONS) {
      errors.push(`DSL validations count ${validations.length} exceeds maximum of ${MAX_VALIDATIONS}`);
    }

    return { valid: errors.length === 0, errors };
  }
}
