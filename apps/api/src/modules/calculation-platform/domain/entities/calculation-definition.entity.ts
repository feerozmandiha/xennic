import { randomUUID } from 'crypto';

export type DefinitionStatus = 'draft' | 'active' | 'deprecated';

export class CalculationDefinitionEntity {
  private constructor(
    public readonly id: string,
    public readonly categoryId: string,
    public readonly slug: string,
    public name: string,
    public description: string | null,
    public standard: string | null,
    public standardRef: string | null,
    public enabled: boolean,
    public aiReview: boolean,
    public certificate: boolean,
    public metadata: Record<string, unknown>,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    categoryId: string;
    slug: string;
    name: string;
    description?: string | null;
    standard?: string | null;
    standardRef?: string | null;
    enabled?: boolean;
    aiReview?: boolean;
    certificate?: boolean;
    metadata?: Record<string, unknown>;
  }): CalculationDefinitionEntity {
    return new CalculationDefinitionEntity(
      randomUUID(),
      data.categoryId,
      data.slug,
      data.name,
      data.description ?? null,
      data.standard ?? null,
      data.standardRef ?? null,
      data.enabled ?? true,
      data.aiReview ?? false,
      data.certificate ?? false,
      data.metadata ?? {},
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    category_id: string;
    slug: string;
    name: string;
    description: string | null;
    standard: string | null;
    standard_ref: string | null;
    enabled: boolean;
    ai_review: boolean;
    certificate: boolean;
    metadata: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
  }): CalculationDefinitionEntity {
    return new CalculationDefinitionEntity(
      data.id,
      data.category_id,
      data.slug,
      data.name,
      data.description,
      data.standard,
      data.standard_ref,
      data.enabled,
      data.ai_review,
      data.certificate,
      data.metadata,
      data.created_at,
      data.updated_at,
    );
  }

  update(
    data: Partial<{
      name: string;
      description: string | null;
      standard: string | null;
      standardRef: string | null;
      enabled: boolean;
      aiReview: boolean;
      certificate: boolean;
      metadata: Record<string, unknown>;
    }>,
  ): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.standard !== undefined) this.standard = data.standard;
    if (data.standardRef !== undefined) this.standardRef = data.standardRef;
    if (data.enabled !== undefined) this.enabled = data.enabled;
    if (data.aiReview !== undefined) this.aiReview = data.aiReview;
    if (data.certificate !== undefined) this.certificate = data.certificate;
    if (data.metadata !== undefined) this.metadata = data.metadata;
    this.updatedAt = new Date();
  }

  enable(): void {
    this.enabled = true;
    this.updatedAt = new Date();
  }
  disable(): void {
    this.enabled = false;
    this.updatedAt = new Date();
  }
}
