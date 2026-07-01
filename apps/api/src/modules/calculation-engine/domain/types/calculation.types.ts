// ── Units ─────────────────────────────────────────────────────────────

export enum SiBaseUnit {
  METER = 'm', KILOGRAM = 'kg', SECOND = 's', AMPERE = 'A',
  KELVIN = 'K', MOLE = 'mol', CANDELA = 'cd',
}

export enum SiPrefix {
  TERA = 1e12, GIGA = 1e9, MEGA = 1e6, KILO = 1e3,
  MILLI = 1e-3, MICRO = 1e-6, NANO = 1e-9, PICO = 1e-12,
}

export interface UnitDefinition {
  name: string;
  symbol: string;
  siFactor: number; // multiply by this to convert to SI base
  siBase: string; // dimensional formula, e.g. "kg·m²·s⁻³·A⁻¹" for volt
  category: UnitCategory;
}

export enum UnitCategory {
  LENGTH = 'length', MASS = 'mass', TIME = 'time',
  ELECTRIC_CURRENT = 'electric_current', TEMPERATURE = 'temperature',
  AREA = 'area', VOLUME = 'volume',
  VOLTAGE = 'voltage', CURRENT = 'current', POWER = 'power',
  ENERGY = 'energy', RESISTANCE = 'resistance', IMPEDANCE = 'impedance',
  FREQUENCY = 'frequency', CAPACITANCE = 'capacitance', INDUCTANCE = 'inductance',
  ANGLE = 'angle', DIMENSIONLESS = 'dimensionless',
  DERATING = 'derating', TEMPERATURE_COEFF = 'temperature_coeff',
  LOADING = 'loading', CROSS_SECTION = 'cross_section',
}

export interface DimensionalValue {
  value: number;
  unit: string;
  siValue: number; // canonical SI value
  uncertainty?: number;
}

// ── Formulas ──────────────────────────────────────────────────────────

export type FormulaStatus = 'active' | 'deprecated' | 'superseded';

export interface StandardReference {
  code: string; // e.g. 'IEC 60364-5-52'
  title: string;
  clause: string;
  version: string;
  evidenceUrl?: string;
}

export interface FormulaParameter {
  name: string;
  label: string;
  unit: string;
  description: string;
  min?: number;
  max?: number;
  defaultValue?: number;
  required: boolean;
}

export interface FormulaOutput {
  name: string;
  label: string;
  unit: string;
  description: string;
}

export interface FormulaDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: FormulaCategory;
  status: FormulaStatus;
  standards: StandardReference[];
  inputs: FormulaParameter[];
  outputs: FormulaOutput[];
  supersededBy?: string;
  deprecatedAt?: Date;
  createdAt: Date;
}

export enum FormulaCategory {
  CABLE_SIZING = 'cable_sizing',
  VOLTAGE_DROP = 'voltage_drop',
  SHORT_CIRCUIT = 'short_circuit',
  TRANSFORMER_SIZING = 'transformer_sizing',
  GROUNDING = 'grounding',
  PROTECTION_COORDINATION = 'protection_coordination',
  HARMONIC = 'harmonic',
  POWER_FACTOR = 'power_factor',
  LOAD_ESTIMATION = 'load_estimation',
}

// ── Calculation Request / Result ──────────────────────────────────────

export interface CalculationRequest {
  formulaId: string;
  inputs: Record<string, number>;
  options?: {
    precision?: number;
    sensitivityAnalysis?: boolean;
    uncertaintyAnalysis?: boolean;
    sensitivityVariation?: number;
    confidenceLevel?: number;
  };
}

export interface IntermediateValue {
  name: string;
  value: number;
  unit: string;
  description: string;
  formula?: string;
}

export interface CalculationResult {
  id: string;
  formulaId: string;
  formulaName: string;
  formulaVersion: string;
  inputs: Record<string, { value: number; unit: string }>;
  outputs: Record<string, { value: number; unit: string }>;
  intermediates: IntermediateValue[];
  standardReferences: StandardReference[];
  validation: ValidationResult;
  sensitivity?: SensitivityResult[];
  uncertainty?: UncertaintyResult;
  audit: AuditRecord;
  timestamp: number;
  duration: number;
  checksum: string;
}

// ── Validation ────────────────────────────────────────────────────────

export interface ValidationResult {
  passed: boolean;
  inputChecks: ValidationCheck[];
  outputChecks: ValidationCheck[];
  physicalConsistency: boolean;
}

export interface ValidationCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'info' | 'warning' | 'error';
  value?: number;
  min?: number;
  max?: number;
}

// ── Sensitivity Analysis ──────────────────────────────────────────────

export interface SensitivityResult {
  parameter: string;
  baseValue: number;
  variedValue: number;
  outputImpacts: Array<{
    output: string;
    baseResult: number;
    variedResult: number;
    sensitivity: number; // % change in output / % change in input
  }>;
  impactFactor: number; // average |sensitivity| across all outputs
}

// ── Uncertainty Analysis ──────────────────────────────────────────────

export interface UncertaintyResult {
  inputs: Array<{
    name: string;
    nominal: number;
    uncertainty: number;
    distribution: 'uniform' | 'normal';
  }>;
  outputs: Array<{
    name: string;
    nominal: number;
    ciLower: number;
    ciUpper: number;
    confidenceLevel: number;
  }>;
  assumptionLog: AssumptionEntry[];
}

export interface AssumptionEntry {
  parameter: string;
  assumption: string;
  impact: 'low' | 'medium' | 'high';
  verified: boolean;
}

// ── Audit ─────────────────────────────────────────────────────────────

export interface AuditRecord {
  executionId: string;
  formulaId: string;
  formulaVersion: string;
  inputs: Record<string, { value: number; unit: string }>;
  intermediates: IntermediateValue[];
  outputs: Record<string, { value: number; unit: string }>;
  standards: StandardReference[];
  unitConversions: Array<{ from: string; to: string; factor: number }>;
  executionTrace: ExecutionTraceEntry[];
  timestamp: number;
  duration: number;
  checksum: string;
}

export interface ExecutionTraceEntry {
  step: number;
  operation: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  duration: number;
}

// ── Orchestrator ─────────────────────────────────────────────────────

export interface CalculationEngineQuery {
  formulaId: string;
  inputs: Record<string, number>;
  workspaceId: string;
  options?: {
    precision?: number;
    sensitivityAnalysis?: boolean;
    uncertaintyAnalysis?: boolean;
    sensitivityVariation?: number;
    confidenceLevel?: number;
  };
}

export interface CalculationEngineResponse {
  success: boolean;
  data?: CalculationResult;
  error?: string;
}
