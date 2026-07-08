export type DslInputType = 'number' | 'string' | 'boolean' | 'enum' | 'table';
export type DslOutputType = 'number' | 'string' | 'boolean' | 'table';
export type DslSeverity = 'error' | 'warning' | 'info';
export type VersionStatus = 'draft' | 'active' | 'deprecated' | 'superseded';

export interface DslInputSchema {
  name: string;
  label: string;
  type: DslInputType;
  unit?: string;
  required: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  enumValues?: string[];
  description?: string;
}

export interface DslOutputSchema {
  name: string;
  label: string;
  type: DslOutputType;
  unit?: string;
  description?: string;
}

export interface DslFormulaSchema {
  name: string;
  expression: string;
  description?: string;
  returnType?: DslOutputType;
  variables?: string[];
}

export interface DslValidationRule {
  rule: string;
  expression: string;
  message: string;
  severity: DslSeverity;
}

export interface DslUnitSchema {
  name: string;
  symbol: string;
  category: string;
}

export interface CalculationDsl {
  id: string;
  version: string;
  standard?: string;
  inputs: DslInputSchema[];
  outputs: DslOutputSchema[];
  formulas: DslFormulaSchema[];
  validation?: DslValidationRule[];
  units?: DslUnitSchema[];
  aiReview?: boolean;
  certificate?: boolean;
  metadata?: Record<string, unknown>;
}
