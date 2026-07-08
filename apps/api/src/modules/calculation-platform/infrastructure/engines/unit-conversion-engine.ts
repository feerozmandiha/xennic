import { Injectable, Logger } from '@nestjs/common';
import { UNIT_CONVERSION_MATRIX } from '../../shared/constants/unit-categories.js';

@Injectable()
export class UnitConversionEngine {
  private readonly logger = new Logger(UnitConversionEngine.name);

  canConvert(fromUnit: string, toUnit: string): boolean {
    const from = this.findUnitInfo(fromUnit);
    const to = this.findUnitInfo(toUnit);
    if (!from || !to) return false;
    return from.category === to.category;
  }

  convert(value: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return value;

    const from = this.findUnitInfo(fromUnit);
    const to = this.findUnitInfo(toUnit);

    if (!from) throw new Error(`Unknown unit: ${fromUnit}`);
    if (!to) throw new Error(`Unknown unit: ${toUnit}`);
    if (from.category !== to.category) {
      throw new Error(`Incompatible units: cannot convert ${fromUnit} (${from.category}) to ${toUnit} (${to.category})`);
    }

    const baseValue = (value + from.offset) * from.factor;
    const result = (baseValue / to.factor) - to.offset;

    return result;
  }

  normalize(value: number, unit: string, category: string): { value: number; unit: string } {
    const categoryUnits = UNIT_CONVERSION_MATRIX[category];
    if (!categoryUnits) throw new Error(`Unknown unit category: ${category}`);

    const unitInfo = categoryUnits.units[unit];
    if (!unitInfo) throw new Error(`Unknown unit ${unit} in category ${category}`);

    const baseValue = (value + (unitInfo.offset ?? 0)) * unitInfo.factor;
    return { value: baseValue, unit: categoryUnits.base };
  }

  format(value: number, unit: string, precision: number = 4): string {
    const formatted = value.toFixed(precision);
    return `${formatted} ${unit}`;
  }

  private findUnitInfo(unit: string): { category: string; factor: number; offset: number } | null {
    for (const [category, info] of Object.entries(UNIT_CONVERSION_MATRIX)) {
      const unitInfo = info.units[unit];
      if (unitInfo) {
        return { category, factor: unitInfo.factor, offset: unitInfo.offset ?? 0 };
      }
    }
    return null;
  }

  getCategory(unit: string): string | null {
    const info = this.findUnitInfo(unit);
    return info ? info.category : null;
  }

  getBaseUnit(category: string): string | null {
    const cat = UNIT_CONVERSION_MATRIX[category];
    return cat ? cat.base : null;
  }
}
