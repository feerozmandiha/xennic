import { DslRuntime } from '../infrastructure/engines/dsl-runtime.js';
import { FormulaEngine } from '../infrastructure/engines/formula-engine.js';
import { ValidationEngine } from '../infrastructure/engines/validation-engine.js';
import { UnitConversionEngine } from '../infrastructure/engines/unit-conversion-engine.js';
import { DslDefinition } from '../domain/value-objects/dsl-definition.value-object.js';
import type { DslExecutionContext } from '../infrastructure/engines/dsl-runtime.js';

const expectRelative = (actual: number, expected: number, maxRelErr: number = 0.001): void => {
  const relErr = Math.abs(actual - expected) / Math.abs(expected);
  expect(relErr).toBeLessThanOrEqual(maxRelErr);
};

describe('Golden IEC Reference Certification (SI/Metric)', () => {
  let runtime: DslRuntime;
  let formulaEngine: FormulaEngine;

  beforeAll(() => {
    formulaEngine = new FormulaEngine();
    const unitEngine = new UnitConversionEngine();
    const validationEngine = new ValidationEngine(formulaEngine, unitEngine);
    runtime = new DslRuntime(formulaEngine, unitEngine, validationEngine);
  });

  const ctx = (inputs: Record<string, unknown> = {}): DslExecutionContext => ({
    inputs,
    workspaceId: 'golden-iec',
    userId: 'iec-cert',
    correlationId: 'iec-' + crypto.randomUUID(),
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 1. IEC 60909 I_k — maximum/minimum short-circuit with voltage factor c
  // Reference: IEC 60909-0:2016 Section 4.3, Table 1 — Voltage factor c
  //   System: 1000 kVA, 20 kV / 400 V transformer, u_kr = 6%, R/X = 0.2
  //   c_max(LV) = 1.05 (for I_k_max), c_min(LV) = 0.95 (for I_k_min)
  //   I_k_max = c_max × S / (sqrt(3) × V × u_k) = 1.05 × 1e6 / (1.732 × 400 × 0.06)
  //   = 1.05 × 24056 = 25259 A
  //   I_k_min = 0.95 × 24056 = 22853 A
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 60909: should calculate maximum and minimum short-circuit current with c factors', async () => {
    const REFERENCE_IK_MAX_A = 25259; // IEC 60909 c_max = 1.05 for LV
    const REFERENCE_IK_MIN_A = 22853; // IEC 60909 c_min = 0.95 for LV

    const dsl = DslDefinition.create({
      id: 'iec60909-c-factor',
      version: '1.0.0',
      standard: 'IEC 60909',
      inputs: [
        { name: 'S_kVA', label: 'Transformer Rating', type: 'number', unit: 'kVA', required: true },
        { name: 'V_LL', label: 'Secondary Voltage', type: 'number', unit: 'V', required: true },
        {
          name: 'u_kr_pct',
          label: 'Short-Circuit Voltage',
          type: 'number',
          unit: '%',
          required: true,
        },
        { name: 'c', label: 'Voltage Factor c', type: 'number', required: true },
      ],
      outputs: [
        { name: 'I_k', label: 'Initial Symmetrical SC Current', type: 'number', unit: 'A' },
        { name: 'I_k_kA', label: 'Initial Symmetrical SC Current', type: 'number', unit: 'kA' },
      ],
      formulas: [
        { name: 'I_k', expression: 'c * S_kVA * 1000 / (sqrt(3) * V_LL * (u_kr_pct / 100))' },
        { name: 'I_k_kA', expression: 'I_k / 1000' },
      ],
    });

    // Maximum SC: c = c_max = 1.05 (IEC 60909-0 Table 1, LV)
    const maxResult = await runtime.execute(
      dsl,
      ctx({ S_kVA: 1000, V_LL: 400, u_kr_pct: 6, c: 1.05 }),
    );
    expect(maxResult.errors).toHaveLength(0);
    expectRelative(maxResult.outputs.I_k as number, REFERENCE_IK_MAX_A);

    // Minimum SC: c = c_min = 0.95
    const minResult = await runtime.execute(
      dsl,
      ctx({ S_kVA: 1000, V_LL: 400, u_kr_pct: 6, c: 0.95 }),
    );
    expect(minResult.errors).toHaveLength(0);
    expectRelative(minResult.outputs.I_k as number, REFERENCE_IK_MIN_A);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 2. IEC 60287 Cable Current Rating — buried cable derating
  // Reference: IEC 60287-1-1:2023 Section 2.2, Table 3 — grouping factors
  //   Cable: 3 × 95 mm² Cu, XLPE, 90°C, trefoil formation
  //   Base rating from IEC 60287: 245 A
  //   Derating: soil thermal resistivity 2.5 K·m/W → ×0.80
  //   Depth correction 0.8 m → ×0.96
  //   Grouping 2 circuits → ×0.85
  //   Corrected = 245 × 0.80 × 0.96 × 0.85 = 159.9 A
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 60287: should match buried cable current rating with derating factors', async () => {
    const REFERENCE_CORRECTED_A = 159.9; // 245 × 0.80 × 0.96 × 0.85

    const dsl = DslDefinition.create({
      id: 'iec60287-cable-rating',
      version: '1.0.0',
      standard: 'IEC 60287',
      inputs: [
        { name: 'I_base', label: 'Base Current Rating', type: 'number', unit: 'A', required: true },
        { name: 'k_soil', label: 'Soil Resistivity Factor', type: 'number', required: true },
        { name: 'k_depth', label: 'Burial Depth Factor', type: 'number', required: true },
        { name: 'k_group', label: 'Grouping Factor', type: 'number', required: true },
      ],
      outputs: [{ name: 'I_rated', label: 'Corrected Current Rating', type: 'number', unit: 'A' }],
      formulas: [{ name: 'I_rated', expression: 'I_base * k_soil * k_depth * k_group' }],
    });

    const result = await runtime.execute(
      dsl,
      ctx({ I_base: 245, k_soil: 0.8, k_depth: 0.96, k_group: 0.85 }),
    );
    expect(result.errors).toHaveLength(0);
    expectRelative(result.outputs.I_rated as number, REFERENCE_CORRECTED_A);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 3. IEC 60364 Earth Fault Loop Impedance — TN system disconnection
  // Reference: IEC 60364-4-41:2005 Table 41.1, IEC 60364-5-54 Section 543
  //   TN system, 230 V phase-to-earth, 32 A MCB Type C (I_a = 10 × I_n = 320 A)
  //   Maximum Z_s = U_0 / I_a = 230 / 320 = 0.719 Ω
  //   Earth fault current: I_f = U_0 / Z_s (if Z_s = 0.3 Ω)
  //   Disconnection time: 0.4 s (TN final circuit, Table 41.1)
  //   Touch voltage: U_t = I_f × R_2 (if R_2 = 0.2 Ω)
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 60364: should match TN system earth fault loop impedance parameters', async () => {
    const REFERENCE_Z_S_MAX_OHM = 0.719; // IEC 60364-4-41 Table 41.1, 32A MCB C
    const REFERENCE_IF_A = 767; // 230 V / 0.3 Ω fault loop

    const dsl = DslDefinition.create({
      id: 'iec60364-earth-loop',
      version: '1.0.0',
      standard: 'IEC 60364',
      inputs: [
        { name: 'U_0', label: 'Nominal Phase Voltage', type: 'number', unit: 'V', required: true },
        { name: 'I_n', label: 'Circuit Breaker Rating', type: 'number', unit: 'A', required: true },
        { name: 'Z_s', label: 'Fault Loop Impedance', type: 'number', unit: 'ohm', required: true },
      ],
      outputs: [
        { name: 'I_a', label: 'Trip Current (Instantaneous)', type: 'number', unit: 'A' },
        { name: 'Z_s_max', label: 'Maximum Z_s for Disconnection', type: 'number', unit: 'ohm' },
        { name: 'I_f', label: 'Earth Fault Current', type: 'number', unit: 'A' },
        { name: 'disconnect_check', label: 'Disconnection Requirement Met', type: 'number' },
      ],
      formulas: [
        { name: 'I_a', expression: 'I_n * 10' }, // MCB Type C: I_a = 10 × I_n
        { name: 'Z_s_max', expression: 'U_0 / I_a' },
        { name: 'I_f', expression: 'U_0 / Z_s' },
        // 1 = disconnection requirement met, 0 = not met
        { name: 'disconnect_check', expression: 'I_f >= I_a ? 1 : 0' },
      ],
    });

    const result = await runtime.execute(dsl, ctx({ U_0: 230, I_n: 32, Z_s: 0.3 }));
    expect(result.errors).toHaveLength(0);
    expectRelative(result.outputs.Z_s_max as number, REFERENCE_Z_S_MAX_OHM);
    expectRelative(result.outputs.I_f as number, REFERENCE_IF_A);
    expect(result.outputs.disconnect_check).toBe(1);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 4. IEC 61439 Enclosure Temperature Rise — heat dissipation verification
  // Reference: IEC 61439-1:2020 Section 10.10, Annex A
  //   Enclosed switchgear: 800 A busbar system, losses P = 1500 W
  //   Effective cooling surface A_e = 5.0 m², k = 12 W/(m²·K)
  //   Temperature rise Δt = (P / (k × A_e))^0.8
  //   = (1500 / (12 × 5.0))^0.8 = (25)^0.8 = 13.0 K
  //   Limit per Table 6: 65 K for busbars, 70 K for contacts
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 61439: should match enclosure temperature rise calculation', async () => {
    const REFERENCE_TEMP_RISE_K = 13.0; // IEC 61439-1 Annex A formula

    const dsl = DslDefinition.create({
      id: 'iec61439-temp-rise',
      version: '1.0.0',
      standard: 'IEC 61439',
      inputs: [
        {
          name: 'P_loss',
          label: 'Total Power Dissipation',
          type: 'number',
          unit: 'W',
          required: true,
        },
        {
          name: 'A_e',
          label: 'Effective Cooling Surface',
          type: 'number',
          unit: 'm2',
          required: true,
        },
        {
          name: 'k_factor',
          label: 'Heat Transfer Coefficient',
          type: 'number',
          unit: 'W/(m2·K)',
          required: true,
        },
        {
          name: 'limit_K',
          label: 'Temperature Rise Limit',
          type: 'number',
          unit: 'K',
          required: true,
        },
      ],
      outputs: [
        { name: 'delta_T', label: 'Calculated Temperature Rise', type: 'number', unit: 'K' },
        { name: 'margin_K', label: 'Margin to Limit', type: 'number', unit: 'K' },
        { name: 'pass_check', label: 'Pass/Fail Check', type: 'number' },
      ],
      formulas: [
        { name: 'delta_T', expression: '(P_loss / (k_factor * A_e)) ^ 0.8' },
        { name: 'margin_K', expression: 'limit_K - delta_T' },
        { name: 'pass_check', expression: 'delta_T <= limit_K ? 1 : 0' },
      ],
    });

    const result = await runtime.execute(
      dsl,
      ctx({ P_loss: 1500, A_e: 5.0, k_factor: 12, limit_K: 65 }),
    );
    expect(result.errors).toHaveLength(0);
    expectRelative(result.outputs.delta_T as number, REFERENCE_TEMP_RISE_K, 0.015);
    expect(result.outputs.pass_check).toBe(1);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 5. IEC 60076 Transformer Voltage Regulation — full load regulation
  // Reference: IEC 60076-1:2011 Section 9, IEC 60076-8:1997 Section 4
  //   1000 kVA, 20 kV / 400 V, u_kr = 6%, P_k = 8500 W (load loss)
  //   R = P_k × V² / S² = 8500 × 400² / (1000000)² × 10⁶ ... simplified:
  //   u_R = P_k / (10 × S) = 8500 / (10 × 1000) = 0.85%
  //   u_X = sqrt(u_k² - u_R²) = sqrt(36 - 0.7225) = sqrt(35.278) = 5.94%
  //   Regulation at cos φ = 0.8 (load inductive):
  //   Δu = u_R × cosφ + u_X × sinφ = 0.85 × 0.8 + 5.94 × 0.6 = 0.68 + 3.56 = 4.24%
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 60076: should match transformer voltage regulation at full load', async () => {
    const REFERENCE_REGULATION_PCT = 4.24; // IEC 60076-1 Section 9

    const dsl = DslDefinition.create({
      id: 'iec60076-regulation',
      version: '1.0.0',
      standard: 'IEC 60076',
      inputs: [
        { name: 'S_kVA', label: 'Transformer Rating', type: 'number', unit: 'kVA', required: true },
        { name: 'P_k_W', label: 'Load Loss (P_k)', type: 'number', unit: 'W', required: true },
        {
          name: 'u_kr_pct',
          label: 'Short-Circuit Voltage',
          type: 'number',
          unit: '%',
          required: true,
        },
        { name: 'cos_phi', label: 'Load Power Factor', type: 'number', required: true },
      ],
      outputs: [
        { name: 'u_R_pct', label: 'Resistive Voltage Drop', type: 'number', unit: '%' },
        { name: 'u_X_pct', label: 'Reactive Voltage Drop', type: 'number', unit: '%' },
        { name: 'sin_phi', label: 'sin φ', type: 'number' },
        { name: 'delta_u_pct', label: 'Voltage Regulation', type: 'number', unit: '%' },
      ],
      formulas: [
        { name: 'u_R_pct', expression: 'P_k_W / (10 * S_kVA)' },
        { name: 'u_X_pct', expression: 'sqrt(u_kr_pct ^ 2 - u_R_pct ^ 2)' },
        { name: 'sin_phi', expression: 'sqrt(1 - cos_phi ^ 2)' },
        { name: 'delta_u_pct', expression: 'u_R_pct * cos_phi + u_X_pct * sin_phi' },
      ],
    });

    const result = await runtime.execute(
      dsl,
      ctx({ S_kVA: 1000, P_k_W: 8500, u_kr_pct: 6, cos_phi: 0.8 }),
    );
    expect(result.errors).toHaveLength(0);
    expectRelative(result.outputs.u_R_pct as number, 0.85);
    expectRelative(result.outputs.delta_u_pct as number, REFERENCE_REGULATION_PCT);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 6. IEC 60034 Induction Motor — synchronous speed and rated slip
  // Reference: IEC 60034-1:2022 Section 6.2, Table 1 — 50 Hz, 4-pole
  //   n_s = 120 × f / p = 120 × 50 / 4 = 1500 r/min
  //   s_n = (n_s - n_r) / n_s = (1500 - 1455) / 1500 = 0.030 = 3.0%
  //   f_r = s_n × f = 0.030 × 50 = 1.5 Hz (rotor frequency)
  //   Reference: NEMA MG-1 / IEC 60034 typical 4-pole induction motor
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 60034: should match induction motor synchronous speed and slip calculation', async () => {
    const REFERENCE_N_SYNC_RPM = 1500; // IEC 60034, 50 Hz, 4-pole, 1500 r/min
    const REFERENCE_SLIP_PCT = 3.0; // Rated slip for 500 kW IE4 motor

    const dsl = DslDefinition.create({
      id: 'iec60034-motor-slip',
      version: '1.0.0',
      standard: 'IEC 60034',
      inputs: [
        { name: 'f', label: 'Supply Frequency', type: 'number', unit: 'Hz', required: true },
        { name: 'p_poles', label: 'Number of Poles', type: 'number', required: true },
        { name: 'n_r', label: 'Rated Speed', type: 'number', unit: 'r/min', required: true },
      ],
      outputs: [
        { name: 'n_sync', label: 'Synchronous Speed', type: 'number', unit: 'r/min' },
        { name: 'slip', label: 'Rated Slip (per-unit)', type: 'number' },
        { name: 'slip_pct', label: 'Rated Slip', type: 'number', unit: '%' },
        { name: 'f_rotor', label: 'Rotor Frequency', type: 'number', unit: 'Hz' },
      ],
      formulas: [
        { name: 'n_sync', expression: '120 * f / p_poles' },
        { name: 'slip', expression: '(n_sync - n_r) / n_sync' },
        { name: 'slip_pct', expression: 'slip * 100' },
        { name: 'f_rotor', expression: 'slip * f' },
      ],
    });

    const result = await runtime.execute(dsl, ctx({ f: 50, p_poles: 4, n_r: 1455 }));
    expect(result.errors).toHaveLength(0);
    expectRelative(result.outputs.n_sync as number, REFERENCE_N_SYNC_RPM);
    expectRelative(result.outputs.slip_pct as number, REFERENCE_SLIP_PCT);
    expectRelative(result.outputs.f_rotor as number, 1.5);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 7. IEC 62271 High-Voltage Switchgear — rated peak withstand current
  // Reference: IEC 62271-100:2021 Table 3, IEC 62271-1:2017 Table 2
  //   For rated frequency 50 Hz: peak factor n = 2.5 (for HV, 2.74 for LV)
  //   I_p = n × I_k for systems with DC time constant 45 ms
  //   Rated short-time withstand I_k = 25 kA RMS, 1 s duration
  //   Peak withstand I_p = 2.5 × 25 = 62.5 kA
  //   n = sqrt(2) × (1 + e^(-πR/X)) — for R/X = 0.07 → n ≈ 2.5
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 62271: should match peak withstand current and rated short-time current', async () => {
    const REFERENCE_I_PEAK_KA = 62.5; // IEC 62271-100 Table 3, 2.5 × 25 kA

    const dsl = DslDefinition.create({
      id: 'iec62271-peak',
      version: '1.0.0',
      standard: 'IEC 62271',
      inputs: [
        {
          name: 'I_k_RMS',
          label: 'Rated Short-Time Current',
          type: 'number',
          unit: 'kA',
          required: true,
        },
        { name: 'n_factor', label: 'Peak Factor (n)', type: 'number', required: true },
      ],
      outputs: [
        { name: 'I_peak_kA', label: 'Rated Peak Withstand Current', type: 'number', unit: 'kA' },
        { name: 'I_k_sq_sec', label: 'I²t Withstand Capability', type: 'number', unit: 'kA2·s' },
      ],
      formulas: [
        { name: 'I_peak_kA', expression: 'n_factor * I_k_RMS' },
        // I²t for 1 s rated duration
        { name: 'I_k_sq_sec', expression: 'I_k_RMS ^ 2 * 1.0' },
      ],
    });

    const result = await runtime.execute(dsl, ctx({ I_k_RMS: 25, n_factor: 2.5 }));
    expect(result.errors).toHaveLength(0);
    expectRelative(result.outputs.I_peak_kA as number, REFERENCE_I_PEAK_KA);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 8. IEC 62305 Lightning Protection — rolling sphere protection zone
  // Reference: IEC 62305-1:2010 Table 3, IEC 62305-3:2011 Section 6.2
  //   Protection Level I: rolling sphere radius r = 20 m, mesh size 5 × 5 m
  //   Protection Level II: r = 30 m, mesh 10 × 10 m
  //   Protection Level III: r = 45 m, mesh 15 × 15 m
  //   Protection Level IV: r = 60 m, mesh 20 × 20 m
  //   For a lightning rod of height h = 25 m, Protection Level II (r = 30 m):
  //   Protection radius at ground: r_0 = sqrt(2 × r × h - h²) = sqrt(2×30×25 - 625)
  //   = sqrt(1500 - 625) = sqrt(875) = 29.58 m
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 62305: should match rolling sphere protection radius for lightning rod', async () => {
    const REFERENCE_RADIUS_M = 29.58; // IEC 62305-3 eq. for level II, h=25m

    const dsl = DslDefinition.create({
      id: 'iec62305-rolling-sphere',
      version: '1.0.0',
      standard: 'IEC 62305',
      inputs: [
        { name: 'h_rod', label: 'Air Terminal Height', type: 'number', unit: 'm', required: true },
        {
          name: 'r_sphere',
          label: 'Rolling Sphere Radius',
          type: 'number',
          unit: 'm',
          required: true,
        },
        {
          name: 'protection_level',
          label: 'Protection Level (I-IV)',
          type: 'number',
          required: true,
        },
      ],
      outputs: [
        { name: 'r_0', label: 'Protection Radius at Ground', type: 'number', unit: 'm' },
        { name: 'h_x', label: 'Protected Height at r_x = 0', type: 'number', unit: 'm' },
      ],
      formulas: [
        // r_0 = sqrt(2 × r × h - h²) — protection radius at ground level
        { name: 'r_0', expression: 'sqrt(2 * r_sphere * h_rod - h_rod ^ 2)' },
        // Maximum protected height at the rod: h_x = h_rod
        { name: 'h_x', expression: 'h_rod' },
      ],
    });

    const result = await runtime.execute(
      dsl,
      ctx({ h_rod: 25, r_sphere: 30, protection_level: 2 }),
    );
    expect(result.errors).toHaveLength(0);
    expectRelative(result.outputs.r_0 as number, REFERENCE_RADIUS_M);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 9. IEC 60947 Low-Voltage Switchgear — rated making capacity for AC-3
  // Reference: IEC 60947-1:2020 Table 1, IEC 60947-4-1:2018 Table 2
  //   Contactor utilization category AC-3 (squirrel-cage motors):
  //   Making capacity: 10 × I_n for AC-3 (IEC 60947-4-1 §7.2.1.2)
  //   Breaking capacity: 8 × I_n for AC-3
  //   For a 150 A contactor: I_make = 10 × 150 = 1500 A peak
  //   I_break = 8 × 150 = 1200 A
  //   Rated operational current I_e = 150 A at 400 V, AC-3, 50/60 Hz
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 60947: should match LV switchgear making and breaking capacity for AC-3', async () => {
    const REFERENCE_I_MAKE_A = 1500; // 10 × 150 A for AC-3
    const REFERENCE_I_BREAK_A = 1200; // 8 × 150 A for AC-3

    const dsl = DslDefinition.create({
      id: 'iec60947-switchgear',
      version: '1.0.0',
      standard: 'IEC 60947',
      inputs: [
        {
          name: 'I_e',
          label: 'Rated Operational Current',
          type: 'number',
          unit: 'A',
          required: true,
        },
        { name: 'k_make', label: 'Making Capacity Multiplier', type: 'number', required: true },
        { name: 'k_break', label: 'Breaking Capacity Multiplier', type: 'number', required: true },
      ],
      outputs: [
        { name: 'I_make', label: 'Rated Making Capacity', type: 'number', unit: 'A' },
        { name: 'I_break', label: 'Rated Breaking Capacity', type: 'number', unit: 'A' },
      ],
      formulas: [
        { name: 'I_make', expression: 'k_make * I_e' },
        { name: 'I_break', expression: 'k_break * I_e' },
      ],
    });

    const result = await runtime.execute(dsl, ctx({ I_e: 150, k_make: 10, k_break: 8 }));
    expect(result.errors).toHaveLength(0);
    expectRelative(result.outputs.I_make as number, REFERENCE_I_MAKE_A);
    expectRelative(result.outputs.I_break as number, REFERENCE_I_BREAK_A);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // 10. IEC 60027 SI Unit Prefixes — metric conversion with engineering notation
  // Reference: IEC 60027-2:2019 Section 4, Table 1 — SI prefixes
  //   Perform unit conversions using decade factors:
  //   1 km = 1000 m, 1 MW = 10⁶ W, 1 kA = 10³ A, 1 mΩ = 10⁻³ Ω
  //   1 MV = 10⁶ V, 1 μF = 10⁻⁶ F, 1 ns = 10⁻⁹ s
  //   Verify power conversion: 1 MW = 10³ kW = 10⁶ W
  //   ΔS = P / cosφ where P = 2.5 MW, cosφ = 0.85
  //   S = 2.5 / 0.85 = 2.941 MVA → 2941 kVA
  // ───────────────────────────────────────────────────────────────────────────
  it('IEC 60027: should perform correct SI prefix conversion for engineering units', async () => {
    const REFERENCE_S_MVA = 2.941; // IEC 60027, 2.5 MW / 0.85 → MVA
    const REFERENCE_S_KVA = 2941; // Same in kVA

    const dsl = DslDefinition.create({
      id: 'iec60027-si-prefix',
      version: '1.0.0',
      standard: 'IEC 60027',
      inputs: [
        { name: 'P_MW', label: 'Active Power', type: 'number', unit: 'MW', required: true },
        { name: 'cos_phi', label: 'Power Factor', type: 'number', required: true },
      ],
      outputs: [
        { name: 'S_MVA', label: 'Apparent Power', type: 'number', unit: 'MVA' },
        { name: 'S_kVA', label: 'Apparent Power', type: 'number', unit: 'kVA' },
        { name: 'S_W', label: 'Apparent Power', type: 'number', unit: 'W' },
        { name: 'P_kW', label: 'Active Power in kW', type: 'number', unit: 'kW' },
        { name: 'P_W', label: 'Active Power in W', type: 'number', unit: 'W' },
      ],
      formulas: [
        { name: 'S_MVA', expression: 'P_MW / cos_phi' },
        { name: 'S_kVA', expression: 'S_MVA * 1000' },
        { name: 'S_W', expression: 'S_kVA * 1000' },
        { name: 'P_kW', expression: 'P_MW * 1000' },
        { name: 'P_W', expression: 'P_kW * 1000' },
      ],
    });

    const result = await runtime.execute(dsl, ctx({ P_MW: 2.5, cos_phi: 0.85 }));
    expect(result.errors).toHaveLength(0);
    expectRelative(result.outputs.S_MVA as number, REFERENCE_S_MVA);
    expectRelative(result.outputs.S_kVA as number, REFERENCE_S_KVA);
  });
});
