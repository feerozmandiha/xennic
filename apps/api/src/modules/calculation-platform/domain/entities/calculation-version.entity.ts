import { randomUUID } from 'crypto';
import type { DslDefinition } from '../value-objects/dsl-definition.value-object.js';

export type VersionStatus = 'draft' | 'active' | 'deprecated' | 'superseded';

export class CalculationVersionEntity {
  private constructor(
    public readonly id: string,
    public readonly definitionId: string,
    public readonly version: string,
    public status: VersionStatus,
    public readonly dslDefinition: DslDefinition,
    public changeLog: string | null,
    public publishedAt: Date | null,
    public readonly createdBy: string,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    definitionId: string;
    version: string;
    dslDefinition: DslDefinition;
    changeLog?: string | null;
    createdBy: string;
  }): CalculationVersionEntity {
    return new CalculationVersionEntity(
      randomUUID(),
      data.definitionId,
      data.version,
      'draft',
      data.dslDefinition,
      data.changeLog ?? null,
      null,
      data.createdBy,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    definition_id: string;
    version: string;
    status: string;
    dsl_definition: DslDefinition;
    change_log: string | null;
    published_at: Date | null;
    created_by: string;
    created_at: Date;
  }): CalculationVersionEntity {
    return new CalculationVersionEntity(
      data.id,
      data.definition_id,
      data.version,
      data.status as VersionStatus,
      data.dsl_definition,
      data.change_log,
      data.published_at,
      data.created_by,
      data.created_at,
    );
  }

  publish(): void { this.status = 'active'; this.publishedAt = new Date(); }
  deprecate(): void { this.status = 'deprecated'; }
  supersede(): void { this.status = 'superseded'; }
}
