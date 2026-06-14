export type CalcInputs = Record<string, number | string>;

export function calcLocal(code: string, inputs: CalcInputs) {
  const v = (k: string) => Number(inputs[k] ?? 0);

  switch (code) {
    case 'BASIC-001': {
      const voltage  = v('voltage_v');
      const current  = v('current_a');
      const resistance = v('resistance_ohm');
      let result: Record<string, any>;
      if (voltage && resistance) {
        result = { current_a: voltage / resistance, power_w: (voltage * voltage) / resistance };
      } else if (voltage && current) {
        result = { resistance_ohm: voltage / current, power_w: voltage * current };
      } else if (current && resistance) {
        result = { voltage_v: current * resistance, power_w: current * current * resistance };
      } else {
        result = { error: 'اطلاعات کافی نیست' };
      }
      return { status: 'success', result: { ...result, formula: 'V = I × R', code } };
    }
    case 'BASIC-002': {
      const pf = v('power_factor') || 1;
      const phaseType = inputs['phase_type'] ?? 'single';
      const p = phaseType === 'three' ? Math.sqrt(3) * v('voltage_v') * v('current_a') * pf : v('voltage_v') * v('current_a') * pf;
      return { status: 'success', result: { active_power_w: p, power_factor: pf, formula: 'P = V × I × PF', code } };
    }
    case 'BASIC-003': {
      const phaseType = inputs['phase_type'] ?? 'single';
      const s = phaseType === 'three' ? Math.sqrt(3) * v('voltage_v') * v('current_a') : v('voltage_v') * v('current_a');
      return { status: 'success', result: { apparent_power_va: s, formula: 'S = V × I', code } };
    }
    case 'BASIC-004': {
      const p = v('active_power_w');
      const s = v('apparent_power_va');
      const q = s ? Math.sqrt(Math.max(0, s * s - p * p)) : 0;
      return { status: 'success', result: { reactive_power_var: q, formula: 'Q = √(S² - P²)', code } };
    }
    case 'BASIC-005': {
      const p = v('active_power_w');
      const s = v('apparent_power_va');
      const pf = s > 0 ? p / s : 0;
      return { status: 'success', result: { power_factor: pf, theta_deg: Math.acos(Math.max(-1, Math.min(1, pf))) * 180 / Math.PI, formula: 'PF = P / S', code } };
    }
    case 'CABLE-001': {
      const loadCurrent = v('load_current');
      const length = v('length_m') || 50;
      const ambient = v('ambient_temperature') || 35;
      const voltDrop = (0.018 * length * loadCurrent) / 10;
      const suggestedSize = Math.max(Math.ceil(voltDrop / 0.5) * 1.5, 2.5);
      return {
        status: 'success',
        result: {
          suggested_size_mm2: Math.ceil(suggestedSize / 2.5) * 2.5,
          voltage_drop_percent: +(voltDrop / 230 * 100).toFixed(2),
          formula: 'S = (ρ × L × I) / ΔV, ρ=0.018 Ω·mm²/m',
          note: 'تخمین ساده — روش نصب و ضریب تصحیح در نظر گرفته نشده',
          code,
        },
      };
    }
    case 'CABLE-002': {
      const loadI = v('load_current');
      const cableLen = v('length_m') || 50;
      const size = v('cable_size_mm2') || 10;
      const vd = (0.018 * cableLen * loadI) / size;
      return {
        status: 'success',
        result: {
          voltage_drop_v: +vd.toFixed(2),
          voltage_drop_percent: +(vd / 230 * 100).toFixed(2),
          formula: 'ΔV = (ρ × L × I) / S, ρ=0.018 Ω·mm²/m',
          code,
        },
      };
    }
    default:
      return { status: 'success', result: { note: 'محاسبه آزمایشی', code, inputs } };
  }
}
