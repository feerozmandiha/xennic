import { randomUUID } from 'crypto';

export class UnitConversionEntity {
  private constructor(
    public readonly id: string,
    public readonly fromUnitId: string,
    public readonly toUnitId: string,
    public factor: number,
    public offset: number,
    public formula: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    fromUnitId: string;
    toUnitId: string;
    factor: number;
    offset?: number;
    formula?: string | null;
  }): UnitConversionEntity {
    return new UnitConversionEntity(
      randomUUID(),
      data.fromUnitId,
      data.toUnitId,
      data.factor,
      data.offset ?? 0,
      data.formula ?? null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    from_unit_id: string;
    to_unit_id: string;
    factor: number;
    offset: number;
    formula: string | null;
    created_at: Date;
  }): UnitConversionEntity {
    return new UnitConversionEntity(
      data.id,
      data.from_unit_id,
      data.to_unit_id,
      data.factor,
      data.offset,
      data.formula,
      data.created_at,
    );
  }
}
