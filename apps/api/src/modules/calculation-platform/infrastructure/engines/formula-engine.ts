import { Injectable, Logger } from '@nestjs/common';
import { create, all, type MathJsInstance, type FactoryFunctionMap } from 'mathjs';

@Injectable()
export class FormulaEngine {
  private readonly logger = new Logger(FormulaEngine.name);
  private readonly math: MathJsInstance;

  constructor() {
    this.math = create(all as FactoryFunctionMap, {});
  }

  evaluate(expression: string, variables: Record<string, unknown>): unknown {
    try {
      if (!expression || expression.trim().length === 0) {
        return Number.NaN;
      }

      const compiled = this.math.compile(expression);
      const scope: Record<string, unknown> = { ...variables };
      const result = compiled.evaluate(scope);
      if (typeof result === 'number') return result;
      if (typeof result === 'bigint') return Number(result);
      if (typeof result === 'boolean') return result;
      if (typeof result === 'string') return result;
      if (typeof result === 'object' && result !== null) {
        if (
          (result as { isComplex?: boolean }).isComplex ||
          (result as { mathjs?: string }).mathjs === 'Complex'
        ) {
          return Number.NaN;
        }

        if ('toNumber' in result) {
          return (result as { toNumber: () => number }).toNumber();
        }
      }

      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown formula error';
      this.logger.error(`Formula evaluation error: ${message} for expression: ${expression}`);
      throw new Error(`Formula evaluation failed: ${message}`);
    }
  }

  evaluateWithUnit(
    expression: string,
    variables: Record<string, unknown>,
  ): { value: unknown; unit?: string } {
    const result = this.evaluate(expression, variables);
    return { value: result };
  }

  validateExpression(expression: string): { valid: boolean; error?: string } {
    try {
      this.math.parse(expression);
      return { valid: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid expression';
      return { valid: false, error: message };
    }
  }

  extractVariables(expression: string): string[] {
    try {
      const node = this.math.parse(expression);
      const variables = new Set<string>();
      node.traverse((child: { type?: string; name?: string }) => {
        if (child.type === 'SymbolNode' && child.name) {
          const builtIn = [
            'pi',
            'e',
            'i',
            'Infinity',
            'NaN',
            'true',
            'false',
            'null',
            'sin',
            'cos',
            'tan',
            'log',
            'log2',
            'log10',
            'abs',
            'sqrt',
            'pow',
            'min',
            'max',
            'round',
            'floor',
            'ceil',
            'exp',
          ];
          if (!builtIn.includes(child.name)) {
            variables.add(child.name);
          }
        }
      });
      return Array.from(variables);
    } catch {
      return [];
    }
  }
}
