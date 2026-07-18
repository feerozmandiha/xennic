import { randomUUID } from 'crypto';

export class FormulaDefinitionEntity {
  private constructor(
    public readonly id: string,
    public readonly definitionId: string | null,
    public readonly versionId: string | null,
    public name: string,
    public expression: string,
    public description: string | null,
    public returnType: string,
    public metadata: Record<string, unknown>,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    definitionId?: string | null;
    versionId?: string | null;
    name: string;
    expression: string;
    description?: string | null;
    returnType?: string;
    metadata?: Record<string, unknown>;
  }): FormulaDefinitionEntity {
    return new FormulaDefinitionEntity(
      randomUUID(),
      data.definitionId ?? null,
      data.versionId ?? null,
      data.name,
      data.expression,
      data.description ?? null,
      data.returnType ?? 'number',
      data.metadata ?? {},
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    definition_id: string | null;
    version_id: string | null;
    name: string;
    expression: string;
    description: string | null;
    return_type: string;
    metadata: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
  }): FormulaDefinitionEntity {
    return new FormulaDefinitionEntity(
      data.id,
      data.definition_id,
      data.version_id,
      data.name,
      data.expression,
      data.description,
      data.return_type,
      data.metadata,
      data.created_at,
      data.updated_at,
    );
  }

  update(
    data: Partial<{
      name: string;
      expression: string;
      description: string | null;
      returnType: string;
      metadata: Record<string, unknown>;
    }>,
  ): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.expression !== undefined) this.expression = data.expression;
    if (data.description !== undefined) this.description = data.description;
    if (data.returnType !== undefined) this.returnType = data.returnType;
    if (data.metadata !== undefined) this.metadata = data.metadata;
    this.updatedAt = new Date();
  }
}
