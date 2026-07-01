import { Injectable } from '@nestjs/common';
import type { IEngineeringUnits } from '../../domain/interfaces/engineering-units.interface.js';
import type { DimensionalValue, UnitDefinition } from '../../domain/types/calculation.types.js';
import { UnitCategory } from '../../domain/types/calculation.types.js';

const UNITS: UnitDefinition[] = [
  { name: 'meter', symbol: 'm', siFactor: 1, siBase: 'm', category: UnitCategory.LENGTH },
  { name: 'kilometer', symbol: 'km', siFactor: 1000, siBase: 'm', category: UnitCategory.LENGTH },
  { name: 'centimeter', symbol: 'cm', siFactor: 0.01, siBase: 'm', category: UnitCategory.LENGTH },
  { name: 'millimeter', symbol: 'mm', siFactor: 0.001, siBase: 'm', category: UnitCategory.LENGTH },
  { name: 'square millimeter', symbol: 'mm²', siFactor: 1e-6, siBase: 'm²', category: UnitCategory.CROSS_SECTION },
  { name: 'square meter', symbol: 'm²', siFactor: 1, siBase: 'm²', category: UnitCategory.AREA },
  { name: 'ampere', symbol: 'A', siFactor: 1, siBase: 'A', category: UnitCategory.ELECTRIC_CURRENT },
  { name: 'kiloampere', symbol: 'kA', siFactor: 1000, siBase: 'A', category: UnitCategory.CURRENT },
  { name: 'milliampere', symbol: 'mA', siFactor: 0.001, siBase: 'A', category: UnitCategory.CURRENT },
  { name: 'volt', symbol: 'V', siFactor: 1, siBase: 'kg·m²·s⁻³·A⁻¹', category: UnitCategory.VOLTAGE },
  { name: 'kilovolt', symbol: 'kV', siFactor: 1000, siBase: 'kg·m²·s⁻³·A⁻¹', category: UnitCategory.VOLTAGE },
  { name: 'millivolt', symbol: 'mV', siFactor: 0.001, siBase: 'kg·m²·s⁻³·A⁻¹', category: UnitCategory.VOLTAGE },
  { name: 'watt', symbol: 'W', siFactor: 1, siBase: 'kg·m²·s⁻³', category: UnitCategory.POWER },
  { name: 'kilowatt', symbol: 'kW', siFactor: 1000, siBase: 'kg·m²·s⁻³', category: UnitCategory.POWER },
  { name: 'megawatt', symbol: 'MW', siFactor: 1e6, siBase: 'kg·m²·s⁻³', category: UnitCategory.POWER },
  { name: 'volt-ampere', symbol: 'VA', siFactor: 1, siBase: 'kg·m²·s⁻³', category: UnitCategory.POWER },
  { name: 'kilovolt-ampere', symbol: 'kVA', siFactor: 1000, siBase: 'kg·m²·s⁻³', category: UnitCategory.POWER },
  { name: 'megavolt-ampere', symbol: 'MVA', siFactor: 1e6, siBase: 'kg·m²·s⁻³', category: UnitCategory.POWER },
  { name: 'volt-ampere reactive', symbol: 'VAR', siFactor: 1, siBase: 'kg·m²·s⁻³', category: UnitCategory.POWER },
  { name: 'kilovar', symbol: 'kVAR', siFactor: 1000, siBase: 'kg·m²·s⁻³', category: UnitCategory.POWER },
  { name: 'ohm', symbol: 'Ω', siFactor: 1, siBase: 'kg·m²·s⁻³·A⁻²', category: UnitCategory.RESISTANCE },
  { name: 'milliohm', symbol: 'mΩ', siFactor: 0.001, siBase: 'kg·m²·s⁻³·A⁻²', category: UnitCategory.RESISTANCE },
  { name: 'hertz', symbol: 'Hz', siFactor: 1, siBase: 's⁻¹', category: UnitCategory.FREQUENCY },
  { name: 'second', symbol: 's', siFactor: 1, siBase: 's', category: UnitCategory.TIME },
  { name: 'millisecond', symbol: 'ms', siFactor: 0.001, siBase: 's', category: UnitCategory.TIME },
  { name: 'minute', symbol: 'min', siFactor: 60, siBase: 's', category: UnitCategory.TIME },
  { name: 'degree Celsius', symbol: '°C', siFactor: 1, siBase: 'K', category: UnitCategory.TEMPERATURE },
  { name: 'percent', symbol: '%', siFactor: 0.01, siBase: '', category: UnitCategory.DIMENSIONLESS },
  { name: 'per unit', symbol: 'pu', siFactor: 1, siBase: '', category: UnitCategory.DIMENSIONLESS },
  { name: 'ratio', symbol: '', siFactor: 1, siBase: '', category: UnitCategory.DIMENSIONLESS },
];

@Injectable()
export class EngineeringUnits implements IEngineeringUnits {
  private unitsBySymbol: Map<string, UnitDefinition>;

  constructor() {
    this.unitsBySymbol = new Map(UNITS.map((u) => [u.symbol, u]));
  }

  getUnit(symbol: string): UnitDefinition | null {
    return this.unitsBySymbol.get(symbol) ?? null;
  }

  convert(value: number, fromUnit: string, toUnit: string): DimensionalValue {
    const from = this.unitsBySymbol.get(fromUnit);
    const to = this.unitsBySymbol.get(toUnit);
    if (!from || !to) {
      throw new Error(`Unknown unit: ${!from ? fromUnit : toUnit}`);
    }
    if (!this.areCompatible(fromUnit, toUnit)) {
      throw new Error(`Incompatible units: ${fromUnit} → ${toUnit} (${from.siBase} vs ${to.siBase})`);
    }
    const siValue = value * from.siFactor;
    const converted = siValue / to.siFactor;
    return { value: this.round(converted), unit: toUnit, siValue: this.round(siValue) };
  }

  toSi(value: number, unit: string): DimensionalValue {
    const def = this.unitsBySymbol.get(unit);
    if (!def) throw new Error(`Unknown unit: ${unit}`);
    const siValue = value * def.siFactor;
    return { value: this.round(value), unit, siValue: this.round(siValue) };
  }

  fromSi(siValue: number, targetUnit: string): DimensionalValue {
    const def = this.unitsBySymbol.get(targetUnit);
    if (!def) throw new Error(`Unknown unit: ${targetUnit}`);
    const converted = siValue / def.siFactor;
    return { value: this.round(converted), unit: targetUnit, siValue: this.round(siValue) };
  }

  areCompatible(unitA: string, unitB: string): boolean {
    const a = this.unitsBySymbol.get(unitA);
    const b = this.unitsBySymbol.get(unitB);
    if (!a || !b) return false;
    if (a.siBase === b.siBase) return true;
    if (a.category === UnitCategory.CROSS_SECTION && b.category === UnitCategory.AREA) return true;
    if (a.category === UnitCategory.AREA && b.category === UnitCategory.CROSS_SECTION) return true;
    return false;
  }

  listUnits(category?: string): UnitDefinition[] {
    if (category) return UNITS.filter((u) => u.category === category || u.name.toLowerCase().includes(category.toLowerCase()));
    return UNITS;
  }

  private round(n: number): number {
    return Math.round(n * 1e10) / 1e10;
  }
}
