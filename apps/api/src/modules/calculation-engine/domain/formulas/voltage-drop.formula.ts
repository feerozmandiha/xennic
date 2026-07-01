import { Injectable } from '@nestjs/common';
import { BaseFormula } from './base-formula.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';
import { FormulaCategory } from '../types/calculation.types.js';

@Injectable()
export class VoltageDropFormula extends BaseFormula {
  definition: FormulaDefinition = {
    id: 'voltage-drop-iec-60364-5-52-525',
    name: 'Voltage Drop per IEC 60364-5-52 §525',
    description: 'Calculates voltage drop in AC circuits per IEC 60364-5-52 Clause 525, with limits of 4% for lighting and 8% for other loads.',
    version: '1.0.0',
    category: FormulaCategory.VOLTAGE_DROP,
    status: 'active',
    standards: [
      { code: 'IEC 60364-5-52', title: 'Low-voltage electrical installations', clause: '§525 — Voltage drop', version: '2022' },
      { code: 'IEEE 141', title: 'IEEE Recommended Practice for Electric Power Distribution', clause: 'Chapter 3 — Voltage Drop', version: '1993' },
    ],
    inputs: [
      { name: 'current', label: 'Load Current', unit: 'A', description: 'Circuit load current', min: 0, max: 10000, required: true },
      { name: 'length', label: 'Cable Length', unit: 'm', description: 'One-way cable length', min: 0, max: 100000, required: true },
      { name: 'resistance', label: 'Conductor Resistance', unit: 'Ω/km', description: 'AC resistance per km at operating temperature', min: 0, max: 100, required: true },
      { name: 'reactance', label: 'Reactance', unit: 'Ω/km', description: 'AC reactance per km', min: 0, max: 10, defaultValue: 0.08, required: false },
      { name: 'voltage', label: 'System Voltage', unit: 'V', description: 'Nominal system voltage (line-to-neutral for single-phase, line-to-line for three-phase)', min: 0, max: 100000, required: true },
      { name: 'phaseCount', label: 'Phase Count', unit: '', description: '1 = single-phase, 3 = three-phase', min: 1, max: 3, defaultValue: 3, required: false },
      { name: 'powerFactor', label: 'Power Factor', unit: '', description: 'Load power factor (cos φ)', min: 0, max: 1, defaultValue: 0.85, required: false },
    ],
    outputs: [
      { name: 'voltageDrop', label: 'Voltage Drop', unit: 'V', description: 'Total voltage drop in volts' },
      { name: 'voltageDropPercent', label: 'Voltage Drop', unit: '%', description: 'Voltage drop as percentage of nominal voltage' },
      { name: 'verdict', label: 'Verdict', unit: '', description: '1=compliant (≤4%), 0=non-compliant' },
    ],
    createdAt: new Date('2024-01-01'),
  };

  calculate(inputs: Record<string, number>): { outputs: Record<string, number>; intermediates: IntermediateValue[] } {
    const intermediates: IntermediateValue[] = [];
    const I = inputs['current']!;
    const L = inputs['length']!;
    const R = inputs['resistance']!;
    const X = inputs['reactance'] ?? 0.08;
    const V = inputs['voltage']!;
    const phases = inputs['phaseCount'] ?? 3;
    const pf = inputs['powerFactor'] ?? 0.85;
    const sinPhi = Math.sqrt(1 - pf * pf);

    const RTotal = R * L / 1000;
    const XTotal = X * L / 1000;
    intermediates.push({ name: 'totalResistance', value: this.round(RTotal, 4), unit: 'Ω', description: 'Total conductor resistance', formula: 'R × L / 1000' });
    intermediates.push({ name: 'totalReactance', value: this.round(XTotal, 4), unit: 'Ω', description: 'Total conductor reactance', formula: 'X × L / 1000' });

    let voltageDrop: number;
    if (phases === 3) {
      voltageDrop = Math.sqrt(3) * I * (RTotal * pf + XTotal * sinPhi);
      intermediates.push({ name: 'vdFormula', value: 2, unit: '', description: 'Three-phase: √3 × I × (Rcosφ + Xsinφ)', formula: '√3 × I × (Rcosφ + Xsinφ)' });
    } else {
      voltageDrop = 2 * I * (RTotal * pf + XTotal * sinPhi);
      intermediates.push({ name: 'vdFormula', value: 2, unit: '', description: 'Single-phase: 2 × I × (Rcosφ + Xsinφ)', formula: '2 × I × (Rcosφ + Xsinφ)' });
    }

    const vdPercent = V > 0 ? (voltageDrop / V) * 100 : 0;
    const verdict = vdPercent <= 4 ? 1 : 0;

    return {
      outputs: { voltageDrop: this.round(voltageDrop, 3), voltageDropPercent: this.round(vdPercent, 3), verdict },
      intermediates,
    };
  }
}
