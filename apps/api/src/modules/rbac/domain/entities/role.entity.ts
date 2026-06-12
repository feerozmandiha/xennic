import { RoleSlugVO } from '../value-objects/role-slug.vo.js';

export class RoleEntity {
  private constructor(
    public readonly id: string,
    private _name: string,
    private _slug: RoleSlugVO,
    private _description: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(name: string, slug: string, description?: string): RoleEntity {
    const now = new Date();
    return new RoleEntity(
      crypto.randomUUID(),
      name,
      RoleSlugVO.create(slug.toUpperCase()),
      description || null,
      now,
      now,
    );
  }

  static reconstitute(data: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): RoleEntity {
    return new RoleEntity(
      data.id,
      data.name,
      RoleSlugVO.create(data.slug),
      data.description,
      data.createdAt,
      data.updatedAt,
    );
  }

  updateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new Error('Role name must be at least 2 characters');
    }
    this._name = name;
    this.updatedAt = new Date();
  }

  updateDescription(description: string | null): void {
    this._description = description;
    this.updatedAt = new Date();
  }

  get name(): string { return this._name; }
  get slug(): string { return this._slug.value; }
  get description(): string | null { return this._description; }
}