export const UNIT_CATEGORIES = [
  'voltage',
  'current',
  'power',
  'energy',
  'resistance',
  'impedance',
  'temperature',
  'pressure',
  'length',
  'weight',
  'force',
  'speed',
  'frequency',
  'time',
  'area',
  'volume',
  'mass',
] as const;

export type UnitCategory = (typeof UNIT_CATEGORIES)[number];

export interface UnitInfo {
  name: string;
  symbol: string;
  category: UnitCategory;
  baseUnit: string;
  factor: number;
  offset: number;
}

export interface ConversionResult {
  value: number;
  fromUnit: string;
  toUnit: string;
  precision?: number;
}

export const SI_PREFIXES: Record<string, number> = {
  p: 1e-12,
  n: 1e-9,
  μ: 1e-6,
  u: 1e-6,
  m: 1e-3,
  c: 1e-2,
  d: 1e-1,
  da: 1e1,
  h: 1e2,
  k: 1e3,
  M: 1e6,
  G: 1e9,
  T: 1e12,
};
