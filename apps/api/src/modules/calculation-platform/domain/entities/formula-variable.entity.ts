import { randomUUID } from 'crypto';

export type VariableType = 'number' | 'string' | 'boolean' | 'enum' | 'table';

export class FormulaVariableEntity {
  private constructor(
    public readonly id: string,
    public readonly formulaId: string,
    public name: string,
    public label: string | null,
    public type: VariableType,
    public unitId: string | null,
    public required: boolean,
    public defaultValue: unknown | null,
    public minValue: number | null,
    public maxValue: number | null,
    public enumValues: string[] | null,
    public description: string | null,
    public sortOrder: number,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    formulaId: string;
    name: string;
    label?: string | null;
    type?: VariableType;
    unitId?: string | null;
    required?: boolean;
    defaultValue?: unknown | null;
    minValue?: number | null;
    maxValue?: number | null;
    enumValues?: string[] | null;
    description?: string | null;
    sortOrder?: number;
  }): FormulaVariableEntity {
    return new FormulaVariableEntity(
      randomUUID(),
      data.formulaId,
      data.name,
      data.label ?? null,
      data.type ?? 'number',
      data.unitId ?? null,
      data.required ?? true,
      data.defaultValue ?? null,
      data.minValue ?? null,
      data.maxValue ?? null,
      data.enumValues ?? null,
      data.description ?? null,
      data.sortOrder ?? 0,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    formula_id: string;
    name: string;
    label: string | null;
    type: string;
    unit_id: string | null;
    required: boolean;
    default_value: unknown | null;
    min_value: number | null;
    max_value: number | null;
    enum_values: unknown | null;
    description: string | null;
    sort_order: number;
    created_at: Date;
  }): FormulaVariableEntity {
    return new FormulaVariableEntity(
      data.id,
      data.formula_id,
      data.name,
      data.label,
      data.type as VariableType,
      data.unit_id,
      data.required,
      data.default_value ?? null,
      data.min_value,
      data.max_value,
      data.enum_values ? (data.enum_values as string[]) : null,
      data.description,
      data.sort_order,
      data.created_at,
    );
  }
}
