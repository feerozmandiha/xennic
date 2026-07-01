import { Injectable } from '@nestjs/common';
import { BaseFormula } from './base-formula.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';
import { FormulaCategory } from '../types/calculation.types.js';

@Injectable()
export class GroundingFormula extends BaseFormula {
  definition: FormulaDefinition = {
    id: 'grounding-ieee-80',
    name: 'Grounding Grid Design per IEEE 80',
    description: 'Calculates grounding grid resistance, touch voltage, and step voltage per IEEE Std 80-2013. Verifies safety against tolerable limits.',
    version: '1.0.0',
    category: FormulaCategory.GROUNDING,
    status: 'active',
    standards: [
      { code: 'IEEE 80', title: 'IEEE Guide for Safety in AC Substation Grounding', clause: '§14 — Grid Resistance, §15 — Touch & Step Voltage', version: '2013' },
      { code: 'IEC 62305-3', title: 'Protection against lightning — Part 3: Physical damage and life hazard', clause: '§5 — Grounding', version: '2010' },
    ],
    inputs: [
      { name: 'soilResistivity', label: 'Soil Resistivity', unit: 'Ω·m', description: 'Average soil resistivity', min: 1, max: 100000, required: true },
      { name: 'gridArea', label: 'Grid Area', unit: 'm²', description: 'Area covered by grounding grid', min: 1, max: 1000000, required: true },
      { name: 'faultCurrent', label: 'Grid Fault Current', unit: 'A', description: 'Maximum grid fault current', min: 0, max: 100000, required: true },
      { name: 'faultDuration', label: 'Fault Duration', unit: 's', description: 'Maximum fault clearing time', min: 0.1, max: 5, defaultValue: 0.5, required: false },
      { name: 'conductorLength', label: 'Total Conductor Length', unit: 'm', description: 'Total length of grid conductors', min: 0, max: 100000, defaultValue: 0, required: false },
      { name: 'burialDepth', label: 'Burial Depth', unit: 'm', description: 'Depth of grid burial', min: 0.1, max: 5, defaultValue: 0.5, required: false },
      { name: 'gridSpacing', label: 'Grid Spacing', unit: 'm', description: 'Spacing between parallel conductors', min: 1, max: 50, defaultValue: 5, required: false },
      { name: 'personWeight', label: 'Person Weight', unit: '', description: '70=standard (50kg), 0=utility (70kg)', min: 0, max: 70, defaultValue: 70, required: false },
    ],
    outputs: [
      { name: 'gridResistance', label: 'Grid Resistance', unit: 'Ω', description: 'Ground grid resistance to remote earth' },
      { name: 'meshVoltage', label: 'Mesh (Touch) Voltage', unit: 'V', description: 'Maximum mesh (touch) voltage' },
      { name: 'stepVoltage', label: 'Step Voltage', unit: 'V', description: 'Maximum step voltage' },
      { name: 'tolerableTouch', label: 'Tolerable Touch Voltage', unit: 'V', description: 'Tolerable touch voltage per IEEE 80' },
      { name: 'tolerableStep', label: 'Tolerable Step Voltage', unit: 'V', description: 'Tolerable step voltage per IEEE 80' },
      { name: 'touchSafe', label: 'Touch Voltage Safe', unit: '', description: '1=safe, 0=unsafe' },
      { name: 'stepSafe', label: 'Step Voltage Safe', unit: '', description: '1=safe, 0=unsafe' },
    ],
    createdAt: new Date('2024-01-01'),
  };

  calculate(inputs: Record<string, number>): { outputs: Record<string, number>; intermediates: IntermediateValue[] } {
    const intermediates: IntermediateValue[] = [];
    const ρ = inputs['soilResistivity']!;
    const A = inputs['gridArea']!;
    const Ig = inputs['faultCurrent']!;
    const tf = inputs['faultDuration'] ?? 0.5;
    const Lc = inputs['conductorLength'] ?? 4 * Math.sqrt(A); // default: 4×√A perimeter
    const h = inputs['burialDepth'] ?? 0.5;
    const D = inputs['gridSpacing'] ?? 5;
    const W = inputs['personWeight'] ?? 70;

    // Grid resistance per IEEE 80 Eq. 52 (Sverak)
    const Ltotal = Lc;
    const gridR = ρ * (1 / Ltotal + 1 / Math.sqrt(20 * A) * (1 + 1 / (1 + h * Math.sqrt(20 / A))));
    intermediates.push({ name: 'gridResistanceRaw', value: this.round(gridR, 3), unit: 'Ω', description: 'Grid resistance per Sverak (IEEE 80 Eq. 52)' });

    // Tolerable touch voltage per IEEE 80 Eq. 32
    const Etouch50 = (116 + 0.174 * ρ) / Math.sqrt(tf);
    const Etouch70 = (157 + 0.235 * ρ) / Math.sqrt(tf);
    const Etouch = W === 70 ? Etouch70 : Etouch50;
    intermediates.push({ name: 'tolerableTouchVoltage', value: this.round(Etouch, 1), unit: 'V', description: `Tolerable touch voltage for ${W}kg person (IEEE 80 Eq. 32)` });

    // Tolerable step voltage per IEEE 80 Eq. 29
    const Estep50 = (116 + 0.696 * ρ) / Math.sqrt(tf);
    const Estep70 = (157 + 0.943 * ρ) / Math.sqrt(tf);
    const Estep = W === 70 ? Estep70 : Estep50;
    intermediates.push({ name: 'tolerableStepVoltage', value: this.round(Estep, 1), unit: 'V', description: `Tolerable step voltage for ${W}kg person (IEEE 80 Eq. 29)` });

    // Mesh voltage per IEEE 80 §16.5.1 simplified
    const n = Math.sqrt(A) / D; // number of conductors per side
    const Ki = 0.656 + 0.172 * n; // irregularity factor
    const Km = (1 / (2 * Math.PI)) * (Math.log(D * D / (16 * h * 0.01)) + Math.log(1 + 2 * h / D)); // simplified spacing factor
    const Em = ρ * Km * Ki * Ig / Ltotal;
    intermediates.push({ name: 'meshVoltageRaw', value: this.round(Em, 1), unit: 'V', description: 'Mesh voltage (IEEE 80 simplified)', formula: 'ρ × Km × Ki × Ig / Ltotal' });

    // Step voltage (simplified per IEEE 80)
    const Ks = (1 / Math.PI) * (1 / (2 * h) + 1 / (D + h) + (1 / D) * (1 - 0.5 ** (n - 2)));
    const Es = ρ * Ks * Ki * Ig / Ltotal;
    intermediates.push({ name: 'stepVoltageRaw', value: this.round(Es, 1), unit: 'V', description: 'Step voltage (IEEE 80 simplified)' });

    return {
      outputs: {
        gridResistance: this.round(gridR, 2),
        meshVoltage: this.round(Em, 1),
        stepVoltage: this.round(Es, 1),
        tolerableTouch: this.round(Etouch, 1),
        tolerableStep: this.round(Estep, 1),
        touchSafe: Em <= Etouch ? 1 : 0,
        stepSafe: Es <= Estep ? 1 : 0,
      },
      intermediates,
    };
  }
}
