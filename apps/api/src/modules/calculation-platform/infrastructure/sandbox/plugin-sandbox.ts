import { Injectable, Logger } from '@nestjs/common';
import type { RegisteredPlugin } from '../plugin-registry.js';

interface SandboxContext {
  variables: Record<string, unknown>;
  constants: Readonly<Record<string, number>>;
  functions: Readonly<Record<string, (...args: unknown[]) => unknown>>;
}

export interface SandboxResult {
  outputs: Record<string, unknown>;
  durationMs: number;
  error?: string;
}

const ENGINEERING_CONSTANTS: Readonly<Record<string, number>> = Object.freeze({
  pi: Math.PI,
  e: Math.E,
  c: 299792458,
  g: 9.80665,
  h: 6.62607015e-34,
  k: 1.380649e-23,
  eps0: 8.854187817e-12,
  mu0: 1.25663706212e-6,
  e0: 1.602176634e-19,
  Na: 6.02214076e23,
  R: 8.314462618,
  F: 96485.33212,
  atm: 101325,
  bar: 100000,
  torr: 133.322,
  ly: 9.46073e15,
  au: 1.495978707e11,
  pc: 3.085677581e16,
});

const SANDBOX_FUNCTIONS: Readonly<Record<string, (...args: unknown[]) => unknown>> = Object.freeze({
  abs: (x: unknown) => Math.abs(Number(x)),
  ceil: (x: unknown) => Math.ceil(Number(x)),
  floor: (x: unknown) => Math.floor(Number(x)),
  round: (x: unknown) => Math.round(Number(x)),
  sqrt: (x: unknown) => Math.sqrt(Number(x)),
  pow: (x: unknown, y: unknown) => Math.pow(Number(x), Number(y)),
  min: (...args: unknown[]) => Math.min(...args.map(Number)),
  max: (...args: unknown[]) => Math.max(...args.map(Number)),
  sin: (x: unknown) => Math.sin(Number(x)),
  cos: (x: unknown) => Math.cos(Number(x)),
  tan: (x: unknown) => Math.tan(Number(x)),
  asin: (x: unknown) => Math.asin(Number(x)),
  acos: (x: unknown) => Math.acos(Number(x)),
  atan: (x: unknown) => Math.atan(Number(x)),
  atan2: (y: unknown, x: unknown) => Math.atan2(Number(y), Number(x)),
  sinh: (x: unknown) => Math.sinh(Number(x)),
  cosh: (x: unknown) => Math.cosh(Number(x)),
  tanh: (x: unknown) => Math.tanh(Number(x)),
  log: (x: unknown) => Math.log(Number(x)),
  log10: (x: unknown) => Math.log10(Number(x)),
  log2: (x: unknown) => Math.log2(Number(x)),
  exp: (x: unknown) => Math.exp(Number(x)),
  sign: (x: unknown) => Math.sign(Number(x)),
});

@Injectable()
export class PluginSandbox {
  private readonly logger = new Logger(PluginSandbox.name);
  private readonly MAX_EXECUTION_TIME_MS = 30000;
  private readonly MAX_OUTPUT_SIZE = 1024 * 1024;

  async execute(
    plugin: RegisteredPlugin,
    inputs: Record<string, unknown>,
    formulas: Array<{ name: string; expression: string }>,
  ): Promise<SandboxResult> {
    const startTime = Date.now();

    const context: SandboxContext = {
      variables: { ...inputs },
      constants: ENGINEERING_CONSTANTS,
      functions: SANDBOX_FUNCTIONS,
    };

    const outputs: Record<string, unknown> = {};
    const maxTime = startTime + this.MAX_EXECUTION_TIME_MS;

    try {
      for (const formula of formulas) {
        if (Date.now() > maxTime) {
          return { outputs, durationMs: Date.now() - startTime, error: 'Execution timeout exceeded' };
        }

        const result = this.evaluateInSandbox(formula.expression, context);
        context.variables[formula.name] = result.value;
        outputs[formula.name] = result.value;
      }

      const outputSize = Buffer.byteLength(JSON.stringify(outputs), 'utf-8');
      if (outputSize > this.MAX_OUTPUT_SIZE) {
        return { outputs: {}, durationMs: Date.now() - startTime, error: `Output size ${outputSize} exceeds maximum ${this.MAX_OUTPUT_SIZE}` };
      }

      return { outputs, durationMs: Date.now() - startTime };
    } catch (error) {
      return { outputs, durationMs: Date.now() - startTime, error: error instanceof Error ? error.message : 'Sandbox execution error' };
    }
  }

  private evaluateInSandbox(
    expression: string,
    context: SandboxContext,
  ): { value: number } {
    const vars: Record<string, unknown> = {
      ...context.constants,
      ...context.functions,
      ...context.variables,
    };

    const compiled = new Function(...Object.keys(vars), `"use strict"; return (${expression});`);
    const value = compiled(...Object.values(vars));

    if (typeof value !== 'number') {
      throw new Error(`Expression did not return a number: got ${typeof value}`);
    }
    if (!isFinite(value)) {
      throw new Error(`Expression returned non-finite value: ${value}`);
    }

    return { value };
  }
}
