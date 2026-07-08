import { Injectable } from '@nestjs/common';

const FORBIDDEN_PATTERNS = [
  /process\s*\./i,
  /require\s*\(/i,
  /import\s*\(/i,
  /eval\s*\(/i,
  /Function\s*\(/i,
  /setTimeout/i,
  /setInterval/i,
  /setImmediate/i,
  /fetch\s*\(/i,
  /XMLHttpRequest/i,
  /WebSocket/i,
  /localStorage/i,
  /sessionStorage/i,
  /globalThis/i,
  /global\s*\./i,
  /this\s*\./i,
  /__proto__/i,
  /constructor\s*\./i,
  /prototype\s*\./i,
  /Reflect\s*\./i,
  /Proxy\s*\(/i,
  /Symbol\s*\(/i,
  /atob\s*\(/i,
  /btoa\s*\(/i,
  /\bBuffer\b/i,
  /new\s+Function/i,
  /new\s+Promise/i,
  /new\s+Proxy/i,
  /\\x[0-9a-f]{2}/i,
  /\\u[0-9a-f]{4}/i,
];

const MAX_EXPRESSION_LENGTH = 10000;
const MAX_NESTING_DEPTH = 50;
const ALLOWED_FUNCTIONS = new Set([
  'abs', 'acos', 'acosh', 'acot', 'acoth', 'acsc', 'acsch', 'asec', 'asech',
  'asin', 'asinh', 'atan', 'atan2', 'atanh', 'ceil', 'combinations', 'cos',
  'cosh', 'cot', 'coth', 'csc', 'csch', 'exp', 'factorial', 'floor', 'gcd',
  'hypot', 'lcm', 'log', 'log10', 'log2', 'max', 'min', 'mod', 'multinomial',
  'permutations', 'pow', 'random', 'round', 'sec', 'sech', 'sign', 'sin',
  'sinh', 'sqrt', 'sum', 'tan', 'tanh', 'add', 'subtract', 'multiply', 'divide',
  'dot', 'cross', 'norm', 'transpose', 'det', 'inv', 'eye', 'zeros', 'ones',
  'pi', 'e', 'i', 'Infinity', 'true', 'false', 'null',
]);

@Injectable()
export class FormulaSanitizer {
  sanitize(expression: string): { safe: boolean; error?: string } {
    if (!expression || expression.trim().length === 0) {
      return { safe: false, error: 'Empty expression' };
    }

    if (expression.length > MAX_EXPRESSION_LENGTH) {
      return { safe: false, error: `Expression exceeds maximum length of ${MAX_EXPRESSION_LENGTH}` };
    }

    const nestingDepth = this.calculateNestingDepth(expression);
    if (nestingDepth > MAX_NESTING_DEPTH) {
      return { safe: false, error: `Expression nesting depth ${nestingDepth} exceeds maximum of ${MAX_NESTING_DEPTH}` };
    }

    for (const pattern of FORBIDDEN_PATTERNS) {
      if (pattern.test(expression)) {
        return { safe: false, error: `Expression contains forbidden pattern: ${pattern}` };
      }
    }

    return { safe: true };
  }

  private calculateNestingDepth(expression: string): number {
    let maxDepth = 0;
    let currentDepth = 0;
    for (const char of expression) {
      if (char === '(') {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      } else if (char === ')') {
        currentDepth--;
      }
    }
    return maxDepth;
  }

  isAllowedFunction(name: string): boolean {
    return ALLOWED_FUNCTIONS.has(name);
  }
}
