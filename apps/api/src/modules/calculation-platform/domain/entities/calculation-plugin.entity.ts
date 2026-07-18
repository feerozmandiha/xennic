import { randomUUID } from 'crypto';

export class CalculationPluginEntity {
  private constructor(
    public readonly id: string,
    public readonly slug: string,
    public name: string,
    public description: string | null,
    public version: string,
    public enabled: boolean,
    public config: Record<string, unknown>,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(data: {
    slug: string;
    name: string;
    description?: string | null;
    version: string;
    enabled?: boolean;
    config?: Record<string, unknown>;
  }): CalculationPluginEntity {
    return new CalculationPluginEntity(
      randomUUID(),
      data.slug,
      data.name,
      data.description ?? null,
      data.version,
      data.enabled ?? true,
      data.config ?? {},
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    slug: string;
    name: string;
    description: string | null;
    version: string;
    enabled: boolean;
    config: Record<string, unknown>;
    created_at: Date;
    updated_at: Date;
  }): CalculationPluginEntity {
    return new CalculationPluginEntity(
      data.id,
      data.slug,
      data.name,
      data.description,
      data.version,
      data.enabled,
      data.config,
      data.created_at,
      data.updated_at,
    );
  }

  enable(): void {
    this.enabled = true;
    this.updatedAt = new Date();
  }
  disable(): void {
    this.enabled = false;
    this.updatedAt = new Date();
  }
  update(
    data: Partial<{
      name: string;
      description: string | null;
      version: string;
      config: Record<string, unknown>;
    }>,
  ): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.version !== undefined) this.version = data.version;
    if (data.config !== undefined) this.config = data.config;
    this.updatedAt = new Date();
  }
}
