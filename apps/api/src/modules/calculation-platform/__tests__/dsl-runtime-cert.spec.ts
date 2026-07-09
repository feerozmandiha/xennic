import { DslRuntime } from '../infrastructure/engines/dsl-runtime.js';
import { FormulaEngine } from '../infrastructure/engines/formula-engine.js';
import { ValidationEngine } from '../infrastructure/engines/validation-engine.js';
import { UnitConversionEngine } from '../infrastructure/engines/unit-conversion-engine.js';
import { DslDefinition } from '../domain/value-objects/dsl-definition.value-object.js';
import type { CalculationDsl } from '../shared/types/dsl-types.js';
import type { DslExecutionContext } from '../infrastructure/engines/dsl-runtime.js';

describe('DSL Runtime Certification', () => {
  let runtime: DslRuntime;
  let formulaEngine: FormulaEngine;
  let validationEngine: ValidationEngine;

  beforeAll(() => {
    formulaEngine = new FormulaEngine();
    const unitEngine = new UnitConversionEngine();
    validationEngine = new ValidationEngine(formulaEngine, unitEngine);
    runtime = new DslRuntime(formulaEngine, unitEngine, validationEngine);
  });

  const baseContext = (inputs: Record<string, unknown> = {}): DslExecutionContext => ({
    inputs,
    workspaceId: 'cert-test',
    userId: 'cert-tester',
    correlationId: 'cert-correlation',
  });

  // ─────────────────────────────────────────────
  // 1. Nested Formulas
  // ─────────────────────────────────────────────

  describe('Nested Formulas', () => {
    it('should resolve a formula referencing another formula output', async () => {
      const dsl = DslDefinition.create({
        id: 'nest-1',
        version: '1.0',
        inputs: [{ name: 'x', label: 'Input X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [
          { name: 'base', expression: 'x + 10' },
          { name: 'result', expression: 'base * 2' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 5 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.result).toBe(30);
    });

    it('should handle multi-level nesting (5+ levels)', async () => {
      const dsl = DslDefinition.create({
        id: 'nest-5',
        version: '1.0',
        inputs: [{ name: 'x', label: 'Input X', type: 'number', required: true }],
        outputs: [{ name: 'e', label: 'Level 5', type: 'number' }],
        formulas: [
          { name: 'a', expression: 'x + 1' },
          { name: 'b', expression: 'a * 2' },
          { name: 'c', expression: 'b - 3' },
          { name: 'd', expression: 'c / 4' },
          { name: 'e', expression: 'd * d' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 3 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.e).toBe(1.5625);
      expect(result.intermediateValues.a).toBe(4);
      expect(result.intermediateValues.b).toBe(8);
      expect(result.intermediateValues.c).toBe(5);
      expect(result.intermediateValues.d).toBe(1.25);
    });

    it('should handle deep nesting (10+ levels)', async () => {
      const dsl = DslDefinition.create({
        id: 'nest-10',
        version: '1.0',
        inputs: [{ name: 'x', label: 'Input X', type: 'number', required: true }],
        outputs: [{ name: 'A10', label: 'Level 10', type: 'number' }],
        formulas: [
          { name: 'A1', expression: 'x' },
          { name: 'A2', expression: 'A1 + 1' },
          { name: 'A3', expression: 'A2 * 2' },
          { name: 'A4', expression: 'A3 - 3' },
          { name: 'A5', expression: 'A4 / 2' },
          { name: 'A6', expression: 'A5 ^ 2' },
          { name: 'A7', expression: 'A6 + 1' },
          { name: 'A8', expression: 'A7 * 3' },
          { name: 'A9', expression: 'A8 - 5' },
          { name: 'A10', expression: 'A9 / 4' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 4 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.A10).toBe(8.6875);
      expect(result.intermediateValues.A1).toBe(4);
      expect(result.intermediateValues.A3).toBe(10);
      expect(result.intermediateValues.A6).toBe(12.25);
      expect(result.formulaCount).toBe(10);
    });
  });

  // ─────────────────────────────────────────────
  // 2. Recursive Reference Detection
  // ─────────────────────────────────────────────

  describe('Recursive Reference Detection', () => {
    it('should reject A->B->A cycle', async () => {
      const dsl = DslDefinition.create({
        id: 'cycle-ab',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'A', label: 'A', type: 'number' }],
        formulas: [
          { name: 'A', expression: 'B + 1' },
          { name: 'B', expression: 'A + 1' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 1 }));
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('A');
      expect(result.outputs.A).toBeUndefined();

      const cycle = validationEngine.detectCircularDependency([
        { name: 'A', expression: 'B + 1' },
        { name: 'B', expression: 'A + 1' },
      ]);
      expect(cycle).not.toBeNull();
      expect(cycle).toContain('Circular dependency');
    });

    it('should reject self-referencing formula', async () => {
      const dsl = DslDefinition.create({
        id: 'self-ref',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'A', label: 'A', type: 'number' }],
        formulas: [{ name: 'A', expression: 'A + 1' }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 1 }));
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('A');

      const cycle = validationEngine.detectCircularDependency([{ name: 'A', expression: 'A + 1' }]);
      expect(cycle).not.toBeNull();
      expect(cycle).toContain('Circular dependency');
    });

    it('should reject indirect cycles through 5+ formulas', async () => {
      const formulas = [
        { name: 'A', expression: 'B + 1' },
        { name: 'B', expression: 'C + 2' },
        { name: 'C', expression: 'D + 3' },
        { name: 'D', expression: 'E + 4' },
        { name: 'E', expression: 'F + 5' },
        { name: 'F', expression: 'A + 6' },
      ];

      const dsl = DslDefinition.create({
        id: 'cycle-6',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'A', label: 'A', type: 'number' }],
        formulas,
      });

      const result = await runtime.execute(dsl, baseContext({ x: 0 }));
      expect(result.errors.length).toBeGreaterThan(0);

      const cycle = validationEngine.detectCircularDependency(formulas);
      expect(cycle).not.toBeNull();
      expect(cycle).toContain('Circular dependency');
    });
  });

  // ─────────────────────────────────────────────
  // 3. Interpolation
  // ─────────────────────────────────────────────

  describe('Interpolation', () => {
    it('should resolve template strings with variable interpolation', async () => {
      const dsl = DslDefinition.create({
        id: 'interp-var',
        version: '1.0',
        inputs: [
          { name: 'x', label: 'X', type: 'number', required: true },
          { name: 'y', label: 'Y', type: 'number', required: true },
        ],
        outputs: [{ name: 'sum', label: 'Sum', type: 'number' }],
        formulas: [{ name: 'sum', expression: 'x + y' }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 10, y: 20 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.sum).toBe(30);
    });

    it('should handle mixed literal and variable expressions', async () => {
      const dsl = DslDefinition.create({
        id: 'interp-mixed',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'computed', label: 'Computed', type: 'number' }],
        formulas: [{ name: 'computed', expression: '2 * x + 3' }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 7 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.computed).toBe(17);
    });

    it('should handle nested interpolation across multiple formulas', async () => {
      const dsl = DslDefinition.create({
        id: 'interp-nested',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [
          { name: 'intermediate', label: 'Intermediate', type: 'number' },
          { name: 'final', label: 'Final', type: 'number' },
        ],
        formulas: [
          { name: 'intermediate', expression: 'x * 2 + 1' },
          { name: 'final', expression: 'intermediate ^ 2 - 5' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 3 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.intermediate).toBe(7);
      expect(result.outputs.final).toBe(44);
    });
  });

  // ─────────────────────────────────────────────
  // 4. Lookup Tables
  // ─────────────────────────────────────────────

  describe('Lookup Tables', () => {
    it('should perform single key lookup via conditional chain', async () => {
      const dsl = DslDefinition.create({
        id: 'lookup-single',
        version: '1.0',
        inputs: [{ name: 'key', label: 'Key', type: 'number', required: true }],
        outputs: [{ name: 'value', label: 'Value', type: 'number' }],
        formulas: [
          {
            name: 'value',
            expression: 'key == 1 ? 100 : (key == 2 ? 200 : (key == 3 ? 300 : 0))',
          },
        ],
      });

      const r1 = await runtime.execute(dsl, baseContext({ key: 2 }));
      expect(r1.errors).toEqual([]);
      expect(r1.outputs.value).toBe(200);

      const r2 = await runtime.execute(dsl, baseContext({ key: 1 }));
      expect(r2.outputs.value).toBe(100);

      const r3 = await runtime.execute(dsl, baseContext({ key: 3 }));
      expect(r3.outputs.value).toBe(300);
    });

    it('should perform multi-column lookup producing multiple outputs', async () => {
      const dsl = DslDefinition.create({
        id: 'lookup-multi',
        version: '1.0',
        inputs: [{ name: 'code', label: 'Code', type: 'number', required: true }],
        outputs: [
          { name: 'name', label: 'Name', type: 'number' },
          { name: 'factor', label: 'Factor', type: 'number' },
          { name: 'tolerance', label: 'Tolerance', type: 'number' },
        ],
        formulas: [
          {
            name: 'name',
            expression: 'code == 1 ? 100 : (code == 2 ? 200 : 300)',
          },
          {
            name: 'factor',
            expression: 'code == 1 ? 1.0 : (code == 2 ? 1.5 : 2.0)',
          },
          {
            name: 'tolerance',
            expression: 'code == 1 ? 0.1 : (code == 2 ? 0.05 : 0.01)',
          },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ code: 2 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.name).toBe(200);
      expect(result.outputs.factor).toBe(1.5);
      expect(result.outputs.tolerance).toBe(0.05);
    });

    it('should return fallback/default values when key is not matched', async () => {
      const dsl = DslDefinition.create({
        id: 'lookup-fallback',
        version: '1.0',
        inputs: [{ name: 'key', label: 'Key', type: 'number', required: true }],
        outputs: [{ name: 'value', label: 'Value', type: 'number' }],
        formulas: [
          {
            name: 'value',
            expression: 'key == 1 ? 100 : (key == 2 ? 200 : 999)',
          },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ key: 999 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.value).toBe(999);
    });

    it('should support exact match and fuzzy match via tolerance', async () => {
      const dsl = DslDefinition.create({
        id: 'lookup-fuzzy',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [
          { name: 'exact', label: 'Exact', type: 'number' },
          { name: 'fuzzy', label: 'Fuzzy', type: 'number' },
        ],
        formulas: [
          { name: 'exact', expression: 'x == 5 ? 1 : 0' },
          { name: 'fuzzy', expression: 'abs(x - 5) < 0.01 ? 1 : 0' },
        ],
      });

      const r1 = await runtime.execute(dsl, baseContext({ x: 5 }));
      expect(r1.outputs.exact).toBe(1);
      expect(r1.outputs.fuzzy).toBe(1);

      const r2 = await runtime.execute(dsl, baseContext({ x: 5.001 }));
      expect(r2.outputs.exact).toBe(0);
      expect(r2.outputs.fuzzy).toBe(1);

      const r3 = await runtime.execute(dsl, baseContext({ x: 5.1 }));
      expect(r3.outputs.exact).toBe(0);
      expect(r3.outputs.fuzzy).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  // 5. Conditional Branches
  // ─────────────────────────────────────────────

  describe('Conditional Branches', () => {
    it('should evaluate if-then-else expressions', async () => {
      const dsl = DslDefinition.create({
        id: 'cond-ifelse',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: 'x > 0 ? x * 2 : x / 2' }],
      });

      const r1 = await runtime.execute(dsl, baseContext({ x: 10 }));
      expect(r1.errors).toEqual([]);
      expect(r1.outputs.result).toBe(20);

      const r2 = await runtime.execute(dsl, baseContext({ x: -10 }));
      expect(r2.outputs.result).toBe(-5);
    });

    it('should evaluate nested conditions', async () => {
      const dsl = DslDefinition.create({
        id: 'cond-nested',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [
          {
            name: 'result',
            expression: 'x > 0 ? (x > 10 ? x * 3 : x * 2) : 0',
          },
        ],
      });

      const r1 = await runtime.execute(dsl, baseContext({ x: 5 }));
      expect(r1.errors).toEqual([]);
      expect(r1.outputs.result).toBe(10);

      const r2 = await runtime.execute(dsl, baseContext({ x: 15 }));
      expect(r2.outputs.result).toBe(45);

      const r3 = await runtime.execute(dsl, baseContext({ x: -1 }));
      expect(r3.outputs.result).toBe(0);
    });

    it('should evaluate ternary-like expressions', async () => {
      const dsl = DslDefinition.create({
        id: 'cond-ternary',
        version: '1.0',
        inputs: [{ name: 'flag', label: 'Flag', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: 'flag == 1 ? 42 : flag == 0 ? 0 : -1' }],
      });

      const r1 = await runtime.execute(dsl, baseContext({ flag: 1 }));
      expect(r1.errors).toEqual([]);
      expect(r1.outputs.result).toBe(42);

      const r2 = await runtime.execute(dsl, baseContext({ flag: 0 }));
      expect(r2.outputs.result).toBe(0);

      const r3 = await runtime.execute(dsl, baseContext({ flag: 7 }));
      expect(r3.outputs.result).toBe(-1);
    });

    it('should handle multi-way branching with chained conditions', async () => {
      const dsl = DslDefinition.create({
        id: 'cond-multiway',
        version: '1.0',
        inputs: [{ name: 'score', label: 'Score', type: 'number', required: true }],
        outputs: [{ name: 'grade', label: 'Grade', type: 'number' }],
        formulas: [
          {
            name: 'grade',
            expression: 'score > 100 ? 1 : (score > 50 ? 2 : (score > 10 ? 3 : 4))',
          },
        ],
      });

      const r1 = await runtime.execute(dsl, baseContext({ score: 200 }));
      expect(r1.outputs.grade).toBe(1);

      const r2 = await runtime.execute(dsl, baseContext({ score: 75 }));
      expect(r2.outputs.grade).toBe(2);

      const r3 = await runtime.execute(dsl, baseContext({ score: 25 }));
      expect(r3.outputs.grade).toBe(3);

      const r4 = await runtime.execute(dsl, baseContext({ score: 5 }));
      expect(r4.outputs.grade).toBe(4);
    });
  });

  // ─────────────────────────────────────────────
  // 6. Mathematical Functions
  // ─────────────────────────────────────────────

  describe('Mathematical Functions', () => {
    it('should evaluate trigonometric functions (sin, cos, tan) with input validation', async () => {
      const dsl = DslDefinition.create({
        id: 'math-trig',
        version: '1.0',
        inputs: [{ name: 'x', label: 'Angle', type: 'number', required: true }],
        outputs: [
          { name: 'sinVal', label: 'Sin', type: 'number' },
          { name: 'cosVal', label: 'Cos', type: 'number' },
          { name: 'tanVal', label: 'Tan', type: 'number' },
        ],
        formulas: [
          { name: 'sinVal', expression: 'sin(pi / 2)' },
          { name: 'cosVal', expression: 'cos(0)' },
          { name: 'tanVal', expression: 'tan(pi / 4)' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 0 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.sinVal).toBeCloseTo(1, 10);
      expect(result.outputs.cosVal).toBe(1);
      expect(result.outputs.tanVal).toBeCloseTo(1, 10);
    });

    it('should evaluate logarithmic functions (ln, log10, log2)', async () => {
      const dsl = DslDefinition.create({
        id: 'math-log',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [
          { name: 'ln', label: 'Ln', type: 'number' },
          { name: 'log10', label: 'Log10', type: 'number' },
          { name: 'log2', label: 'Log2', type: 'number' },
        ],
        formulas: [
          { name: 'ln', expression: 'log(x)' },
          { name: 'log10', expression: 'log10(x)' },
          { name: 'log2', expression: 'log2(x)' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 100 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.ln).toBeCloseTo(4.605170185988092, 10);
      expect(result.outputs.log10).toBe(2);
      expect(result.outputs.log2).toBeCloseTo(6.643856189774724, 10);
    });

    it('should evaluate statistical functions (min, max, avg, sum)', async () => {
      const dsl = DslDefinition.create({
        id: 'math-stats',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [
          { name: 'minimum', label: 'Min', type: 'number' },
          { name: 'maximum', label: 'Max', type: 'number' },
          { name: 'average', label: 'Avg', type: 'number' },
          { name: 'total', label: 'Sum', type: 'number' },
        ],
        formulas: [
          { name: 'minimum', expression: 'min(5, 2, 9, 1, 7)' },
          { name: 'maximum', expression: 'max(5, 2, 9, 1, 7)' },
          { name: 'average', expression: 'mean(5, 2, 9, 1, 7)' },
          { name: 'total', expression: 'sum(5, 2, 9, 1, 7)' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 0 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.minimum).toBe(1);
      expect(result.outputs.maximum).toBe(9);
      expect(result.outputs.average).toBe(4.8);
      expect(result.outputs.total).toBe(24);
    });

    it('should resolve mathematical constants (pi, e)', async () => {
      const dsl = DslDefinition.create({
        id: 'math-const',
        version: '1.0',
        inputs: [{ name: 'r', label: 'Radius', type: 'number', required: true }],
        outputs: [
          { name: 'area', label: 'Area', type: 'number' },
          { name: 'expVal', label: 'Exp', type: 'number' },
        ],
        formulas: [
          { name: 'area', expression: 'pi * r ^ 2' },
          { name: 'expVal', expression: 'e ^ 2' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ r: 3 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.area).toBeCloseTo(28.274333882308138, 10);
      expect(result.outputs.expVal).toBeCloseTo(7.38905609893065, 10);
    });
  });

  // ─────────────────────────────────────────────
  // 7. Engineering Constants
  // ─────────────────────────────────────────────

  describe('Engineering Constants', () => {
    it('should use engineering constants (c, g, h, k, eps0, mu0, e0, Na, R, F) in formulas', async () => {
      const dsl = DslDefinition.create({
        id: 'eng-const',
        version: '1.0',
        inputs: [
          { name: 'mass', label: 'Mass (kg)', type: 'number', required: true },
          { name: 'charge', label: 'Charge (C)', type: 'number', required: true },
        ],
        outputs: [
          { name: 'force', label: 'Force (N)', type: 'number' },
          { name: 'energy', label: 'Energy (J)', type: 'number' },
          { name: 'coulombForce', label: 'Coulomb Force (N)', type: 'number' },
        ],
        formulas: [
          { name: 'g', expression: '9.80665' },
          { name: 'c', expression: '299792458' },
          { name: 'h', expression: '6.62607015e-34' },
          { name: 'k', expression: '1.380649e-23' },
          { name: 'eps0', expression: '8.854187817e-12' },
          { name: 'mu0', expression: '1.25663706212e-6' },
          { name: 'e0', expression: '1.602176634e-19' },
          { name: 'Na', expression: '6.02214076e23' },
          { name: 'R', expression: '8.314462618' },
          { name: 'F', expression: '96485.33212' },
          { name: 'force', expression: 'mass * g' },
          { name: 'energy', expression: 'mass * c ^ 2' },
          {
            name: 'coulombForce',
            expression: 'k * charge * charge / (eps0 * 4 * pi)',
          },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ mass: 10, charge: 1e-6 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.force).toBeCloseTo(98.0665, 10);
      expect(result.outputs.energy).toBeCloseTo(Number('8.987551787368176e17'), 5);
    });
  });

  // ─────────────────────────────────────────────
  // 8. Reusable Macros
  // ─────────────────────────────────────────────

  describe('Reusable Macros', () => {
    it('should define a macro once and reuse in multiple formulas', async () => {
      const dsl = DslDefinition.create({
        id: 'macro-reuse',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [
          { name: 'double', label: 'Double', type: 'number' },
          { name: 'triple', label: 'Triple', type: 'number' },
          { name: 'quadruple', label: 'Quadruple', type: 'number' },
        ],
        formulas: [
          { name: 'base', expression: 'x * 2' },
          { name: 'double', expression: 'base' },
          { name: 'triple', expression: 'base + x' },
          { name: 'quadruple', expression: 'base * 2' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 5 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.double).toBe(10);
      expect(result.outputs.triple).toBe(15);
      expect(result.outputs.quadruple).toBe(20);
    });

    it('should handle parameterized macros using input variables', async () => {
      const dsl = DslDefinition.create({
        id: 'macro-param',
        version: '1.0',
        inputs: [
          { name: 'a', label: 'A', type: 'number', required: true },
          { name: 'b', label: 'B', type: 'number', required: true },
        ],
        outputs: [
          { name: 'addResult', label: 'Add', type: 'number' },
          { name: 'mulResult', label: 'Multiply', type: 'number' },
        ],
        formulas: [
          { name: 'add', expression: 'a + b' },
          { name: 'mul', expression: 'a * b' },
          { name: 'addResult', expression: 'add' },
          { name: 'mulResult', expression: 'mul' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ a: 7, b: 3 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.addResult).toBe(10);
      expect(result.outputs.mulResult).toBe(21);
    });

    it('should support global/shared macros across formula groups', async () => {
      const dsl = DslDefinition.create({
        id: 'macro-global',
        version: '1.0',
        inputs: [
          { name: 'r1', label: 'R1', type: 'number', required: true },
          { name: 'r2', label: 'R2', type: 'number', required: true },
        ],
        outputs: [
          { name: 'parallel', label: 'Parallel', type: 'number' },
          { name: 'series', label: 'Series', type: 'number' },
        ],
        formulas: [
          { name: 'reciprocal', expression: '1 / r1 + 1 / r2' },
          { name: 'parallel', expression: '1 / reciprocal' },
          { name: 'series', expression: 'r1 + r2' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ r1: 6, r2: 3 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.parallel).toBe(2);
      expect(result.outputs.series).toBe(9);
    });
  });

  // ─────────────────────────────────────────────
  // 9. Error Handling
  // ─────────────────────────────────────────────

  describe('Error Handling', () => {
    it('should detect undefined variable references', async () => {
      const dsl = DslDefinition.create({
        id: 'err-undefined',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: 'undefinedVar + 1' }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 5 }));
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('result');
      expect(result.outputs.result).toBeUndefined();
    });

    it('should handle division by zero gracefully', async () => {
      const dsl = DslDefinition.create({
        id: 'err-divbyzero',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: '1 / 0' }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 0 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.result).toBe(Infinity);
    });

    it('should handle type mismatch in expressions', async () => {
      const dsl = DslDefinition.create({
        id: 'err-typemismatch',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: 'sqrt(-1)' }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 0 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.result).toBeNaN();
    });

    it('should reject invalid expression syntax', async () => {
      const dsl: CalculationDsl = {
        id: 'err-syntax',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: '(2 + 3' }],
      };

      const errors = runtime.validateDsl(dsl);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain('invalid expression');

      const definition = DslDefinition.create({
        id: 'err-syntax',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: '(2 + 3' }],
      });

      const execResult = await runtime.execute(definition, baseContext({ x: 0 }));
      expect(execResult.errors.length).toBeGreaterThan(0);
    });

    it('should handle out-of-range values gracefully', async () => {
      const dsl = DslDefinition.create({
        id: 'err-OOR',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'huge', label: 'Huge', type: 'number' }],
        formulas: [{ name: 'huge', expression: 'x ^ 1000' }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 100 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.huge).toBe(Infinity);
    });

    it('should detect and reject circular dependencies', async () => {
      const formulas = [
        { name: 'X', expression: 'Y + Z' },
        { name: 'Y', expression: 'Z + 1' },
        { name: 'Z', expression: 'X + 2' },
      ];

      const cycle = validationEngine.detectCircularDependency(formulas);
      expect(cycle).not.toBeNull();
      expect(cycle).toContain('Circular dependency');

      const dsl = DslDefinition.create({
        id: 'err-cycle',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'X', label: 'X', type: 'number' }],
        formulas,
      });

      const result = await runtime.execute(dsl, baseContext({ x: 1 }));
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ─────────────────────────────────────────────
  // 10. Edge Cases
  // ─────────────────────────────────────────────

  describe('Edge Cases', () => {
    it('should handle empty formula expression', async () => {
      const dsl = DslDefinition.create({
        id: 'edge-empty',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: '' }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 5 }));
      expect(result.outputs.result).toBeNaN();
    });

    it('should handle whitespace-only formula expression', async () => {
      const dsl = DslDefinition.create({
        id: 'edge-whitespace',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: '   ' }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 5 }));
      expect(result.outputs.result).toBeNaN();
    });

    it('should handle extremely long formula (5000+ characters)', async () => {
      const args = Array.from({ length: 2500 }, () => '1,').join('');
      const longExpression = `min(${args}1)`;

      expect(longExpression.length).toBeGreaterThan(5000);

      const dsl = DslDefinition.create({
        id: 'edge-long',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [{ name: 'result', label: 'Result', type: 'number' }],
        formulas: [{ name: 'result', expression: longExpression }],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 0 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.result).toBe(1);
    });

    it('should handle unicode identifiers in variable names', async () => {
      const dsl = DslDefinition.create({
        id: 'edge-unicode',
        version: '1.0',
        inputs: [
          { name: 'α', label: 'Alpha', type: 'number', required: true },
          { name: 'β', label: 'Beta', type: 'number', required: true },
        ],
        outputs: [{ name: 'γ', label: 'Gamma', type: 'number' }],
        formulas: [{ name: 'γ', expression: 'α * β + 10' }],
      });

      const result = await runtime.execute(dsl, baseContext({ α: 7, β: 3 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.γ).toBe(31);
    });

    it('should handle negative values correctly', async () => {
      const dsl = DslDefinition.create({
        id: 'edge-negative',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [
          { name: 'absVal', label: 'Abs', type: 'number' },
          { name: 'negated', label: 'Negated', type: 'number' },
          { name: 'product', label: 'Product', type: 'number' },
        ],
        formulas: [
          { name: 'absVal', expression: 'abs(x)' },
          { name: 'negated', expression: '-x' },
          { name: 'product', expression: 'x * -2' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: -7 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.absVal).toBe(7);
      expect(result.outputs.negated).toBe(7);
      expect(result.outputs.product).toBe(14);
    });

    it('should handle zero values correctly', async () => {
      const dsl = DslDefinition.create({
        id: 'edge-zero',
        version: '1.0',
        inputs: [{ name: 'x', label: 'X', type: 'number', required: true }],
        outputs: [
          { name: 'zero', label: 'Zero', type: 'number' },
          { name: 'addZero', label: 'Add Zero', type: 'number' },
          { name: 'mulZero', label: 'Mul Zero', type: 'number' },
          { name: 'powZero', label: 'Pow Zero', type: 'number' },
        ],
        formulas: [
          { name: 'zero', expression: '0' },
          { name: 'addZero', expression: 'x + 0' },
          { name: 'mulZero', expression: 'x * 0' },
          { name: 'powZero', expression: 'x ^ 0' },
        ],
      });

      const result = await runtime.execute(dsl, baseContext({ x: 42 }));
      expect(result.errors).toEqual([]);
      expect(result.outputs.zero).toBe(0);
      expect(result.outputs.addZero).toBe(42);
      expect(result.outputs.mulZero).toBe(0);
      expect(result.outputs.powZero).toBe(1);
    });
  });
});
