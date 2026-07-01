import { Injectable } from '@nestjs/common';
import { BaseFormula } from './base-formula.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';
import { FormulaCategory } from '../types/calculation.types.js';

@Injectable()
export class TransformerSizingFormula extends BaseFormula {
  definition: FormulaDefinition = {
    id: 'transformer-sizing-iec-60076',
    name: 'Transformer Sizing per IEC 60076',
    description: 'Selects transformer rated power based on connected load, demand factor, and future growth allowance. Standard kVA ratings per IEC 60076-1.',
    version: '1.0.0',
    category: FormulaCategory.TRANSFORMER_SIZING,
    status: 'active',
    standards: [
      { code: 'IEC 60076-1', title: 'Power transformers — Part 1: General', clause: '§5 — Rated quantities', version: '2011' },
      { code: 'IEEE C57.110', title: 'IEEE Recommended Practice for Establishing Transformer Capability', clause: '§4 — Loading', version: '2018' },
    ],
    inputs: [
      { name: 'connectedLoad', label: 'Connected Load', unit: 'kVA', description: 'Total connected load in kVA', min: 0, max: 1000000, required: true },
      { name: 'demandFactor', label: 'Demand Factor', unit: '', description: 'Demand factor (0-1)', min: 0.1, max: 1, defaultValue: 0.8, required: false },
      { name: 'futureGrowth', label: 'Future Growth Factor', unit: '', description: 'Future load growth allowance (e.g. 1.2 = 20%)', min: 1, max: 3, defaultValue: 1.15, required: false },
      { name: 'primaryVoltage', label: 'Primary Voltage', unit: 'V', description: 'Primary side nominal voltage', min: 0, max: 800000, required: true },
      { name: 'secondaryVoltage', label: 'Secondary Voltage', unit: 'V', description: 'Secondary side nominal voltage', min: 0, max: 100000, required: true },
      { name: 'coolingType', label: 'Cooling Type', unit: '', description: '0=ONAN (oil natural), 1=ONAF (oil/forced air), 2=OFWF (oil/forced water)', min: 0, max: 2, defaultValue: 0, required: false },
      { name: 'ambientTemp', label: 'Ambient Temperature', unit: '°C', description: 'Maximum ambient temperature', min: -40, max: 55, defaultValue: 40, required: false },
    ],
    outputs: [
      { name: 'requiredKva', label: 'Required Rating', unit: 'kVA', description: 'Minimum transformer rated power' },
      { name: 'selectedKva', label: 'Selected Standard Rating', unit: 'kVA', description: 'Nearest standard rating (≥ required)' },
      { name: 'loadingPercent', label: 'Loading', unit: '%', description: 'Initial loading as percentage of rated' },
    ],
    createdAt: new Date('2024-01-01'),
  };

  private standardRatings = [50, 100, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000, 20000, 25000, 31500, 40000, 50000, 63000, 80000, 100000];

  calculate(inputs: Record<string, number>): { outputs: Record<string, number>; intermediates: IntermediateValue[] } {
    const intermediates: IntermediateValue[] = [];
    const load = inputs['connectedLoad']!;
    const demand = inputs['demandFactor'] ?? 0.8;
    const growth = inputs['futureGrowth'] ?? 1.15;
    const primary = inputs['primaryVoltage']!;
    const secondary = inputs['secondaryVoltage']!;
    const cooling = inputs['coolingType'] ?? 0;
    const ambient = inputs['ambientTemp'] ?? 40;

    const demandLoad = load * demand;
    intermediates.push({ name: 'demandLoad', value: this.round(demandLoad, 2), unit: 'kVA', description: 'Load after demand factor', formula: 'connectedLoad × demandFactor' });

    const required = demandLoad * growth;
    intermediates.push({ name: 'requiredRaw', value: this.round(required, 2), unit: 'kVA', description: 'Required capacity including growth', formula: 'demandLoad × futureGrowth' });

    // Cooling derating
    const coolingFactor = cooling === 0 ? 1 : cooling === 1 ? 1.15 : 1.25;
    const tempDerating = ambient > 30 ? 1 - (ambient - 30) * 0.005 : 1;
    const adjustedRequired = required / (coolingFactor * tempDerating);
    intermediates.push({ name: 'coolingFactor', value: coolingFactor, unit: '', description: `Cooling type factor: ${['ONAN','ONAF','OFWF'][cooling]}` });
    intermediates.push({ name: 'tempDeratingFactor', value: this.round(tempDerating, 4), unit: '', description: 'Temperature derating for ambient >30°C' });
    intermediates.push({ name: 'adjustedRequired', value: this.round(adjustedRequired, 2), unit: 'kVA', description: 'Required rating after cooling & temp adjustment' });

    let selected = this.standardRatings[this.standardRatings.length - 1]!;
    for (const r of this.standardRatings) {
      if (r >= adjustedRequired) { selected = r; break; }
    }

    const loading = (required / selected) * 100;

    return {
      outputs: { requiredKva: this.round(required, 1), selectedKva: selected, loadingPercent: this.round(loading, 1) },
      intermediates,
    };
  }
}
