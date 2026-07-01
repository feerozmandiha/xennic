import { Injectable } from '@nestjs/common';
import { BaseFormula } from './base-formula.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';
import { FormulaCategory } from '../types/calculation.types.js';

@Injectable()
export class LoadEstimationFormula extends BaseFormula {
  definition: FormulaDefinition = {
    id: 'load-estimation-iec-60364',
    name: 'Load Estimation per IEC 60364',
    description: 'Estimates connected load, demand load, and diversified load for residential, commercial, and industrial installations per IEC 60364 and local codes.',
    version: '1.0.0',
    category: FormulaCategory.LOAD_ESTIMATION,
    status: 'active',
    standards: [
      { code: 'IEC 60364-1', title: 'Low-voltage electrical installations — Fundamental principles', clause: '§311 — Load assessment', version: '2020' },
      { code: 'ISIRI 17155', title: 'National electrical code of Iran', clause: 'Annex A — Load estimation tables', version: '2021' },
      { code: 'Tavanir 92-1', title: 'Tavanir distribution network design standards', clause: '§3 — Load diversity factors', version: '2019' },
    ],
    inputs: [
      { name: 'buildingType', label: 'Building Type', unit: '', description: '0=residential, 1=commercial, 2=industrial, 3=office', min: 0, max: 3, required: true },
      { name: 'totalArea', label: 'Total Floor Area', unit: 'm²', description: 'Total building floor area', min: 0, max: 1000000, required: true },
      { name: 'unitCount', label: 'Number of Units', unit: '', description: 'Number of dwelling units or tenants', min: 0, max: 10000, defaultValue: 1, required: false },
      { name: 'lightingLoadDensity', label: 'Lighting Load Density', unit: 'VA/m²', description: 'Lighting load per square meter', min: 0, max: 100, defaultValue: 15, required: false },
      { name: 'socketLoadDensity', label: 'Socket Load Density', unit: 'VA/m²', description: 'Socket outlet load per square meter', min: 0, max: 200, defaultValue: 30, required: false },
      { name: 'hvacLoad', label: 'HVAC Load', unit: 'kVA', description: 'Air conditioning/heating load', min: 0, max: 10000, defaultValue: 0, required: false },
      { name: 'elevatorLoad', label: 'Elevator Load', unit: 'kVA', description: 'Elevator/escalator load', min: 0, max: 1000, defaultValue: 0, required: false },
      { name: 'emergencyLoad', label: 'Emergency Load', unit: 'kVA', description: 'Emergency/safety systems load', min: 0, max: 10000, defaultValue: 0, required: false },
      { name: 'demandFactor', label: 'Overall Demand Factor', unit: '', description: 'Override demand factor (0-1). If 0, calculated automatically.', min: 0, max: 1, defaultValue: 0, required: false },
    ],
    outputs: [
      { name: 'connectedLoad', label: 'Connected Load', unit: 'kVA', description: 'Total connected load before diversity' },
      { name: 'demandLoad', label: 'Demand Load', unit: 'kVA', description: 'Maximum demand after diversity' },
      { name: 'lightingLoad', label: 'Lighting Load', unit: 'kVA', description: 'Lighting component' },
      { name: 'socketLoad', label: 'Socket Load', unit: 'kVA', description: 'Socket outlet component' },
      { name: 'diversityFactor', label: 'Diversity Factor', unit: '', description: 'Applied diversity factor' },
    ],
    createdAt: new Date('2024-01-01'),
  };

  calculate(inputs: Record<string, number>): { outputs: Record<string, number>; intermediates: IntermediateValue[] } {
    const intermediates: IntermediateValue[] = [];
    const bldgType = inputs['buildingType']!;
    const area = inputs['totalArea']!;
    const units = inputs['unitCount'] ?? 1;
    const lightingDensity = inputs['lightingLoadDensity'] ?? 15;
    const socketDensity = inputs['socketLoadDensity'] ?? 30;
    const hvac = inputs['hvacLoad'] ?? 0;
    const elevator = inputs['elevatorLoad'] ?? 0;
    const emergency = inputs['emergencyLoad'] ?? 0;
    const overrideDf = inputs['demandFactor'] ?? 0;

    const lighting = area * lightingDensity / 1000;
    const sockets = area * socketDensity / 1000;
    const hvacKva = hvac;
    const misc = elevator + emergency;
    intermediates.push({ name: 'lightingLoad', value: this.round(lighting, 2), unit: 'kVA', description: 'Lighting load based on density', formula: 'area × lightingDensity / 1000' });
    intermediates.push({ name: 'socketLoad', value: this.round(sockets, 2), unit: 'kVA', description: 'Socket load based on density', formula: 'area × socketDensity / 1000' });

    const connected = lighting + sockets + hvacKva + misc;
    intermediates.push({ name: 'connectedLoadTotal', value: this.round(connected, 2), unit: 'kVA', description: 'Total connected load', formula: 'lighting + sockets + HVAC + miscellaneous' });

    // Diversity per IEC 60364 and ISIRI 17155
    const diversityData: Record<number, { basic: number; hvac: number; perUnit: number }> = {
      0: { basic: 0.6, hvac: 0.8, perUnit: 0.5 }, // residential
      1: { basic: 0.7, hvac: 0.9, perUnit: 0.7 }, // commercial
      2: { basic: 0.8, hvac: 1, perUnit: 0.9 }, // industrial
      3: { basic: 0.65, hvac: 0.85, perUnit: 0.6 }, // office
    };
    const div = diversityData[bldgType] ?? diversityData[0]!;
    const unitFactor = units > 1 ? div.perUnit + (1 - div.perUnit) / units : 1;
    const demandBasic = (lighting + sockets + misc) * div.basic * unitFactor;
    const demandHvac = hvacKva * div.hvac;
    const demand = demandBasic + demandHvac;
    const df = overrideDf > 0 ? overrideDf : connected > 0 ? demand / connected : 0;

    intermediates.push({ name: 'diversityBasic', value: div.basic, unit: '', description: `Basic diversity factor for ${['residential','commercial','industrial','office'][bldgType]}` });
    intermediates.push({ name: 'unitDiversityFactor', value: this.round(unitFactor, 3), unit: '', description: 'Per-unit diversity correction', formula: 'DF_base + (1-DF_base)/n_units' });
    intermediates.push({ name: 'demandAfterDiversity', value: this.round(demand, 2), unit: 'kVA', description: 'Maximum demand after applying diversity' });

    return {
      outputs: {
        connectedLoad: this.round(connected, 1),
        demandLoad: this.round(demand, 1),
        lightingLoad: this.round(lighting, 1),
        socketLoad: this.round(sockets, 1),
        diversityFactor: this.round(df, 3),
      },
      intermediates,
    };
  }
}
