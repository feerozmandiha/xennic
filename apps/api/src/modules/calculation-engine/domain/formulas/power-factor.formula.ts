import { Injectable } from '@nestjs/common';
import { BaseFormula } from './base-formula.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';
import { FormulaCategory } from '../types/calculation.types.js';

@Injectable()
export class PowerFactorFormula extends BaseFormula {
  definition: FormulaDefinition = {
    id: 'power-factor-correction-ieee-519',
    name: 'Power Factor Correction Sizing',
    description: 'Calculates required capacitor bank size to achieve target power factor. Based on reactive power compensation principles per IEEE 519 and IEC 61000.',
    version: '1.0.0',
    category: FormulaCategory.POWER_FACTOR,
    status: 'active',
    standards: [
      { code: 'IEEE 519-2022', title: 'IEEE Standard for Harmonic Control', clause: '§7 — Power factor correction', version: '2022' },
      { code: 'IEC 61000-3-2', title: 'Electromagnetic compatibility — Limits for harmonic current emissions', clause: '§6 — Power factor requirements', version: '2018' },
    ],
    inputs: [
      { name: 'loadKva', label: 'Connected Load', unit: 'kVA', description: 'Total connected load in kVA', min: 0, max: 100000, required: true },
      { name: 'currentPf', label: 'Current Power Factor', unit: '', description: 'Existing power factor (cos φ1)', min: 0.1, max: 1, required: true },
      { name: 'targetPf', label: 'Target Power Factor', unit: '', description: 'Desired power factor (cos φ2)', min: 0.5, max: 1, defaultValue: 0.95, required: false },
      { name: 'voltage', label: 'System Voltage', unit: 'V', description: 'Nominal system voltage', min: 0, max: 100000, defaultValue: 400, required: false },
      { name: 'harmonicContent', label: 'Harmonic Content', unit: 'THD%', description: 'Existing voltage THD for detuning consideration', min: 0, max: 100, defaultValue: 0, required: false },
      { name: 'capacitorType', label: 'Capacitor Type', unit: '', description: '0=standard, 1=detuned (7%), 2=detuned (14%)', min: 0, max: 2, defaultValue: 0, required: false },
    ],
    outputs: [
      { name: 'requiredKvar', label: 'Required Capacitor Rating', unit: 'kVAR', description: 'Total capacitor bank kVAR required' },
      { name: 'correctedPf', label: 'Corrected Power Factor', unit: '', description: 'Expected power factor after correction' },
      { name: 'currentReduction', label: 'Current Reduction', unit: '%', description: 'Reduction in line current after correction' },
      { name: 'annualSavings', label: 'Estimated Annual Savings', unit: 'currency/yr', description: 'Estimated annual cost savings (penalty avoidance)' },
      { name: 'recommendedSteps', label: 'Recommended Steps', unit: '', description: 'Number of capacitor steps for automatic bank' },
    ],
    createdAt: new Date('2024-01-01'),
  };

  calculate(inputs: Record<string, number>): { outputs: Record<string, number>; intermediates: IntermediateValue[] } {
    const intermediates: IntermediateValue[] = [];
    const S = inputs['loadKva']!;
    const pf1 = inputs['currentPf']!;
    const pf2 = inputs['targetPf'] ?? 0.95;
    const V = inputs['voltage'] ?? 400;
    const thd = inputs['harmonicContent'] ?? 0;
    const capType = inputs['capacitorType'] ?? 0;

    const φ1 = Math.acos(pf1);
    const φ2 = Math.acos(pf2);
    const P = S * pf1;
    const Q1 = P * Math.tan(φ1);
    const Q2 = P * Math.tan(φ2);
    const Qc = Q1 - Q2;

    intermediates.push({ name: 'activePower', value: this.round(P, 2), unit: 'kW', description: 'Active power component', formula: 'S × cosφ1' });
    intermediates.push({ name: 'reactivePowerBefore', value: this.round(Q1, 2), unit: 'kVAR', description: 'Reactive power before correction', formula: 'P × tanφ1' });
    intermediates.push({ name: 'reactivePowerAfter', value: this.round(Q2, 2), unit: 'kVAR', description: 'Reactive power after correction', formula: 'P × tanφ2' });
    intermediates.push({ name: 'requiredKvarRaw', value: this.round(Qc, 2), unit: 'kVAR', description: 'Required capacitor kVAR', formula: 'Q1 - Q2 = P × (tanφ1 - tanφ2)' });

    // Detuning factor for harmonics
    const detuningFactor = capType === 0 ? 1 : capType === 1 ? 1.07 : 1.14;
    const QcDetuned = Qc * detuningFactor;
    intermediates.push({ name: 'detuningFactor', value: detuningFactor, unit: '', description: `Detuning factor for ${['standard','7% detuned','14% detuned'][capType]}` });

    // Current reduction
    const I1 = S * 1000 / (Math.sqrt(3) * V);
    const I2 = (P * 1000) / (Math.sqrt(3) * V * pf2);
    const reduction = I1 > 0 ? ((I1 - I2) / I1) * 100 : 0;
    intermediates.push({ name: 'currentBefore', value: this.round(I1, 1), unit: 'A', description: 'Line current before correction' });
    intermediates.push({ name: 'currentAfter', value: this.round(I2, 1), unit: 'A', description: 'Line current after correction' });

    // Annual savings estimate
    const rate = 0.10; // $0.10/kWh assumed
    const pfPenalty = pf1 < 0.9 ? (0.9 - pf1) * 0.02 * P * 8760 * rate : 0;
    const annualSavings = pfPenalty + Qc * 12 * 0.5; // kVAR demand charge

    // Recommended steps
    const steps = Math.min(Math.max(Math.ceil(Qc / 50), 3), 12);

    return {
      outputs: {
        requiredKvar: this.round(Math.ceil(QcDetuned / 5) * 5, 0),
        correctedPf: this.round(pf2, 3),
        currentReduction: this.round(reduction, 1),
        annualSavings: this.round(annualSavings, 0),
        recommendedSteps: steps,
      },
      intermediates,
    };
  }
}
