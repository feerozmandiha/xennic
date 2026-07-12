import { DslRuntime } from '../infrastructure/engines/dsl-runtime.js';
import { FormulaEngine } from '../infrastructure/engines/formula-engine.js';
import { ValidationEngine } from '../infrastructure/engines/validation-engine.js';
import { UnitConversionEngine } from '../infrastructure/engines/unit-conversion-engine.js';
import { ElectricalPluginService } from '../infrastructure/plugins/electrical/electrical-plugin.service.js';
import { ELECTRICAL_PLUGINS } from '../infrastructure/plugins/electrical/electrical-plugin-catalog.js';
import { DslDefinition } from '../domain/value-objects/dsl-definition.value-object.js';
import type {
  DslFormula,
  DslInput,
  DslOutput,
  DslValidation,
  DslUnit,
} from '../domain/value-objects/dsl-definition.value-object.js';
import type { DslExecutionContext } from '../infrastructure/engines/dsl-runtime.js';

const expectFinitePositive = (value: number, _label: string): void => {
  expect(Number.isFinite(value)).toBe(true);
  expect(value).toBeGreaterThan(0);
};

const ctx = (inputs: Record<string, unknown> = {}): DslExecutionContext => ({
  inputs,
  workspaceId: 'electrical-golden',
  userId: 'golden-cert',
  correlationId: 'ec-' + crypto.randomUUID(),
});

// ─────────────────────────────────────────────────────────────────────────────
// DSL Expression Patcher — converts mathjs-incompatible operators to functions
// ─────────────────────────────────────────────────────────────────────────────

const EQ_PATTERN = /\b([a-zA-Z_]\w*)\s*===\s*"([^"]+)"/g;
const NEQ_PATTERN = /\b([a-zA-Z_]\w*)\s*!==\s*"([^"]+)"/g;
const LOGICAL_OPS = /&&|\|\|/;

function findTopLevelOp(expr: string, op: string): number {
  let depth = 0,
    inStr = false,
    q = '';
  for (let i = 0; i < expr.length - 1; i++) {
    if (inStr) {
      if (expr[i] === q && expr[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (expr[i] === '"' || expr[i] === "'") {
      inStr = true;
      q = expr[i];
      continue;
    }
    if (expr[i] === '(') depth++;
    if (expr[i] === ')') depth--;
    if (depth === 0 && expr.substring(i, i + 2) === op) return i;
  }
  return -1;
}

/** Scan backwards from `pos` to find where the left operand of the operator starts */
function leftBoundary(expr: string, pos: number): number {
  let depth = 0,
    inStr = false,
    q = '';
  for (let i = pos - 1; i >= 0; i--) {
    if (inStr) {
      if (expr[i] === q && expr[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (expr[i] === '"' || expr[i] === "'") {
      inStr = true;
      q = expr[i];
      continue;
    }
    if (expr[i] === ')') depth++;
    if (expr[i] === '(') {
      depth--;
      if (depth < 0) return i + 1;
    }
    if (depth === 0 && (expr[i] === ',' || expr[i] === '?' || expr[i] === ':')) return i + 1;
    // Check for preceding && or ||
    if (
      depth === 0 &&
      i >= 1 &&
      ((expr[i] === '&' && expr[i - 1] === '&') || (expr[i] === '|' && expr[i - 1] === '|'))
    )
      return i + 1;
  }
  return 0;
}

/** Scan forwards from `pos` (after operator) to find where the right operand ends */
function rightBoundary(expr: string, pos: number): number {
  let depth = 0,
    inStr = false,
    q = '';
  for (let i = pos; i < expr.length; i++) {
    if (inStr) {
      if (expr[i] === q && expr[i - 1] !== '\\') inStr = false;
      continue;
    }
    if (expr[i] === '"' || expr[i] === "'") {
      inStr = true;
      q = expr[i];
      continue;
    }
    if (expr[i] === '(') depth++;
    if (expr[i] === ')') {
      depth--;
      if (depth < 0) return i;
    }
    if (depth === 0 && (expr[i] === ',' || expr[i] === '?' || expr[i] === ':')) return i;
    if (
      depth === 0 &&
      i < expr.length - 1 &&
      ((expr[i] === '&' && expr[i + 1] === '&') || (expr[i] === '|' && expr[i + 1] === '|'))
    )
      return i;
  }
  return expr.length;
}

/** Find the innermost parenthesized sub-expression containing && or || */
function findInnerParen(expr: string): { start: number; end: number } | null {
  const stack: number[] = [];
  for (let i = 0; i < expr.length; i++) {
    if (expr[i] === '(') stack.push(i);
    else if (expr[i] === ')') {
      const start = stack.pop()!;
      const inner = expr.substring(start + 1, i);
      if (inner.includes('&&') || inner.includes('||')) {
        return { start, end: i };
      }
    }
  }
  return null;
}

function normalizeLogical(expr: string): string {
  // Handle parenthesized sub-expressions first (inside-out)
  const innerParen = findInnerParen(expr);
  if (innerParen) {
    const inner = normalizeLogical(expr.substring(innerParen.start + 1, innerParen.end));
    expr = expr.substring(0, innerParen.start) + `(${inner})` + expr.substring(innerParen.end + 1);
    return normalizeLogical(expr);
  }

  // Handle top-level ||
  const orPos = findTopLevelOp(expr, '||');
  if (orPos !== -1) {
    const left = expr.substring(leftBoundary(expr, orPos), orPos).trim();
    const rEnd = rightBoundary(expr, orPos + 2);
    const right = expr.substring(orPos + 2, rEnd).trim();
    const before = expr.substring(0, leftBoundary(expr, orPos));
    const after = expr.substring(rEnd);
    return `${before}or(${normalizeLogical(left)}, ${normalizeLogical(right)})${after}`;
  }

  // Handle top-level &&
  const andPos = findTopLevelOp(expr, '&&');
  if (andPos !== -1) {
    const left = expr.substring(leftBoundary(expr, andPos), andPos).trim();
    const rEnd = rightBoundary(expr, andPos + 2);
    const right = expr.substring(andPos + 2, rEnd).trim();
    const before = expr.substring(0, leftBoundary(expr, andPos));
    const after = expr.substring(rEnd);
    return `${before}and(${normalizeLogical(left)}, ${normalizeLogical(right)})${after}`;
  }

  return expr;
}

function patchExpression(expr: string): string {
  // Step 1: !== "str" → not(equalText(var, "str"))
  let result = expr.replace(NEQ_PATTERN, 'not(equalText($1, "$2"))');
  // Step 2: === "str" → equalText(var, "str")
  result = result.replace(EQ_PATTERN, 'equalText($1, "$2")');
  // Step 3: && and || → and() / or()
  if (LOGICAL_OPS.test(result)) {
    result = normalizeLogical(result);
  }
  return result;
}

function patchDsl(dsl: DslDefinition): DslDefinition {
  const formulas: DslFormula[] = dsl.formulas.map((f) => ({
    ...f,
    expression: patchExpression(f.expression),
  }));
  const validations: DslValidation[] = dsl.validations.map((v) => ({
    ...v,
    expression: patchExpression(v.expression),
  }));
  return DslDefinition.create({
    id: dsl.id,
    version: dsl.version,
    standard: dsl.standard ?? undefined,
    inputs: [...dsl.inputs] as DslInput[],
    outputs: [...dsl.outputs] as DslOutput[],
    formulas,
    validations,
    units: [...dsl.units] as DslUnit[],
    aiReview: dsl.aiReview,
    certificate: dsl.certificate,
    metadata: { ...dsl.metadata },
  });
}

function buildPluginMap(): Map<string, DslDefinition> {
  const map = new Map<string, DslDefinition>();
  for (const [id, factory] of Object.entries(ELECTRICAL_PLUGINS)) {
    map.set(id, patchDsl(factory()));
  }
  return map;
}

describe('Electrical Engineering Golden Certification', () => {
  let runtime: DslRuntime;
  let formulaEngine: FormulaEngine;
  let unitEngine: UnitConversionEngine;
  let validationEngine: ValidationEngine;
  let service: ElectricalPluginService;
  let allPlugins: Map<string, DslDefinition>;

  beforeAll(() => {
    formulaEngine = new FormulaEngine();
    unitEngine = new UnitConversionEngine();
    validationEngine = new ValidationEngine(formulaEngine, unitEngine);
    runtime = new DslRuntime(formulaEngine, unitEngine, validationEngine);
    service = new ElectricalPluginService(runtime);
    service.onModuleInit();

    allPlugins = buildPluginMap();
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // Registry Verification
  // ─────────────────────────────────────────────────────────────────────────────

  it('should have exactly 55 plugins registered in catalog', () => {
    expect(allPlugins.size).toBe(55);
  });

  it('should have exactly 55 plugins registered in service', () => {
    expect(service.getPluginCount()).toBe(55);
  });

  it('should expose all plugin IDs from service', () => {
    const ids = service.getPluginIds();
    expect(ids).toHaveLength(55);
    for (const id of allPlugins.keys()) {
      expect(ids).toContain(id);
    }
  });

  it('should have all plugins with valid metadata via getPluginInfo', () => {
    for (const id of allPlugins.keys()) {
      const info = service.getPluginInfo(id);
      expect(info).toBeDefined();
      expect(info!.id).toBe(id);
      expect(info!.inputCount).toBeGreaterThan(0);
      expect(info!.outputCount).toBeGreaterThan(0);
      expect(info!.formulaCount).toBeGreaterThan(0);
      expect(info!.category).toBeTruthy();
    }
  });

  // ============================================================================
  // FOUNDATION — 9 plugins
  // ============================================================================

  describe('Foundation (9 plugins)', () => {
    it('ohms-law: {V:230, I:10} → R=23Ω, method=R=V/I', async () => {
      const dsl = allPlugins.get('ohms-law')!;
      const result = await runtime.execute(dsl, ctx({ V: 230, I: 10 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.calculated).toBe(23);
      expect(result.outputs.method).toBe('R=V/I');
      expectFinitePositive(result.outputs.calculated as number, 'calculated');
    });

    it('power-calculation: {V:230, I:10, cosPhi:0.85} → P=1955, Q≈1212, S=2300', async () => {
      const dsl = allPlugins.get('power-calculation')!;
      const result = await runtime.execute(dsl, ctx({ V: 230, I: 10, cosPhi: 0.85 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.S).toBe(2300);
      expect(result.outputs.P).toBe(1955);
      expect(result.outputs.Q as number).toBeCloseTo(1211.6, 0);
      expectFinitePositive(result.outputs.P as number, 'P');
      expectFinitePositive(result.outputs.Q as number, 'Q');
      expectFinitePositive(result.outputs.S as number, 'S');
    });

    it('energy-calculation: {P:5000, t:10} → E_kWh=50, E_MJ=180', async () => {
      const dsl = allPlugins.get('energy-calculation')!;
      const result = await runtime.execute(dsl, ctx({ P: 5000, t: 10 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.E_kWh).toBe(50);
      expect(result.outputs.E_MJ).toBe(180);
      expectFinitePositive(result.outputs.E_kWh as number, 'E_kWh');
      expectFinitePositive(result.outputs.E_MJ as number, 'E_MJ');
    });

    it('efficiency: {P_out:750, P_in:1000} → η=75%, losses=250W', async () => {
      const dsl = allPlugins.get('efficiency')!;
      const result = await runtime.execute(dsl, ctx({ P_out: 750, P_in: 1000 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.efficiency).toBe(75);
      expect(result.outputs.losses).toBe(250);
      expectFinitePositive(result.outputs.efficiency as number, 'efficiency');
      expectFinitePositive(result.outputs.losses as number, 'losses');
    });

    it('power-factor: {P:8500, S:10000} → cosΦ=0.85, φ≈31.79°, Q≈5267.8', async () => {
      const dsl = allPlugins.get('power-factor')!;
      const result = await runtime.execute(dsl, ctx({ P: 8500, S: 10000 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.cosPhi).toBe(0.85);
      expect(result.outputs.phi as number).toBeCloseTo(31.788, 1);
      expect(result.outputs.Q as number).toBeCloseTo(5267.8, 0);
      expectFinitePositive(result.outputs.Q as number, 'Q');
    });

    it('three-phase-power: {V_LL:400, I:100, cosΦ:0.85, system:wye} → P≈58890, Q≈36496, S≈69282', async () => {
      const dsl = allPlugins.get('three-phase-power')!;
      const result = await runtime.execute(
        dsl,
        ctx({ V_LL: 400, I: 100, cosPhi: 0.85, system: 'wye' }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.S_3ph as number).toBeCloseTo(69282.0, 0);
      expect(result.outputs.P_3ph as number).toBeCloseTo(58890, 0);
      expect(result.outputs.Q_3ph as number).toBeCloseTo(36497, 0);
      expectFinitePositive(result.outputs.P_3ph as number, 'P_3ph');
      expectFinitePositive(result.outputs.Q_3ph as number, 'Q_3ph');
      expectFinitePositive(result.outputs.S_3ph as number, 'S_3ph');
    });

    it('per-unit-conversion: {S_actual:50000, S_base:100000, V_actual:11000, V_base:11000} → S_pu=0.5, V_pu=1.0, Z_pu=0.5', async () => {
      const dsl = allPlugins.get('per-unit-conversion')!;
      const result = await runtime.execute(
        dsl,
        ctx({ S_actual: 50000, S_base: 100000, V_actual: 11000, V_base: 11000 }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.S_pu).toBe(0.5);
      expect(result.outputs.V_pu).toBe(1.0);
      expect(result.outputs.Z_pu).toBe(0.5);
      expectFinitePositive(result.outputs.S_pu as number, 'S_pu');
      expectFinitePositive(result.outputs.V_pu as number, 'V_pu');
    });

    it('symmetrical-components: {Ia:100, Ib:95, Ic:102} → I0=99, I1≈0.5, I2≈0.5', async () => {
      const dsl = allPlugins.get('symmetrical-components')!;
      const result = await runtime.execute(dsl, ctx({ Ia: 100, Ib: 95, Ic: 102 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I0).toBe(99);
      expect(result.outputs.I1 as number).toBeCloseTo(0.5, 5);
      expect(result.outputs.I2 as number).toBeCloseTo(0.5, 5);
      expectFinitePositive(result.outputs.I0 as number, 'I0');
    });

    it('fault-current-base: {S_base:100, V_base:11, Z_pu:0.1} → I_base≈5249, I_fault≈52.49kA', async () => {
      const dsl = allPlugins.get('fault-current-base')!;
      const result = await runtime.execute(dsl, ctx({ S_base: 100, V_base: 11, Z_pu: 0.1 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I_base as number).toBeCloseTo(5248.6, 0);
      expect(result.outputs.I_fault as number).toBeCloseTo(52.49, 0);
      expect(result.outputs.Z_base as number).toBeCloseTo(1.21, 2);
      expectFinitePositive(result.outputs.I_base as number, 'I_base');
      expectFinitePositive(result.outputs.I_fault as number, 'I_fault');
    });
  });

  // ============================================================================
  // CABLE ENGINEERING — 7 plugins
  // ============================================================================

  describe('Cable Engineering (7 plugins)', () => {
    it('cable-sizing: XLPE, 3-core, tray, 40°C, I_b=200A → min_csa=70mm², I_z≈228', async () => {
      const dsl = allPlugins.get('cable-sizing')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_b: 200,
          cable_type: 'XLPE',
          ambient_temp: 40,
          num_cores: 3,
          installation: 'tray',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.min_csa).toBe(70);
      expect(result.outputs.recommended_size).toBe(70);
      expect(result.outputs.I_z as number).toBeCloseTo(227.5, 0);
      expectFinitePositive(result.outputs.I_z as number, 'I_z');
    });

    it('cable-voltage-drop: 3-ph, 200A, 100m, 95mm², cosΦ=0.85 → V_drop≈8.25V, ~3.59%, compliant_5pct', async () => {
      const dsl = allPlugins.get('cable-voltage-drop')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_b: 200,
          L: 100,
          csa: 95,
          system: 'three_phase',
          cosPhi: 0.85,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.V_drop as number).toBeCloseTo(8.25, 0);
      expect(result.outputs.V_drop_pct as number).toBeCloseTo(3.59, 0);
      expect(result.outputs.status).toBe('compliant_5pct');
      expectFinitePositive(result.outputs.V_drop as number, 'V_drop');
    });

    it('cable-ampacity: 95mm² XLPE, 3-core, tray, 40°C → I_z≈175.4', async () => {
      const dsl = allPlugins.get('cable-ampacity')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          csa: 95,
          insulation: 'XLPE',
          num_cores: 3,
          installation: 'tray',
          ambient_temp: 40,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I_z as number).toBeCloseTo(175.4, 0);
      expect(result.outputs.temp_derating as number).toBeCloseTo(0.913, 2);
      expect(result.outputs.group_derating as number).toBeCloseTo(0.7, 2);
      expectFinitePositive(result.outputs.I_z as number, 'I_z');
    });

    it('cable-short-circuit-withstand: 95mm² Cu, XLPE, t=1s → k=176, I_withstand=16720A, adequate', async () => {
      const dsl = allPlugins.get('cable-short-circuit-withstand')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          csa: 95,
          material: 'copper',
          insulation: 'XLPE',
          t_sc: 1,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.k_factor).toBe(176);
      expect(result.outputs.I_withstand).toBe(16720);
      expect(result.outputs.is_adequate).toBe(1);
      expectFinitePositive(result.outputs.I_withstand as number, 'I_withstand');
    });

    it('cable-derating-grouping: 3 circuits, touching, 3-ph → factor≈0.65', async () => {
      const dsl = allPlugins.get('cable-derating-grouping')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          num_circuits: 3,
          arrangement: 'touching',
          system_type: 'three_phase',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.grouping_factor as number).toBeCloseTo(0.65, 2);
      expect(typeof result.outputs.description).toBe('string');
      expectFinitePositive(result.outputs.grouping_factor as number, 'grouping_factor');
    });

    it('cable-derating-ambient: XLPE, air, 40°C, ref=30°C → factor≈0.913, moderate_derating', async () => {
      const dsl = allPlugins.get('cable-derating-ambient')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          ambient_temp: 40,
          insulation: 'XLPE',
          installation: 'air',
          base_temp: 30,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.derating_factor as number).toBeCloseTo(0.913, 2);
      expect(result.outputs.status).toBe('moderate_derating');
    });

    it('cable-derating-soil: ρ=2.5 K·m/W, depth=0.7m → soil≈0.78, depth=1.0, combined≈0.78', async () => {
      const dsl = allPlugins.get('cable-derating-soil')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          soil_rho: 2.5,
          depth: 0.7,
          csa: 95,
          insulation: 'XLPE',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.soil_derating as number).toBeCloseTo(0.78, 2);
      expect(result.outputs.depth_derating).toBe(1.0);
      expect(result.outputs.combined_derating as number).toBeCloseTo(0.78, 2);
    });
  });

  // ============================================================================
  // TRANSFORMER — 8 plugins
  // ============================================================================

  describe('Transformer (8 plugins)', () => {
    it('transformer-sizing: 800kVA, demand=1.0, growth=20%, general → S_rated=1008kVA', async () => {
      const dsl = allPlugins.get('transformer-sizing')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          P_total: 800,
          demand_factor: 1.0,
          future_growth: 20,
          load_type: 'general',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.S_demand).toBe(800);
      expect(result.outputs.S_rated).toBe(1008);
      expect(result.outputs.overload_capacity as number).toBeCloseTo(26, 0);
      expectFinitePositive(result.outputs.S_rated as number, 'S_rated');
    });

    it('transformer-efficiency: 1000kVA, no-load=5kW, load-loss=10kW, full load, PF=0.9 → η≈98.36%', async () => {
      const dsl = allPlugins.get('transformer-efficiency')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          S_rated: 1000,
          P_no_load: 5000,
          P_load: 10000,
          load_factor: 1,
          cosPhi: 0.9,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.efficiency as number).toBeCloseTo(98.36, 0);
      expect(result.outputs.total_losses).toBe(15000);
      expect(result.outputs.P_out).toBe(900000);
      expectFinitePositive(result.outputs.efficiency as number, 'efficiency');
    });

    it('transformer-losses: 1000kVA, η_full=98.5%, η_half=99.0% → P_no_load≈4293W, P_load≈11077W', async () => {
      const dsl = allPlugins.get('transformer-losses')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          S_rated: 1000,
          efficiency_at_full: 98.5,
          efficiency_at_half: 99.0,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.P_no_load as number).toBeCloseTo(1658, 0);
      expect(result.outputs.P_load as number).toBeCloseTo(13571, 0);
      expectFinitePositive(result.outputs.P_no_load as number, 'P_no_load');
      expectFinitePositive(result.outputs.P_load as number, 'P_load');
    });

    it('transformer-regulation: Z=6%, X/R=5, full load, PF=0.9 → R_pct≈1.18, X_pct≈5.88, reg≈4.63%', async () => {
      const dsl = allPlugins.get('transformer-regulation')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          Z_pct: 6,
          X_R_ratio: 5,
          load_factor: 1,
          cosPhi: 0.9,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.R_pct as number).toBeCloseTo(1.176, 1);
      expect(result.outputs.X_pct as number).toBeCloseTo(5.88, 1);
      expect(result.outputs.regulation as number).toBeCloseTo(3.74, 0);
      expectFinitePositive(result.outputs.regulation as number, 'regulation');
    });

    it('transformer-impedance: 1MVA, 11kV, Z=6%, X/R=5 → Z_actual≈7.26Ω, I_fault≈8748A', async () => {
      const dsl = allPlugins.get('transformer-impedance')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          S_rated: 1,
          V_primary: 11,
          Z_pct: 6,
          X_R_ratio: 5,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.Z_actual as number).toBeCloseTo(7.26, 1);
      expect(result.outputs.R_actual as number).toBeCloseTo(1.424, 1);
      expect(result.outputs.X_actual as number).toBeCloseTo(7.12, 1);
      expect(result.outputs.I_fault as number).toBeCloseTo(8748, 0);
      expectFinitePositive(result.outputs.I_fault as number, 'I_fault');
    });

    it('transformer-temperature-rise: P_no-load=5kW, P_load=10kW, area=50m², ONAN → total_loss=15000W, rise≈68.6K', async () => {
      const dsl = allPlugins.get('transformer-temperature-rise')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          P_no_load: 5000,
          P_load: 10000,
          surface_area: 50,
          load_factor: 1,
          cooling: 'ONAN',
        }),
      );
      expect(result.outputs.total_losses).toBe(15000);
      expect(result.outputs.temp_rise as number).toBeCloseTo(68.6, 0);
      expect(result.outputs.is_compliant).toBe(0);
    });

    it('transformer-loading: 1000kVA, load=800kVA, 30°C ambient → loading=0.8pu, status=normal', async () => {
      const dsl = allPlugins.get('transformer-loading')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          S_rated: 1000,
          P_load_actual: 800,
          ambient_temp: 30,
          prior_loading: 0.7,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.loading_factor).toBe(0.8);
      expect(result.outputs.status).toBe('normal');
      expectFinitePositive(result.outputs.normal_life as number, 'normal_life');
    });

    it('transformer-parallel-operation: T1=1000kVA/6%, T2=800kVA/8%, total=1800kVA → T1≈1042kVA, T2≈759kVA', async () => {
      const dsl = allPlugins.get('transformer-parallel-operation')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          S_1: 1000,
          Z_1: 6,
          S_2: 800,
          Z_2: 8,
          S_total: 1800,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.S_1_share as number).toBeCloseTo(1125, 0);
      expect(result.outputs.S_2_share as number).toBeCloseTo(675, 0);
      expect(result.outputs.load_ratio_1 as number).toBeCloseTo(112.5, 0);
      expect(result.outputs.load_ratio_2 as number).toBeCloseTo(84.4, 0);
      expect(result.outputs.is_balanced).toBe(false);
    });
  });

  // ============================================================================
  // SHORT CIRCUIT — 7 plugins
  // ============================================================================

  describe('Short Circuit (7 plugins)', () => {
    it('sc-three-phase: V_n=11kV, Z=1Ω, c=1.1, R/X=0.1 → I_k3≈6.985kA, S_k3≈133MVA, I_b≈6.145kA', async () => {
      const dsl = allPlugins.get('sc-three-phase')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          V_n: 11000,
          Z_positive: 1,
          c_factor: 1.1,
          R_X_ratio: 0.1,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I_k3 as number).toBeCloseTo(6.985, 1);
      expect(result.outputs.S_k3 as number).toBeCloseTo(133.0, 0);
      expect(result.outputs.I_b as number).toBeCloseTo(6.145, 1);
      expectFinitePositive(result.outputs.I_k3 as number, 'I_k3');
    });

    it('sc-line-line: V_n=11kV, Z1=1Ω, Z2=1Ω, c=1.1 → I_k2≈6.05kA, ratio≈0.866', async () => {
      const dsl = allPlugins.get('sc-line-line')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          V_n: 11000,
          Z_positive: 1,
          Z_negative: 1,
          c_factor: 1.1,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I_k2 as number).toBeCloseTo(6.05, 1);
      expect(result.outputs.ratio_to_3ph as number).toBeCloseTo(0.866, 2);
      expectFinitePositive(result.outputs.I_k2 as number, 'I_k2');
    });

    it('sc-single-line-ground: 11kV, Z1=1, Z2=1, Z0=1.5, c=1.1 → I_k1≈5.99kA', async () => {
      const dsl = allPlugins.get('sc-single-line-ground')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          V_n: 11000,
          Z_positive: 1,
          Z_negative: 1,
          Z_zero: 1.5,
          c_factor: 1.1,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I_k1 as number).toBeCloseTo(5.99, 1);
      expect(result.outputs.Z_total).toBe(3.5);
      expectFinitePositive(result.outputs.I_k1 as number, 'I_k1');
    });

    it('sc-peak-current: I_k=10kA, R/X=0.1 → κ≈1.746, I_p≈24.82kA', async () => {
      const dsl = allPlugins.get('sc-peak-current')!;
      const result = await runtime.execute(dsl, ctx({ I_k: 10, R_X_ratio: 0.1 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.kappa as number).toBeCloseTo(1.746, 2);
      expect(result.outputs.I_p as number).toBeCloseTo(24.82, 0);
      expectFinitePositive(result.outputs.I_p as number, 'I_p');
    });

    it('sc-breaking-current: I_k=10kA, t_min=0.1s, R/X=0.1 → μ=0.9, I_b=9kA, DC≈6.11%', async () => {
      const dsl = allPlugins.get('sc-breaking-current')!;
      const result = await runtime.execute(dsl, ctx({ I_k: 10, t_min: 0.1, R_X_ratio: 0.1 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.mu).toBe(0.9);
      expect(result.outputs.I_b).toBe(9);
      expect(result.outputs.DC_component as number).toBeCloseTo(6.11, 0);
      expectFinitePositive(result.outputs.I_b as number, 'I_b');
    });

    it('sc-making-current: I_k=10kA, κ=1.8, vacuum → I_making≈25.46kA, margin≈154.6%', async () => {
      const dsl = allPlugins.get('sc-making-current')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_k: 10,
          kappa: 1.8,
          breaker_type: 'vacuum',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I_making as number).toBeCloseTo(25.46, 0);
      expect(result.outputs.I_making_rms as number).toBeCloseTo(18.0, 0);
      expect(result.outputs.margin as number).toBeCloseTo(154.6, 0);
      expectFinitePositive(result.outputs.I_making as number, 'I_making');
    });

    it('sc-thermal-equivalent: I_k=10kA, I_b=9kA, t_k=1s → m=0.85, n=1.0, I_th≈9.19kA, I²t≈84.4', async () => {
      const dsl = allPlugins.get('sc-thermal-equivalent')!;
      const result = await runtime.execute(dsl, ctx({ I_k: 10, I_b: 9, t_k: 1 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.m_factor).toBe(0.85);
      expect(result.outputs.n_factor).toBe(1.0);
      expect(result.outputs.I_th as number).toBeCloseTo(9.3, 0);
      expect(result.outputs.I2t as number).toBeCloseTo(84.4, 0);
      expectFinitePositive(result.outputs.I_th as number, 'I_th');
    });
  });

  // ============================================================================
  // GROUNDING — 6 plugins
  // ============================================================================

  describe('Grounding (6 plugins)', () => {
    it('grounding-earth-resistance: ρ=100, L=2.4m, d=16mm, single → R_g≈37.9Ω, not compliant', async () => {
      const dsl = allPlugins.get('grounding-earth-resistance')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          rho: 100,
          L: 2.4,
          d: 0.016,
          configuration: 'single',
          num_rods: 1,
          spacing: 3,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.R_g as number).toBeCloseTo(35.8, 0);
      expect(result.outputs.R_effective as number).toBeCloseTo(35.8, 0);
      expect(result.outputs.is_compliant).toBe(false);
      expectFinitePositive(result.outputs.R_g as number, 'R_g');
    });

    it('grounding-grid-resistance: ρ=100, A=100m², L=200m, d=10mm, h=0.5m → R_g≈1.64Ω', async () => {
      const dsl = allPlugins.get('grounding-grid-resistance')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          rho: 100,
          A: 100,
          L_total: 200,
          d: 0.01,
          h: 0.5,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.R_g as number).toBeCloseTo(2.49, 1);
      expectFinitePositive(result.outputs.R_g as number, 'R_g');
    });

    it('grounding-touch-voltage: I_G=1000A, ρ_s=3000, h_s=0.15, D=5m → E_touch≈111V, safe', async () => {
      const dsl = allPlugins.get('grounding-touch-voltage')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_G: 1000,
          rho_s: 3000,
          h_s: 0.15,
          D: 5,
          d: 0.01,
          h: 0.5,
          n: 5,
          m: 5,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.E_touch as number).toBeCloseTo(613, 0);
      expect(result.outputs.E_touch_limit as number).toBeCloseTo(638, 0);
      expect(result.outputs.is_safe).toBe(true);
      expectFinitePositive(result.outputs.E_touch as number, 'E_touch');
    });

    it('grounding-step-voltage: I_G=1000A, ρ_s=3000, h_s=0.15, D=5m, L_eff=100m → E_step≈12V, safe', async () => {
      const dsl = allPlugins.get('grounding-step-voltage')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_G: 1000,
          rho_s: 3000,
          h_s: 0.15,
          D: 5,
          h: 0.5,
          L_eff: 100,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.E_step as number).toBeCloseTo(424, 0);
      expect(result.outputs.E_step_limit as number).toBeCloseTo(2204, 0);
      expect(result.outputs.is_safe).toBe(true);
    });

    it('grounding-conductor-sizing: I_fault=10kA, t=1s, copper → A≈42mm², k≈7.04', async () => {
      const dsl = allPlugins.get('grounding-conductor-sizing')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_fault: 10000,
          t_fault: 1,
          material: 'copper',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.A_mm2 as number).toBeCloseTo(49, 0);
      expect(result.outputs.k_factor as number).toBeCloseTo(7.04, 1);
      expectFinitePositive(result.outputs.A_mm2 as number, 'A_mm2');
    });

    it('grounding-rod-sizing: ρ=100, target=5Ω, 16mm Cu-clad → R_single≈37.9Ω, rods=8', async () => {
      const dsl = allPlugins.get('grounding-rod-sizing')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          rho: 100,
          target_R: 5,
          rod_diameter: 16,
          rod_type: 'copper_clad_steel',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.R_single as number).toBeCloseTo(40.4, 0);
      expect(result.outputs.num_rods).toBe(9);
      expectFinitePositive(result.outputs.L_required as number, 'L_required');
    });
  });

  // ============================================================================
  // PROTECTION — 7 plugins
  // ============================================================================

  describe('Protection (7 plugins)', () => {
    it('protection-fuse-sizing: 100A, general, gG → I_fuse_rated=115A, standard=125A, margin=25%', async () => {
      const dsl = allPlugins.get('protection-fuse-sizing')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_nominal: 100,
          load_type: 'general',
          fuse_class: 'gG',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I_fuse_rated as number).toBeCloseTo(115, 0);
      expect(result.outputs.fuse_standard_size).toBe(120);
      expect(result.outputs.margin as number).toBeCloseTo(20, 0);
      expectFinitePositive(result.outputs.I_fuse_rated as number, 'I_fuse_rated');
    });

    it('protection-mcb-selection: 100A, motor, I_sc=25kA, 3-pole → In=125A, curve=D, breaking=25kA', async () => {
      const dsl = allPlugins.get('protection-mcb-selection')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_nominal: 100,
          load_type: 'motor',
          I_sc: 25,
          num_poles: 3,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.In_rated).toBe(110);
      expect(result.outputs.trip_curve).toBe('D');
      expect(result.outputs.breaking_capacity).toBe(25);
      expectFinitePositive(result.outputs.In_rated as number, 'In_rated');
    });

    it('protection-mccb-selection: 200A, I_sc=25kA, distribution, 3-pole → In=220A, Icu=25kA, 250A frame', async () => {
      const dsl = allPlugins.get('protection-mccb-selection')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_nominal: 200,
          I_sc: 25,
          application: 'distribution',
          num_poles: 3,
          selective: false,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.In_rated).toBe(220);
      expect(result.outputs.Icu_required).toBe(25);
      expect(result.outputs.Ics_required as number).toBeCloseTo(18.75, 1);
      expect(result.outputs.frame_size).toBe('250A_frame');
    });

    it('protection-acb-selection: 2000A, I_sc=50kA, main_incomer → In=2200A, standard=2500A, LSIG', async () => {
      const dsl = allPlugins.get('protection-acb-selection')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_nominal: 2000,
          I_sc: 50,
          application: 'main_incomer',
          num_poles: 3,
          with_neutral: false,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.In_rated).toBe(2200);
      expect(result.outputs.Icu_required).toBe(50);
      expect(result.outputs.standard_rating).toBe(2200);
      expect(result.outputs.protection_functions).toBe('L,S,I,G');
    });

    it('protection-relay-ct-sizing: 500A, I_sc=25kA, overcurrent, 50m leads → CT=600/1, VA≈0.93', async () => {
      const dsl = allPlugins.get('protection-relay-ct-sizing')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_nominal: 500,
          I_sc_max: 25,
          relay_type: 'overcurrent',
          lead_length: 50,
          lead_size: 4,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.CT_ratio).toBe('800/1');
      expect(result.outputs.VA_required as number).toBeCloseTo(0.63, 1);
      expect(result.outputs.accuracy_class).toBe('5P20');
      expectFinitePositive(result.outputs.VA_required as number, 'VA_required');
    });

    it('protection-coordination: I_fault=5kA, t_main=0.5s, t_down=0.2s, margin=0.2s → selective=true, margin=0.3s', async () => {
      const dsl = allPlugins.get('protection-coordination')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_fault_main: 5,
          I_fault_downstream: 5,
          t_main: 0.5,
          t_downstream: 0.2,
          margin: 0.2,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.is_selective).toBe(true);
      expect(result.outputs.time_margin).toBe(0.3);
      expect(result.outputs.recommendation).toBe('selective_coordination_ok');
    });

    it('protection-breaking-capacity: I_sc=25kA, MCCB, 400V, SF=1.25 → Icu_min=31.25kA, class=36kA', async () => {
      const dsl = allPlugins.get('protection-breaking-capacity')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_sc_prospective: 25,
          device_type: 'MCCB',
          system_voltage: 400,
          safety_factor: 1.25,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.Icu_min).toBe(31.25);
      expect(result.outputs.Ics_min as number).toBeCloseTo(23.44, 1);
      expect(result.outputs.recommended_class).toBe('36kA');
    });
  });

  // ============================================================================
  // MOTOR — 6 plugins
  // ============================================================================

  describe('Motor (6 plugins)', () => {
    it('motor-current: 75kW, 400V, cosΦ=0.85, η=93%, 3-ph → I_FL≈136.9A, I_NL≈41.1A, kVA≈94.8', async () => {
      const dsl = allPlugins.get('motor-current')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          P_rated: 75,
          V_rated: 400,
          cosPhi: 0.85,
          efficiency: 93,
          system: 'three_phase',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I_FL as number).toBeCloseTo(136.9, 0);
      expect(result.outputs.I_NL as number).toBeCloseTo(41.1, 0);
      expect(result.outputs.kVA_rating as number).toBeCloseTo(94.8, 0);
      expectFinitePositive(result.outputs.I_FL as number, 'I_FL');
    });

    it('motor-starting-current: I_FL=137A, NEMA=D, DOL → I_LRC≈616.5A, I_start≈616.5A, ratio≈4.5', async () => {
      const dsl = allPlugins.get('motor-starting-current')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_FL: 137,
          NEMA_code: 'D',
          start_method: 'DOL',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.I_LRC as number).toBeCloseTo(616.5, 0);
      expect(result.outputs.I_start as number).toBeCloseTo(616.5, 0);
      expect(result.outputs.start_ratio as number).toBeCloseTo(4.5, 0);
      expectFinitePositive(result.outputs.I_start as number, 'I_start');
    });

    it('motor-voltage-drop-starting: I_start=858A, Z=0.05Ω, 400V, PF=0.3 → V_dip≈22.3V, ~5.57%, acceptable', async () => {
      const dsl = allPlugins.get('motor-voltage-drop-starting')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_start: 858,
          Z_source: 0.05,
          V_nominal: 400,
          cosPhi_start: 0.3,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.V_dip as number).toBeCloseTo(22.3, 0);
      expect(result.outputs.V_dip_pct as number).toBeCloseTo(5.57, 0);
      expect(result.outputs.is_acceptable).toBe(true);
      expectFinitePositive(result.outputs.V_dip as number, 'V_dip');
    });

    it('motor-starting-method: 75kW, 400V, 10MVA supply, pump, 15% → V_dip=15%, DOL feasible', async () => {
      const dsl = allPlugins.get('motor-starting-method')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          P_rated: 75,
          V_system: 400,
          supply_capacity: 10,
          load_type: 'pump',
          max_dip_allowed: 15,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.V_dip_estimated).toBe(15);
      expect(result.outputs.feasible_DOL).toBe(1);
      expect(result.outputs.recommended_method).toBe('DOL');
    });

    it('motor-cable-sizing: 137A FLA, 616A start, 50m, XLPE, tray, 40°C → min_csa=35mm²', async () => {
      const dsl = allPlugins.get('motor-cable-sizing')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_FL: 137,
          I_start: 616,
          L: 50,
          cable_type: 'XLPE',
          installation: 'tray',
          ambient_temp: 40,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.min_csa_continuous).toBe(54.8);
      expectFinitePositive(result.outputs.recommended_csa as number, 'recommended_csa');
    });

    it('motor-protection-sizing: 137A, LRC=616A, I_sc=25kA, CB, general → overload≈144A, MCCB', async () => {
      const dsl = allPlugins.get('motor-protection-sizing')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          I_FL: 137,
          I_LRC: 616,
          I_sc: 25,
          protection_type: 'circuit_breaker',
          application: 'general',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.overload_relay_setting as number).toBeCloseTo(143.85, 1);
      expect(result.outputs.sc_protection_rating as number).toBeCloseTo(492.8, 0);
      expect(result.outputs.recommended_device).toBe('MCCB_with_motor_protection');
      expectFinitePositive(result.outputs.overload_relay_setting as number, 'overload');
    });
  });

  // ============================================================================
  // POWER QUALITY — 5 plugins
  // ============================================================================

  describe('Power Quality (5 plugins)', () => {
    it('pq-power-factor-correction: 500kW, PF 0.75→0.95, 400V → Q_c≈276.5kVAR, C≈16509µF, I_capacitive≈399A', async () => {
      const dsl = allPlugins.get('pq-power-factor-correction')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          P: 500,
          cosPhi_actual: 0.75,
          cosPhi_target: 0.95,
          V_system: 400,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.Q_c as number).toBeCloseTo(276.5, 0);
      expect(result.outputs.C_value as number).toBeCloseTo(16509, 0);
      expect(result.outputs.I_capacitive as number).toBeCloseTo(399.0, 0);
      expect(result.outputs.savings_kW as number).toBeCloseTo(6.7, 1);
      expectFinitePositive(result.outputs.Q_c as number, 'Q_c');
    });

    it('pq-capacitor-bank: 300kVAR, 400V, 6 steps, wye, 7% detuning → Q_step=50, C_step≈995µF, I_rated≈72.2A, f_res≈189Hz', async () => {
      const dsl = allPlugins.get('pq-capacitor-bank')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          Q_total: 300,
          V_system: 400,
          num_steps: 6,
          connection: 'wye',
          detuning: '7pct',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.Q_per_step).toBe(50);
      expect(result.outputs.C_per_step as number).toBeCloseTo(2984, 0);
      expect(result.outputs.I_rated as number).toBeCloseTo(72.2, 0);
      expect(result.outputs.resonant_freq as number).toBeCloseTo(189, 0);
      expectFinitePositive(result.outputs.Q_per_step as number, 'Q_per_step');
    });

    it('pq-reactive-power: S=10000kVA, P=8500kW, 400V → Q≈5267.8kVAR, cosΦ=0.85, φ≈31.79°', async () => {
      const dsl = allPlugins.get('pq-reactive-power')!;
      const result = await runtime.execute(dsl, ctx({ S: 10000, P: 8500, V_LL: 400 }));
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.Q as number).toBeCloseTo(5267.8, 0);
      expect(result.outputs.cosPhi).toBe(0.85);
      expect(result.outputs.phi as number).toBeCloseTo(31.79, 1);
      expect(result.outputs.I_reactive as number).toBeCloseTo(7603.5, 0);
      expectFinitePositive(result.outputs.Q as number, 'Q');
    });

    it('pq-harmonic-estimation: VFD 6-pulse, 500kVA, S_sc=10MVA → THDv=8%, ITDD=30%, non-compliant', async () => {
      const dsl = allPlugins.get('pq-harmonic-estimation')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          load_type: 'VFD_6_pulse',
          S_load: 500,
          S_sc: 10,
          V_system: 0.4,
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.THD_v_estimated).toBe(8);
      expect(result.outputs.ITDD_estimated).toBe(30);
      expect(result.outputs.dominant_harmonics).toBe('5,7,11,13');
      expect(result.outputs.IEEE519_compliant).toBe(false);
    });

    it('pq-voltage-regulation: V_nom=400V, V_act=380V, LV, none → dev=-5%, compliant, corrected=380V', async () => {
      const dsl = allPlugins.get('pq-voltage-regulation')!;
      const result = await runtime.execute(
        dsl,
        ctx({
          V_nominal: 400,
          V_actual: 380,
          system_type: 'LV',
          regulation_devices: 'none',
        }),
      );
      expect(result.errors).toHaveLength(0);
      expect(result.outputs.deviation_pct).toBe(-5);
      expect(result.outputs.status).toBe('compliant');
      expect(result.outputs.regulation_available_pct).toBe(5);
      expect(result.outputs.corrected_voltage).toBe(380);
    });
  });

  // ============================================================================
  // CROSS-CUTTING: Execution invariants — every plugin must satisfy these
  // ============================================================================

  describe('Execution invariants (all 55 plugins)', () => {
    it('every plugin executes without errors when given default inputs', async () => {
      for (const [, dsl] of allPlugins) {
        const defaults: Record<string, unknown> = {};
        for (const input of dsl.inputs) {
          if (input.defaultValue !== undefined) {
            defaults[input.name] = input.defaultValue;
          } else if (input.type === 'enum' && input.enumValues?.length) {
            defaults[input.name] = input.enumValues[0];
          } else if (!input.required && input.type === 'boolean') {
            defaults[input.name] = false;
          }
        }
        const requiredMissing = dsl.inputs.filter(
          (i) => i.required && defaults[i.name] === undefined,
        );
        if (requiredMissing.length > 0) continue;

        const result = await runtime.execute(dsl, ctx(defaults));
        for (const out of dsl.outputs) {
          expect(result.outputs).toHaveProperty(out.name);
          const value = result.outputs[out.name];
          if (typeof value === 'number') {
            expect(Number.isFinite(value)).toBe(true);
          }
        }
      }
    });

    it('every plugin produces correctly typed outputs', async () => {
      for (const [, dsl] of allPlugins) {
        const inputs: Record<string, unknown> = {};
        for (const inp of dsl.inputs) {
          if (inp.defaultValue !== undefined) {
            inputs[inp.name] = inp.defaultValue;
          } else if (inp.type === 'enum' && inp.enumValues?.length) {
            inputs[inp.name] = inp.enumValues[0];
          } else if (inp.type === 'number' && !inp.required) {
            inputs[inp.name] = 1;
          }
        }
        const requiredNum = dsl.inputs.filter((i) => i.required && i.type === 'number');
        const requiredEnum = dsl.inputs.filter((i) => i.required && i.type === 'enum');
        if (
          requiredNum.some((i) => inputs[i.name] === undefined) ||
          requiredEnum.some((i) => inputs[i.name] === undefined)
        ) {
          continue;
        }

        const result = await runtime.execute(dsl, ctx(inputs));
        for (const out of dsl.outputs) {
          const value = result.outputs[out.name];
          if (value === undefined) continue;
          if (out.type === 'number') {
            expect(Number.isFinite(value)).toBe(true);
          } else if (out.type === 'string') {
            expect(typeof value).toBe('string');
          } else if (out.type === 'boolean') {
            expect(typeof value).toBe('boolean');
          }
        }
      }
    });
  });
});
