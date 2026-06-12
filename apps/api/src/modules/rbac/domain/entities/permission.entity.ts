import { PermissionSlugVO } from '../value-objects/permission-slug.vo.js';

export class PermissionEntity {
  private constructor(
    public readonly id: string,
    private _name: string,
    private _slug: PermissionSlugVO,
    private _description: string | null,
    private _domain: string,
    public readonly createdAt: Date,
  ) {}

  static create(name: string, slug: string, domain: string, description?: string): PermissionEntity {
    return new PermissionEntity(
      crypto.randomUUID(),
      name,
      PermissionSlugVO.create(slug),
      description || null,
      domain,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    domain: string;
    createdAt: Date;
  }): PermissionEntity {
    return new PermissionEntity(
      data.id,
      data.name,
      PermissionSlugVO.create(data.slug),
      data.description,
      data.domain,
      data.createdAt,
    );
  }

  get name(): string { return this._name; }
  get slug(): string { return this._slug.value; }
  get description(): string | null { return this._description; }
  get domain(): string { return this._domain; }
}