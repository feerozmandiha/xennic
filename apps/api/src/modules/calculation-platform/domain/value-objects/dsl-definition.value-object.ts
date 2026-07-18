export interface DslInput {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'enum' | 'table';
  unit?: string;
  required: boolean;
  defaultValue?: unknown;
  min?: number;
  max?: number;
  enumValues?: string[];
  description?: string;
}

export interface DslOutput {
  name: string;
  label: string;
  type: 'number' | 'string' | 'boolean' | 'table';
  unit?: string;
  description?: string;
}

export interface DslFormula {
  name: string;
  expression: string;
  description?: string;
  returnType?: 'number' | 'string' | 'boolean';
  variables?: string[];
}

export interface DslValidation {
  rule: string;
  expression: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface DslUnit {
  name: string;
  symbol: string;
  category: string;
}

export class DslDefinition {
  private constructor(
    public readonly id: string,
    public readonly version: string,
    public readonly standard: string | null,
    public readonly inputs: readonly DslInput[],
    public readonly outputs: readonly DslOutput[],
    public readonly formulas: readonly DslFormula[],
    public readonly validations: readonly DslValidation[],
    public readonly units: readonly DslUnit[],
    public readonly aiReview: boolean,
    public readonly certificate: boolean,
    public readonly metadata: Record<string, unknown>,
  ) {}

  static create(data: {
    id: string;
    version: string;
    standard?: string | null;
    inputs: DslInput[];
    outputs: DslOutput[];
    formulas: DslFormula[];
    validations?: DslValidation[];
    units?: DslUnit[];
    aiReview?: boolean;
    certificate?: boolean;
    metadata?: Record<string, unknown>;
  }): DslDefinition {
    return new DslDefinition(
      data.id,
      data.version,
      data.standard ?? null,
      Object.freeze([...data.inputs]),
      Object.freeze([...data.outputs]),
      Object.freeze([...data.formulas]),
      Object.freeze([...(data.validations ?? [])]),
      Object.freeze([...(data.units ?? [])]),
      data.aiReview ?? false,
      data.certificate ?? false,
      Object.freeze({ ...(data.metadata ?? {}) }),
    );
  }

  static fromJson(json: Record<string, unknown>): DslDefinition {
    return DslDefinition.create({
      id: json.id as string,
      version: json.version as string,
      standard: json.standard as string | undefined,
      inputs: (json.inputs as DslInput[]) ?? [],
      outputs: (json.outputs as DslOutput[]) ?? [],
      formulas: (json.formulas as DslFormula[]) ?? [],
      validations: json.validations as DslValidation[] | undefined,
      units: json.units as DslUnit[] | undefined,
      aiReview: json.aiReview as boolean | undefined,
      certificate: json.certificate as boolean | undefined,
      metadata: json.metadata as Record<string, unknown> | undefined,
    });
  }

  toJson(): Record<string, unknown> {
    return {
      id: this.id,
      version: this.version,
      standard: this.standard,
      inputs: [...this.inputs],
      outputs: [...this.outputs],
      formulas: [...this.formulas],
      validations: [...this.validations],
      units: [...this.units],
      aiReview: this.aiReview,
      certificate: this.certificate,
      metadata: { ...this.metadata },
    };
  }

  getInputNames(): string[] {
    return this.inputs.map((i) => i.name);
  }
  getOutputNames(): string[] {
    return this.outputs.map((o) => o.name);
  }
  getFormulaNames(): string[] {
    return this.formulas.map((f) => f.name);
  }
}
