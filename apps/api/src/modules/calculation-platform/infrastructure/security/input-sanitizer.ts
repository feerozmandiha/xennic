import { Injectable } from '@nestjs/common';

const MAX_INPUT_VALUE_LENGTH = 10000;
const MAX_INPUT_DEPTH = 10;
const MAX_INPUT_KEYS = 500;
const FORBIDDEN_KEYS = ['__proto__', 'constructor', 'prototype', 'undefined', 'null'];

@Injectable()
export class InputSanitizer {
  sanitize(inputs: Record<string, unknown>): { safe: boolean; error?: string; sanitized: Record<string, unknown> } {
    const keys = Object.keys(inputs);

    if (keys.length > MAX_INPUT_KEYS) {
      return { safe: false, error: `Input has ${keys.length} keys, maximum is ${MAX_INPUT_KEYS}`, sanitized: inputs };
    }

    for (const key of keys) {
      if (FORBIDDEN_KEYS.includes(key)) {
        return { safe: false, error: `Input contains forbidden key: ${key}`, sanitized: inputs };
      }

      const value = inputs[key];
      const depth = this.calculateDepth(value);
      if (depth > MAX_INPUT_DEPTH) {
        return { safe: false, error: `Input key '${key}' has nesting depth ${depth}, maximum is ${MAX_INPUT_DEPTH}`, sanitized: inputs };
      }

      if (typeof value === 'string' && value.length > MAX_INPUT_VALUE_LENGTH) {
        return { safe: false, error: `Input key '${key}' value exceeds maximum length of ${MAX_INPUT_VALUE_LENGTH}`, sanitized: inputs };
      }
    }

    const sanitized = this.stripForbiddenKeys(inputs);
    return { safe: true, sanitized };
  }

  private calculateDepth(value: unknown, depth: number = 0): number {
    if (depth > 100) return depth;
    if (value === null || value === undefined) return depth;
    if (Array.isArray(value)) {
      return Math.max(depth + 1, ...value.map(v => this.calculateDepth(v, depth + 1)));
    }
    if (typeof value === 'object') {
      const obj = value as Record<string, unknown>;
      return Math.max(depth + 1, ...Object.values(obj).map(v => this.calculateDepth(v, depth + 1)));
    }
    return depth;
  }

  private stripForbiddenKeys(inputs: Record<string, unknown>): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(inputs)) {
      if (!FORBIDDEN_KEYS.includes(key)) {
        result[key] = value;
      }
    }
    return result;
  }
}
