import { Injectable } from '@nestjs/common';
import { BaseFormula } from './base-formula.js';
import type { FormulaDefinition, IntermediateValue } from '../types/calculation.types.js';
import { FormulaCategory } from '../types/calculation.types.js';

@Injectable()
export class ProtectionCoordinationFormula extends BaseFormula {
  definition: FormulaDefinition = {
    id: 'protection-coordination-iec-60947',
    name: 'Protection Device Coordination per IEC 60947',
    description: 'Calculates protective device settings (MCCB/ACB/fuse) per IEC 60947-2. Determines pickup, time dial, and coordination intervals.',
    version: '1.0.0',
    category: FormulaCategory.PROTECTION_COORDINATION,
    status: 'active',
    standards: [
      { code: 'IEC 60947-2', title: 'Low-voltage switchgear and controlgear — Part 2: Circuit-breakers', clause: '§7 — Overcurrent protection', version: '2019' },
      { code: 'IEEE 242', title: 'IEEE Recommended Practice for Protection and Coordination', clause: 'Chapter 4 — Overcurrent Protection', version: '2001' },
    ],
    inputs: [
      { name: 'faultCurrent', label: 'Fault Current', unit: 'A', description: 'Maximum fault current at the device location', min: 0, max: 200000, required: true },
      { name: 'loadCurrent', label: 'Full Load Current', unit: 'A', description: 'Normal full load current', min: 0, max: 10000, required: true },
      { name: 'deviceType', label: 'Device Type', unit: '', description: '0=MCCB (fixed), 1=MCCB (adjustable), 2=ACB, 3=fuse, 4=relay+CB', min: 0, max: 4, defaultValue: 0, required: false },
      { name: 'cableCsa', label: 'Cable CSA', unit: 'mm²', description: 'Protected cable cross-section', min: 0, max: 1000, required: true },
      { name: 'cableMaterial', label: 'Cable Material', unit: '', description: '0=copper, 1=aluminum', min: 0, max: 1, defaultValue: 0, required: false },
      { name: 'coordinationType', label: 'Coordination Type', unit: '', description: '0=selective, 1=cascaded, 2=backup', min: 0, max: 2, defaultValue: 0, required: false },
    ],
    outputs: [
      { name: 'pickupSetting', label: 'Pickup Setting', unit: 'A', description: 'Long-time pickup current setting' },
      { name: 'timeDial', label: 'Time Dial Setting', unit: '', description: 'Time dial (TMS) for relay/ACB' },
      { name: 'instantaneousPickup', label: 'Instantaneous Pickup', unit: 'A', description: 'Instantaneous/magnetic pickup current' },
      { name: 'coordinationInterval', label: 'Coordination Interval', unit: 's', description: 'Selectivity time interval between devices' },
      { name: 'cableProtectionSafe', label: 'Cable Protection Safe', unit: '', description: '1=protected, 0=not protected' },
    ],
    createdAt: new Date('2024-01-01'),
  };

  calculate(inputs: Record<string, number>): { outputs: Record<string, number>; intermediates: IntermediateValue[] } {
    const intermediates: IntermediateValue[] = [];
    const If = inputs['faultCurrent']!;
    const Iload = inputs['loadCurrent']!;
    const deviceType = inputs['deviceType'] ?? 0;
    const csa = inputs['cableCsa']!;
    const material = inputs['cableMaterial'] ?? 0;
    const coordType = inputs['coordinationType'] ?? 0;

    // Pickup per IEC 60947-2: Ir ≥ 1.25 × Iload (cables)
    const pickupFactor = 1.25;
    const pickup = Iload * pickupFactor;
    intermediates.push({ name: 'pickupSettingRaw', value: this.round(pickup, 1), unit: 'A', description: 'Long-time pickup: 1.25 × Iload per IEC 60947-2' });

    // Standard pickup settings
    const standardPickups = [16, 20, 25, 32, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6300];
    let selectedPickup = standardPickups[standardPickups.length - 1]!;
    for (const sp of standardPickups) {
      if (sp >= pickup) { selectedPickup = sp; break; }
    }

    // Time dial based on coordination type
    const timeDial = deviceType === 4 ? (coordType === 0 ? 0.15 : coordType === 1 ? 0.05 : 0.1) : 1;
    intermediates.push({ name: 'timeDialSetting', value: timeDial, unit: '', description: `Time dial for device type ${['MCCB-fixed','MCCB-adj','ACB','fuse','relay+CB'][deviceType]}` });

    // Instantaneous pickup: 5-10× Iload
    const instPickup = deviceType === 3 ? 3 * pickup : coordType === 2 ? 8 * pickup : 5 * pickup;
    intermediates.push({ name: 'instantaneousPickup', value: this.round(instPickup, 1), unit: 'A', description: `Instantaneous pickup: ${instPickup / pickup}× Iload (IEC 60947-2)` });

    // Coordination interval per IEC 60947-2 (selectivity)
    const interval = deviceType === 4
      ? (coordType === 0 ? 0.3 : coordType === 1 ? 0.15 : 0.1)
      : deviceType === 3 ? 0.1 : 0.2;
    intermediates.push({ name: 'coordinationIntervalMs', value: interval * 1000, unit: 'ms', description: `Selectivity interval: ${interval}s (IEC 60947-2)` });

    // Cable withstand per IEC 60364-5-54
    const kConst = material === 0 ? 143 : 89; // k factor for PVC insulation
    const cableWithstand = csa * csa * kConst * kConst;
    const letThrough = If * If * 0.5; // assuming 500ms clearing
    const cableSafe = letThrough <= cableWithstand ? 1 : 0;
    intermediates.push({ name: 'cableWithstand', value: this.round(cableWithstand, 0), unit: 'A²s', description: 'Cable withstood energy I²t (k²S²)', formula: 'S² × k²' });
    intermediates.push({ name: 'letThroughEnergy', value: this.round(letThrough, 0), unit: 'A²s', description: 'Let-through energy I²t', formula: 'I²f × t_clearing' });

    return {
      outputs: {
        pickupSetting: selectedPickup,
        timeDial,
        instantaneousPickup: this.round(instPickup, 1),
        coordinationInterval: interval,
        cableProtectionSafe: cableSafe,
      },
      intermediates,
    };
  }
}
