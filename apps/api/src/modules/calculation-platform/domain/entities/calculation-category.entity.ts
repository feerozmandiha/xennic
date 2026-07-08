import { randomUUID } from 'crypto';

export class CalculationCategoryEntity {
  private constructor(
    public readonly id: string,
    public name: string,
    public readonly slug: string,
    public description: string | null,
    public parentId: string | null,
    public icon: string | null,
    public sortOrder: number,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    name: string;
    slug: string;
    description?: string | null;
    parentId?: string | null;
    icon?: string | null;
    sortOrder?: number;
  }): CalculationCategoryEntity {
    return new CalculationCategoryEntity(
      randomUUID(),
      data.name,
      data.slug,
      data.description ?? null,
      data.parentId ?? null,
      data.icon ?? null,
      data.sortOrder ?? 0,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    parent_id: string | null;
    icon: string | null;
    sort_order: number;
    created_at: Date;
    updated_at: Date;
  }): CalculationCategoryEntity {
    return new CalculationCategoryEntity(
      data.id,
      data.name,
      data.slug,
      data.description,
      data.parent_id,
      data.icon,
      data.sort_order,
      data.created_at,
      data.updated_at,
    );
  }

  update(data: Partial<{ name: string; description: string | null; icon: string | null; sortOrder: number }>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.icon !== undefined) this.icon = data.icon;
    if (data.sortOrder !== undefined) this.sortOrder = data.sortOrder;
    this.updatedAt = new Date();
  }
}
