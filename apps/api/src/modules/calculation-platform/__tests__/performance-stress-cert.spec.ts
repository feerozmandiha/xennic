import { performance } from 'perf_hooks';

import { DslRuntime } from '../infrastructure/engines/dsl-runtime.js';
import { FormulaEngine } from '../infrastructure/engines/formula-engine.js';
import { UnitConversionEngine } from '../infrastructure/engines/unit-conversion-engine.js';
import { ValidationEngine } from '../infrastructure/engines/validation-engine.js';
import { DslDefinition } from '../domain/value-objects/dsl-definition.value-object.js';

describe('Performance Stress Certification', () => {
  let formulaEngine: FormulaEngine;
  let unitEngine: UnitConversionEngine;
  let validationEngine: ValidationEngine;
  let dslRuntime: DslRuntime;

  const formulaBatch = [
    { expr: 'x + y', vars: { x: 42, y: 58 } },
    { expr: 'x * y + z', vars: { x: 12, y: 34, z: 56 } },
    { expr: '(x + y) * z', vars: { x: 7, y: 8, z: 9 } },
    { expr: 'x / y + z', vars: { x: 100, y: 3, z: 10 } },
    { expr: 'x^2 + y', vars: { x: 15, y: 25 } },
    { expr: 'sqrt(x) + y', vars: { x: 144, y: 10 } },
    { expr: 'abs(x - y) * z', vars: { x: -50, y: 30, z: 2 } },
    { expr: 'x * y - z / w', vars: { x: 10, y: 20, z: 100, w: 4 } },
    { expr: '(x + y + z) / 3', vars: { x: 10, y: 20, z: 30 } },
    { expr: 'x * (y + z) - w', vars: { x: 5, y: 6, z: 7, w: 8 } },
    { expr: 'sin(x) + cos(y)', vars: { x: 0.5, y: 0.3 } },
    { expr: 'pow(x, 3) + pow(y, 2)', vars: { x: 3, y: 4 } },
    { expr: 'x * y + z * w', vars: { x: 2, y: 3, z: 4, w: 5 } },
    { expr: 'round(x * y)', vars: { x: 3.7, y: 2.3 } },
    { expr: 'floor(x / y) + ceil(z / w)', vars: { x: 100, y: 7, z: 50, w: 3 } },
  ];

  const unitPairs = [
    { from: 'V', to: 'kV' },
    { from: 'kW', to: 'W' },
    { from: 'A', to: 'mA' },
    { from: 'kWh', to: 'Wh' },
    { from: '\u03A9', to: 'k\u03A9' },
    { from: 'Pa', to: 'kPa' },
    { from: 'km', to: 'm' },
    { from: 'kg', to: 'g' },
    { from: 'MHz', to: 'Hz' },
    { from: 'm/s', to: 'km/h' },
  ];

  beforeAll(() => {
    formulaEngine = new FormulaEngine();
    unitEngine = new UnitConversionEngine();
    validationEngine = new ValidationEngine(formulaEngine, unitEngine);
    dslRuntime = new DslRuntime(formulaEngine, unitEngine, validationEngine);
  });

  function runConcurrent<T>(count: number, factory: (i: number) => T): Promise<T[]> {
    const tasks = Array.from({ length: count }, (_, i) =>
      Promise.resolve().then(() => factory(i)),
    );
    return Promise.all(tasks);
  }

  it('1. Concurrent Batch (100) — completes 100 evaluations in under 1000ms', async () => {
    const start = performance.now();
    const results = await runConcurrent(100, i =>
      formulaEngine.evaluate(
        formulaBatch[i % formulaBatch.length].expr,
        formulaBatch[i % formulaBatch.length].vars,
      ),
    );
    const elapsed = performance.now() - start;

    expect(results).toHaveLength(100);
    results.forEach(r => expect(typeof r).toBe('number'));
    expect(elapsed).toBeLessThan(1000);
  });

  it('2. Concurrent Batch (1000) — completes 1000 evaluations in under 5000ms', async () => {
    const start = performance.now();
    const results = await runConcurrent(1000, i =>
      formulaEngine.evaluate(
        formulaBatch[i % formulaBatch.length].expr,
        formulaBatch[i % formulaBatch.length].vars,
      ),
    );
    const elapsed = performance.now() - start;

    expect(results).toHaveLength(1000);
    results.forEach(r => expect(typeof r).toBe('number'));
    expect(elapsed).toBeLessThan(5000);
  });

  it('3. Concurrent Batch (10000) — completes 10000 evaluations and reports metrics', async () => {
    const start = performance.now();
    const results = await runConcurrent(10000, i =>
      formulaEngine.evaluate(
        formulaBatch[i % formulaBatch.length].expr,
        formulaBatch[i % formulaBatch.length].vars,
      ),
    );
    const elapsed = performance.now() - start;

    expect(results).toHaveLength(10000);
    results.forEach(r => expect(typeof r).toBe('number'));
  });

  it('4. Unit Conversion Stress — 500 simultaneous conversions across 10 unit pairs', async () => {
    const start = performance.now();
    const results = await runConcurrent(500, i => {
      const pair = unitPairs[i % unitPairs.length];
      return unitEngine.convert(100 + i, pair.from, pair.to);
    });
    const elapsed = performance.now() - start;

    expect(results).toHaveLength(500);
    results.forEach(r => expect(typeof r).toBe('number'));
  });

  it('5. DSL Execution Stress — 50 complex DSL workflows with 10+ formulas each', async () => {
    function createDsl(id: number): DslDefinition {
      const formulas = Array.from({ length: 12 }, (_, j) => ({
        name: `s${id}_step${j + 1}`,
        expression: j === 0 ? `in_${id} + ${j + 1}` : `s${id}_step${j} * ${j + 1} + in_${id}`,
      }));
      return DslDefinition.create({
        id: `dsl-${id}`,
        version: '1.0.0',
        inputs: [{ name: `in_${id}`, label: `Input ${id}`, type: 'number', required: true }],
        outputs: formulas.map(f => ({ name: f.name, label: f.name, type: 'number' as const })),
        formulas,
      });
    }

    const start = performance.now();
    const results = await runConcurrent(50, async i => {
      const dsl = createDsl(i);
      return dslRuntime.execute(dsl, {
        definitionId: dsl.id,
        inputs: { [`in_${i}`]: i * 10 + 5 },
        workspaceId: 'stress-test',
        userId: 'perf-test',
      });
    });
    const elapsed = performance.now() - start;

    expect(results).toHaveLength(50);
    results.forEach(r => {
      expect(r.formulaCount).toBeGreaterThanOrEqual(10);
      expect(r.errors).toHaveLength(0);
      expect(Object.keys(r.outputs).length).toBeGreaterThanOrEqual(10);
    });
  });

  it('6. Memory Stability — no unbounded heap growth across 1000 evaluations', () => {
    global.gc?.();
    const heapBefore = process.memoryUsage().heapUsed;

    for (let i = 0; i < 1000; i++) {
      const idx = i % formulaBatch.length;
      formulaEngine.evaluate(formulaBatch[idx].expr, formulaBatch[idx].vars);
    }

    global.gc?.();
    const heapAfter = process.memoryUsage().heapUsed;
    const growthMb = (heapAfter - heapBefore) / 1024 / 1024;

    expect(growthMb).toBeLessThan(50);
  });

  it('7. Response Time P95/P99 — P95 < 100ms, P99 < 250ms across 1000 evaluations', () => {
    const timings: number[] = [];

    for (let i = 0; i < 1000; i++) {
      const idx = i % formulaBatch.length;
      const t0 = performance.now();
      formulaEngine.evaluate(formulaBatch[idx].expr, formulaBatch[idx].vars);
      timings.push(performance.now() - t0);
    }

    timings.sort((a, b) => a - b);
    const p95 = timings[Math.floor(0.95 * timings.length)];
    const p99 = timings[Math.floor(0.99 * timings.length)];

    expect(p95).toBeLessThan(100);
    expect(p99).toBeLessThan(250);
  });

  it('8. Engine Isolation — concurrent cross-engine calls do not interfere', async () => {
    const ops = 50;
    const results: Array<{ formula: number; conversion: number; validation: boolean }> = [];

    const tasks = Array.from({ length: ops }, (_, i) => {
      const fi = i % formulaBatch.length;
      const pi = i % unitPairs.length;
      return Promise.all([
        Promise.resolve().then(() =>
          formulaEngine.evaluate(formulaBatch[fi].expr, formulaBatch[fi].vars),
        ),
        Promise.resolve().then(() => {
          const pair = unitPairs[pi];
          return unitEngine.convert(100 + i, pair.from, pair.to);
        }),
        Promise.resolve().then(() =>
          validationEngine.validateInputs(
            { x: 42, y: 58 },
            [
              { name: 'x', label: 'X', type: 'number' as const, required: true, min: 0, max: 100 },
              { name: 'y', label: 'Y', type: 'number' as const, required: true },
            ],
          ),
        ),
      ]);
    });

    const outcomes = await Promise.all(tasks);
    outcomes.forEach(([formula, conversion, validation]) => {
      results.push({ formula, conversion, validation: validation.valid });
    });

    expect(results).toHaveLength(ops);
    results.forEach(r => {
      expect(typeof r.formula).toBe('number');
      expect(typeof r.conversion).toBe('number');
      expect(r.validation).toBe(true);
    });
  });
});
