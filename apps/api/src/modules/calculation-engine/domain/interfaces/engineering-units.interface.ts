import type { DimensionalValue, UnitDefinition } from '../types/calculation.types.js';

export interface IEngineeringUnits {
  getUnit(symbol: string): UnitDefinition | null;
  convert(value: number, fromUnit: string, toUnit: string): DimensionalValue;
  toSi(value: number, unit: string): DimensionalValue;
  fromSi(siValue: number, targetUnit: string): DimensionalValue;
  areCompatible(unitA: string, unitB: string): boolean;
  listUnits(category?: string): UnitDefinition[];
}
