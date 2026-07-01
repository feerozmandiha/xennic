import { Injectable } from '@nestjs/common';
import { BaseFormula } from './base-formula.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';
import { FormulaCategory } from '../types/calculation.types.js';

@Injectable()
export class CableSizingFormula extends BaseFormula {
  definition: FormulaDefinition = {
    id: 'cable-sizing-iec-60364-5-52',
    name: 'Cable Sizing per IEC 60364-5-52',
    description: 'Selects minimum cable cross-sectional area based on load current, installation method, ambient temperature, and grouping factors.',
    version: '1.0.0',
    category: FormulaCategory.CABLE_SIZING,
    status: 'active',
    standards: [
      { code: 'IEC 60364-5-52', title: 'Low-voltage electrical installations — Selection and erection of electrical equipment', clause: 'Table B.52.1 — Current-carrying capacities', version: '2022', evidenceUrl: 'https://webstore.iec.ch/publication/67237' },
    ],
    inputs: [
      { name: 'loadCurrent', label: 'Load Current', unit: 'A', description: 'Full load current of the circuit', min: 0, max: 10000, required: true },
      { name: 'cableLength', label: 'Cable Length', unit: 'm', description: 'Length of the cable run', min: 0, max: 100000, required: true },
      { name: 'ambientTemp', label: 'Ambient Temperature', unit: '°C', description: 'Ambient air temperature', min: -40, max: 80, defaultValue: 30, required: false },
      { name: 'conductorMaterial', label: 'Conductor Material', unit: '', description: '0=copper, 1=aluminum', min: 0, max: 1, defaultValue: 0, required: false },
      { name: 'installationMethod', label: 'Installation Method', unit: '', description: '0=in air (perforated tray), 1=underground (direct burial), 2=conduit, 3=multicore', min: 0, max: 3, defaultValue: 0, required: false },
      { name: 'circuitsGrouped', label: 'Circuits Grouped', unit: '', description: 'Number of circuits grouped together', min: 1, max: 20, defaultValue: 1, required: false },
    ],
    outputs: [
      { name: 'selectedCsa', label: 'Selected Cross-Sectional Area', unit: 'mm²', description: 'Minimum conductor cross-sectional area' },
      { name: 'deratedCapacity', label: 'Derated Current Capacity', unit: 'A', description: 'Current-carrying capacity after derating' },
      { name: 'voltageDropPercent', label: 'Voltage Drop', unit: '%', description: 'Estimated voltage drop at full load' },
      { name: 'verdict', label: 'Verdict', unit: '', description: 'Compliance status' },
    ],
    createdAt: new Date('2024-01-01'),
  };

  // Current-carrying capacity tables (A) per IEC 60364-5-52 Table B.52.1
  // [copper_air, copper_underground, copper_conduit, copper_multicore, aluminum_air, ...]
  private cableTable: Array<{ csa: number; copperAir: number; copperGround: number; copperConduit: number; copperMulticore: number; aluminumAir: number; aluminumGround: number }> = [
    { csa: 1.5, copperAir: 18.5, copperGround: 22, copperConduit: 15, copperMulticore: 16, aluminumAir: 0, aluminumGround: 0 },
    { csa: 2.5, copperAir: 25, copperGround: 30, copperConduit: 21, copperMulticore: 22, aluminumAir: 19, aluminumGround: 23 },
    { csa: 4, copperAir: 34, copperGround: 40, copperConduit: 28, copperMulticore: 30, aluminumAir: 25, aluminumGround: 30 },
    { csa: 6, copperAir: 43, copperGround: 50, copperConduit: 36, copperMulticore: 38, aluminumAir: 32, aluminumGround: 38 },
    { csa: 10, copperAir: 58, copperGround: 66, copperConduit: 49, copperMulticore: 51, aluminumAir: 43, aluminumGround: 50 },
    { csa: 16, copperAir: 77, copperGround: 84, copperConduit: 65, copperMulticore: 68, aluminumAir: 57, aluminumGround: 64 },
    { csa: 25, copperAir: 101, copperGround: 107, copperConduit: 86, copperMulticore: 89, aluminumAir: 75, aluminumGround: 82 },
    { csa: 35, copperAir: 122, copperGround: 127, copperConduit: 104, copperMulticore: 108, aluminumAir: 91, aluminumGround: 98 },
    { csa: 50, copperAir: 148, copperGround: 150, copperConduit: 126, copperMulticore: 131, aluminumAir: 110, aluminumGround: 116 },
    { csa: 70, copperAir: 183, copperGround: 183, copperConduit: 156, copperMulticore: 162, aluminumAir: 136, aluminumGround: 142 },
    { csa: 95, copperAir: 220, copperGround: 216, copperConduit: 188, copperMulticore: 196, aluminumAir: 164, aluminumGround: 168 },
    { csa: 120, copperAir: 253, copperGround: 246, copperConduit: 216, copperMulticore: 226, aluminumAir: 188, aluminumGround: 191 },
    { csa: 150, copperAir: 290, copperGround: 278, copperConduit: 248, copperMulticore: 259, aluminumAir: 216, aluminumGround: 217 },
    { csa: 185, copperAir: 330, copperGround: 312, copperConduit: 282, copperMulticore: 295, aluminumAir: 246, aluminumGround: 244 },
    { csa: 240, copperAir: 390, copperGround: 361, copperConduit: 334, copperMulticore: 349, aluminumAir: 291, aluminumGround: 283 },
    { csa: 300, copperAir: 445, copperGround: 408, copperConduit: 382, copperMulticore: 399, aluminumAir: 332, aluminumGround: 321 },
    { csa: 400, copperAir: 515, copperGround: 466, copperConduit: 443, copperMulticore: 463, aluminumAir: 385, aluminumGround: 368 },
  ];

  calculate(inputs: Record<string, number>): { outputs: Record<string, number>; intermediates: IntermediateValue[] } {
    const intermediates: IntermediateValue[] = [];
    const loadCurrent = inputs['loadCurrent']!;
    const cableLength = inputs['cableLength'] ?? 0;
    const ambientTemp = inputs['ambientTemp'] ?? 30;
    const material = inputs['conductorMaterial'] ?? 0;
    const installMethod = inputs['installationMethod'] ?? 0;
    const grouped = inputs['circuitsGrouped'] ?? 1;

    // Temperature derating factor per IEC 60364-5-52 (PVC insulation, 70°C)
    const baseTemp = 30;
    const maxOpTemp = 70;
    const tempFactor = ambientTemp === baseTemp ? 1 : Math.sqrt((maxOpTemp - ambientTemp) / (maxOpTemp - baseTemp));
    intermediates.push({ name: 'tempDeratingFactor', value: this.round(tempFactor, 4), unit: '', description: `Temperature derating for ${ambientTemp}°C ambient (base ${baseTemp}°C)`, formula: '√((70 - Ta) / (70 - 30))' });

    // Grouping derating factor per IEC 60364-5-52 Table B.52.17
    const groupingTable: Record<number, number> = { 1: 1, 2: 0.8, 3: 0.7, 4: 0.65, 5: 0.6, 6: 0.57, 7: 0.54, 8: 0.52, 9: 0.5, 10: 0.48, 15: 0.44, 20: 0.41 };
    const keys = Object.keys(groupingTable).map(Number).sort((a, b) => a - b);
    let groupFactor = groupingTable[1]!;
    for (const k of keys) {
      if (grouped >= k) groupFactor = groupingTable[k]!;
    }
    intermediates.push({ name: 'groupingDeratingFactor', value: this.round(groupFactor, 4), unit: '', description: `Grouping derating for ${grouped} circuits`, formula: 'Table B.52.17' });

    const totalDerating = tempFactor * groupFactor;
    intermediates.push({ name: 'totalDeratingFactor', value: this.round(totalDerating, 4), unit: '', description: 'Combined derating factor', formula: 'tempFactor × groupFactor' });

    const requiredCapacity = loadCurrent / totalDerating;
    intermediates.push({ name: 'requiredCapacity', value: this.round(requiredCapacity, 2), unit: 'A', description: 'Minimum required current-carrying capacity after derating', formula: 'loadCurrent / totalDerating' });

    // Select cable
    let selectedCsa = 0;
    let deratedCapacity = 0;
    for (const row of this.cableTable) {
      let baseCapacity: number;
      if (material === 0) {
        const cols = [row.copperAir, row.copperGround, row.copperConduit, row.copperMulticore];
        baseCapacity = cols[installMethod] ?? row.copperAir;
      } else {
        baseCapacity = installMethod === 1 ? row.aluminumGround : row.aluminumAir;
        if (baseCapacity === 0) continue;
      }
      const derated = baseCapacity * totalDerating;
      if (derated >= requiredCapacity) {
        selectedCsa = row.csa;
        deratedCapacity = this.round(derated, 2);
        break;
      }
    }

    if (selectedCsa === 0) {
      selectedCsa = this.cableTable[this.cableTable.length - 1]!.csa;
      deratedCapacity = 0;
    }

    intermediates.push({ name: 'selectedCsaRaw', value: selectedCsa, unit: 'mm²', description: `Selected cable size (material: ${material === 0 ? 'copper' : 'aluminum'}, method: ${['air','ground','conduit','multicore'][installMethod]})` });

    // Voltage drop estimation per IEC 60364-5-52 §525
    const resistancePerKm: Record<number, number> = material === 0
      ? { 1.5: 12.1, 2.5: 7.41, 4: 4.61, 6: 3.08, 10: 1.83, 16: 1.15, 25: 0.727, 35: 0.524, 50: 0.387, 70: 0.268, 95: 0.193, 120: 0.153, 150: 0.124, 185: 0.0991, 240: 0.0754, 300: 0.0601, 400: 0.047 }
      : { 2.5: 11.8, 4: 7.41, 6: 4.92, 10: 2.94, 16: 1.85, 25: 1.17, 35: 0.845, 50: 0.624, 70: 0.433, 95: 0.312, 120: 0.247, 150: 0.2, 185: 0.16, 240: 0.122, 300: 0.0972, 400: 0.0759 };

    const r = resistancePerKm[selectedCsa] ?? 0;
    const vd = 2 * cableLength / 1000 * loadCurrent * r;
    const vdPercent = 230 > 0 ? (vd / 230) * 100 : 0;

    intermediates.push({ name: 'resistancePerKm', value: r, unit: 'Ω/km', description: `AC resistance at ${selectedCsa} mm²` });
    intermediates.push({ name: 'voltageDropVolts', value: this.round(vd, 2), unit: 'V', description: 'Voltage drop at full load', formula: '2 × L × I × R / 1000' });

    const verdict = vdPercent <= 4 ? 1 : 0;

    return {
      outputs: { selectedCsa, deratedCapacity: Math.max(deratedCapacity, 0), voltageDropPercent: this.round(vdPercent, 2), verdict },
      intermediates,
    };
  }
}
