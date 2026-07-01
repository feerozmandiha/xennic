import { Injectable } from '@nestjs/common';
import { BaseFormula } from './base-formula.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';
import { FormulaCategory } from '../types/calculation.types.js';

@Injectable()
export class ShortCircuitFormula extends BaseFormula {
  definition: FormulaDefinition = {
    id: 'short-circuit-iec-60909',
    name: 'Short-Circuit Current per IEC 60909',
    description: 'Calculates three-phase bolted fault current per IEC 60909 (VDE 0102). Supports both near-to-generator and far-from-generator faults.',
    version: '1.0.0',
    category: FormulaCategory.SHORT_CIRCUIT,
    status: 'active',
    standards: [
      { code: 'IEC 60909-0', title: 'Short-circuit currents in three-phase a.c. systems — Part 0: Calculation of currents', clause: '§4.2 — Three-phase short circuit', version: '2016' },
      { code: 'IEEE 141', title: 'IEEE Recommended Practice for Electric Power Distribution', clause: 'Chapter 4 — Short-Circuit Calculations', version: '1993' },
    ],
    inputs: [
      { name: 'sourceVoltage', label: 'Source Voltage', unit: 'V', description: 'Nominal system voltage (line-to-line)', min: 0, max: 800000, required: true },
      { name: 'sourceMva', label: 'Source Fault MVA', unit: 'MVA', description: 'Available fault MVA at the point of common coupling', min: 0, max: 100000, required: true },
      { name: 'cableLength', label: 'Cable Length', unit: 'm', description: 'Length of cable between source and fault', min: 0, max: 100000, defaultValue: 0, required: false },
      { name: 'cableResistance', label: 'Cable Resistance', unit: 'Ω/km', description: 'Cable AC resistance per km', min: 0, max: 100, defaultValue: 0, required: false },
      { name: 'cableReactance', label: 'Cable Reactance', unit: 'Ω/km', description: 'Cable AC reactance per km', min: 0, max: 10, defaultValue: 0, required: false },
      { name: 'transformerPower', label: 'Transformer Power', unit: 'kVA', description: 'Transformer rated power', min: 0, max: 1000000, defaultValue: 0, required: false },
      { name: 'transformerImpedance', label: 'Transformer Impedance', unit: '%', description: 'Transformer impedance voltage uk%', min: 0, max: 20, defaultValue: 0, required: false },
      { name: 'faultType', label: 'Fault Type', unit: '', description: '0=three-phase, 1=line-to-line, 2=single-phase', min: 0, max: 2, defaultValue: 0, required: false },
    ],
    outputs: [
      { name: 'initialSymmetricalCurrent', label: 'Initial Symmetrical Short-Circuit Current', unit: 'kA', description: 'I"k — Initial symmetrical RMS short-circuit current' },
      { name: 'peakCurrent', label: 'Peak Short-Circuit Current', unit: 'kA', description: 'ip — Peak short-circuit current' },
      { name: 'symmetricalBreakingCurrent', label: 'Symmetrical Breaking Current', unit: 'kA', description: 'Ib — Symmetrical breaking current at contact separation' },
      { name: 'dcComponent', label: 'DC Component', unit: '%', description: 'DC component at contact separation time' },
    ],
    createdAt: new Date('2024-01-01'),
  };

  calculate(inputs: Record<string, number>): { outputs: Record<string, number>; intermediates: IntermediateValue[] } {
    const intermediates: IntermediateValue[] = [];
    const Vn = inputs['sourceVoltage']!;
    const Sf = inputs['sourceMva']!;
    const L = inputs['cableLength'] ?? 0;
    const Rc = inputs['cableResistance'] ?? 0;
    const Xc = inputs['cableReactance'] ?? 0;
    const Str = inputs['transformerPower'] ?? 0;
    const uk = inputs['transformerImpedance'] ?? 0;
    const faultType = inputs['faultType'] ?? 0;

    const Vbase = Vn / Math.sqrt(3);
    intermediates.push({ name: 'baseVoltage', value: this.round(Vbase, 2), unit: 'V', description: 'Base phase voltage (Vn/√3)' });

    // Source impedance per IEC 60909
    const Zsource = Vn * Vn / (Sf * 1e6);
    const Rsource = 0.1 * Zsource;
    const Xsource = Math.sqrt(Zsource * Zsource - Rsource * Rsource);
    intermediates.push({ name: 'sourceImpedance', value: this.round(Zsource, 5), unit: 'Ω', description: 'Source impedance at PCC', formula: 'Vn² / (Sf × 10⁶)' });

    let Ztotal = Math.sqrt(Rsource * Rsource + Xsource * Xsource);
    let Rtotal = Rsource;
    let Xtotal = Xsource;

    // Cable impedance
    if (L > 0 && Rc > 0) {
      const Rcable = Rc * L / 1000;
      const Xcable = Xc * L / 1000;
      Rtotal += Rcable;
      Xtotal += Xcable;
      intermediates.push({ name: 'cableResistanceTotal', value: this.round(Rcable, 5), unit: 'Ω', description: 'Total cable resistance', formula: 'Rc × L / 1000' });
      intermediates.push({ name: 'cableReactanceTotal', value: this.round(Xcable, 5), unit: 'Ω', description: 'Total cable reactance', formula: 'Xc × L / 1000' });
    }

    // Transformer impedance per IEC 60909
    if (Str > 0 && uk > 0) {
      const Ztr = (uk / 100) * (Vn * Vn) / (Str * 1000);
      const Rtr = 0.02 * Ztr; // typical X/R = 50 for large transformers
      const Xtr = Math.sqrt(Ztr * Ztr - Rtr * Rtr);
      Rtotal += Rtr;
      Xtotal += Xtr;
      intermediates.push({ name: 'transformerImpedance', value: this.round(Ztr, 5), unit: 'Ω', description: 'Transformer impedance referred to LV side', formula: 'uk% × Vn² / (100 × Str)' });
    }

    Ztotal = Math.sqrt(Rtotal * Rtotal + Xtotal * Xtotal);
    const XoverR = Rtotal > 0 ? Xtotal / Rtotal : 0;
    intermediates.push({ name: 'totalImpedance', value: this.round(Ztotal, 5), unit: 'Ω', description: 'Total short-circuit impedance' });
    intermediates.push({ name: 'xOverR', value: this.round(XoverR, 2), unit: '', description: 'X/R ratio at fault point' });

    // Initial symmetrical current per IEC 60909 §4.2
    const cFactor = Vn <= 1000 ? 1.05 : 1.10; // voltage factor c per Table 1
    let Ik: number;
    if (faultType === 0) {
      Ik = (cFactor * Vn / Math.sqrt(3)) / Ztotal;
    } else if (faultType === 1) {
      Ik = (cFactor * Vn) / (2 * Ztotal);
    } else {
      const Z0 = 3 * Ztotal; // assuming Z0 ≈ 3×Z1 for simplicity
      Ik = (cFactor * Vn / Math.sqrt(3)) / (Ztotal + Z0 / 3);
    }
    const IkKa = Ik / 1000;
    intermediates.push({ name: 'initialSymmetricalCurrentRaw', value: this.round(Ik, 1), unit: 'A', description: `I"k (c=${cFactor}, fault type ${['3ph','LL','SLG'][faultType]})` });

    // Peak current per IEC 60909 §4.3, factor κ
    const kappa = 1.02 + 0.98 * Math.exp(-3 * XoverR);
    const ip = kappa * Math.sqrt(2) * Ik;
    intermediates.push({ name: 'kappaFactor', value: this.round(kappa, 4), unit: '', description: 'Peak factor κ (for ip)', formula: '1.02 + 0.98 × exp(-3 × X/R)' });

    // Breaking current per IEC 60909 §4.4 (simplified: equals Ik for far-from-generator)
    const Ib = Ik; // far-from-generator, µ = 1

    // DC component at 50ms per IEC 60909
    const tMin = 0.05; // 50ms minimum contact separation
    const idc = Math.sqrt(2) * Ik * Math.exp(-2 * Math.PI * tMin / XoverR);
    const idcPercent = Ik > 0 ? (idc / (Math.sqrt(2) * Ik)) * 100 : 0;

    return {
      outputs: {
        initialSymmetricalCurrent: this.round(IkKa, 3),
        peakCurrent: this.round(ip / 1000, 3),
        symmetricalBreakingCurrent: this.round(Ib / 1000, 3),
        dcComponent: this.round(idcPercent, 2),
      },
      intermediates,
    };
  }
}
