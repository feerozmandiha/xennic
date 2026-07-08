import { randomUUID } from 'crypto';

export class UnitDefinitionEntity {
  private constructor(
    public readonly id: string,
    public category: string,
    public name: string,
    public symbol: string,
    public baseUnit: string,
    public factor: number,
    public offset: number,
    public description: string | null,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    category: string;
    name: string;
    symbol: string;
    baseUnit: string;
    factor: number;
    offset?: number;
    description?: string | null;
  }): UnitDefinitionEntity {
    return new UnitDefinitionEntity(
      randomUUID(),
      data.category,
      data.name,
      data.symbol,
      data.baseUnit,
      data.factor,
      data.offset ?? 0,
      data.description ?? null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    category: string;
    name: string;
    symbol: string;
    base_unit: string;
    factor: number;
    offset: number;
    description: string | null;
    created_at: Date;
  }): UnitDefinitionEntity {
    return new UnitDefinitionEntity(
      data.id,
      data.category,
      data.name,
      data.symbol,
      data.base_unit,
      data.factor,
      data.offset,
      data.description,
      data.created_at,
    );
  }
}
