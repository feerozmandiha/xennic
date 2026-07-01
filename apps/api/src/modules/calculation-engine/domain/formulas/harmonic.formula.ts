import { Injectable } from '@nestjs/common';
import { BaseFormula } from './base-formula.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';
import { FormulaCategory } from '../types/calculation.types.js';

@Injectable()
export class HarmonicFormula extends BaseFormula {
  definition: FormulaDefinition = {
    id: 'harmonic-ieee-519',
    name: 'Harmonic Analysis per IEEE 519-2022',
    description: 'Calculates total harmonic distortion (THD), individual harmonic distortion (IHD), and compliance with IEEE 519-2022 limits for voltage and current harmonics.',
    version: '1.0.0',
    category: FormulaCategory.HARMONIC,
    status: 'active',
    standards: [
      { code: 'IEEE 519-2022', title: 'IEEE Standard for Harmonic Control in Electric Power Systems', clause: '§5 — Voltage Distortion, §6 — Current Distortion', version: '2022' },
      { code: 'IEC 61000-2-4', title: 'Electromagnetic compatibility (EMC) — Part 2-4: Environment — Compatibility levels', clause: 'Table 1 — Voltage harmonics', version: '2002' },
    ],
    inputs: [
      { name: 'fundamentalCurrent', label: 'Fundamental Current', unit: 'A', description: 'Fundamental frequency (50/60 Hz) RMS current', min: 0, max: 10000, required: true },
      { name: 'h3', label: '3rd Harmonic', unit: '%', description: '3rd harmonic as % of fundamental', min: 0, max: 100, defaultValue: 2, required: false },
      { name: 'h5', label: '5th Harmonic', unit: '%', description: '5th harmonic as % of fundamental', min: 0, max: 100, defaultValue: 3, required: false },
      { name: 'h7', label: '7th Harmonic', unit: '%', description: '7th harmonic as % of fundamental', min: 0, max: 100, defaultValue: 2, required: false },
      { name: 'h11', label: '11th Harmonic', unit: '%', description: '11th harmonic as % of fundamental', min: 0, max: 100, defaultValue: 1, required: false },
      { name: 'h13', label: '13th Harmonic', unit: '%', description: '13th harmonic as % of fundamental', min: 0, max: 100, defaultValue: 0.8, required: false },
      { name: 'voltageThd', label: 'Voltage THD', unit: '%', description: 'Voltage THD at PCC', min: 0, max: 20, defaultValue: 2, required: false },
      { name: 'iscOverIl', label: 'Isc/IL Ratio', unit: '', description: 'Short-circuit current ratio at PCC (IEEE 519 Table 2)', min: 0, max: 1000, defaultValue: 100, required: false },
      { name: 'systemVoltage', label: 'System Voltage', unit: 'V', description: 'Nominal system voltage', min: 0, max: 800000, defaultValue: 400, required: false },
    ],
    outputs: [
      { name: 'currentThd', label: 'Current THD', unit: '%', description: 'Total harmonic current distortion (THD-I)' },
      { name: 'voltageThdOutput', label: 'Voltage THD', unit: '%', description: 'Total harmonic voltage distortion (THD-V)' },
      { name: 'currentThdLimit', label: 'THD-I Limit', unit: '%', description: 'IEEE 519 allowable THD-I limit' },
      { name: 'voltageThdLimit', label: 'THD-V Limit', unit: '%', description: 'IEEE 519 allowable THD-V limit (8% for <1kV)' },
      { name: 'currentCompliant', label: 'Current Compliant', unit: '', description: '1=compliant, 0=non-compliant' },
      { name: 'voltageCompliant', label: 'Voltage Compliant', unit: '', description: '1=compliant, 0=non-compliant' },
    ],
    createdAt: new Date('2024-01-01'),
  };

  calculate(inputs: Record<string, number>): { outputs: Record<string, number>; intermediates: IntermediateValue[] } {
    const intermediates: IntermediateValue[] = [];
    const I1 = inputs['fundamentalCurrent']!;
    const h3 = inputs['h3'] ?? 2;
    const h5 = inputs['h5'] ?? 3;
    const h7 = inputs['h7'] ?? 2;
    const h11 = inputs['h11'] ?? 1;
    const h13 = inputs['h13'] ?? 0.8;
    const vthdIn = inputs['voltageThd'] ?? 2;
    const IscIl = inputs['iscOverIl'] ?? 100;
    const V = inputs['systemVoltage'] ?? 400;

    // Current THD per IEEE 519
    const harmonicPcts = [h3, h5, h7, h11, h13];
    const thdi = Math.sqrt(harmonicPcts.reduce((s, h) => s + h * h, 0));
    intermediates.push({ name: 'currentThdRaw', value: this.round(thdi, 2), unit: '%', description: 'Current THD calculated from individual harmonics', formula: '√(Σ(Ih/I1)²) × 100%' });

    // Individual harmonic distortion (IHD) limits per IEEE 519-2022 Table 2
    const ihdLimits = this.getIhdLimits(IscIl);
    intermediates.push({ name: 'iscOverIlRaw', value: IscIl, unit: '', description: 'Short-circuit ratio at PCC (IEEE 519 Table 2)' });

    const ihdChecks = harmonicPcts.map((h, i) => {
      const harmOrder = [3, 5, 7, 11, 13][i]!;
      const limit = this.getIhdLimit(harmOrder, ihdLimits);
      return { order: harmOrder, actual: h, limit, passed: h <= limit };
    });
    intermediates.push({ name: 'ihdCompliance', value: ihdChecks.filter((c) => c.passed).length, unit: '', description: `${ihdChecks.filter((c) => c.passed).length}/${ihdChecks.length} IHD limits met` });

    // THD-I limits per IEEE 519-2022 Table 2
    const thdiLimit = this.getThdiLimit(IscIl);
    const currentCompliant = thdi <= thdiLimit ? 1 : 0;

    // Voltage THD per IEEE 519-2022 Table 1
    const vLimit = V <= 1000 ? 8 : V <= 69000 ? 5 : 2.5;
    const voltageCompliant = vthdIn <= vLimit ? 1 : 0;
    intermediates.push({ name: 'voltageThdLimit', value: vLimit, unit: '%', description: `Voltage THD limit for V=${V}V (IEEE 519 Table 1)` });

    return {
      outputs: {
        currentThd: this.round(thdi, 2),
        voltageThdOutput: vthdIn,
        currentThdLimit: thdiLimit,
        voltageThdLimit: vLimit,
        currentCompliant,
        voltageCompliant,
      },
      intermediates,
    };
  }

  private getIhdLimits(iscIl: number): { even: number; odd: number; thd: number } {
    if (iscIl < 20) return { even: 0.4, odd: 0.2, thd: 5 };
    if (iscIl < 50) return { even: 0.7, odd: 0.3, thd: 8 };
    if (iscIl < 100) return { even: 1, odd: 0.5, thd: 12 };
    if (iscIl < 1000) return { even: 1.5, odd: 0.7, thd: 15 };
    return { even: 2, odd: 1, thd: 20 };
  }

  private getIhdLimit(order: number, limits: { even: number; odd: number; thd: number }): number {
    if (order % 2 === 0) return limits.even;
    const oddLimits = order <= 11 ? 4 : 2;
    return oddLimits;
  }

  private getThdiLimit(iscIl: number): number {
    if (iscIl < 20) return 5;
    if (iscIl < 50) return 8;
    if (iscIl < 100) return 12;
    if (iscIl < 1000) return 15;
    return 20;
  }
}
