import type { ToolCall, ToolParameter } from '../../domain/types/tool.types.js';

export class ToolInputValidator {
  validate(call: ToolCall, params: ToolParameter[]): string[] {
    const errors: string[] = [];

    for (const param of params) {
      const value = call.parameters[param.name];
      if (param.required && (value === undefined || value === null)) {
        errors.push(`Missing required parameter: ${param.name}`);
        continue;
      }
      if (value !== undefined && value !== null) {
        if (!this._typeMatches(value, param.type)) {
          errors.push(`Parameter "${param.name}" expected ${param.type}, got ${typeof value}`);
        }
      }
    }

    return errors;
  }

  private _typeMatches(value: unknown, expected: string): boolean {
    switch (expected) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'array':
        return Array.isArray(value);
      default:
        return true;
    }
  }
}
