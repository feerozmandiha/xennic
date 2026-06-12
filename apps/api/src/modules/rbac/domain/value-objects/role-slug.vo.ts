export class RoleSlugVO {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  static create(value: string): RoleSlugVO {
    return new RoleSlugVO(value);
  }

  private validate(value: string): void {
    if (!value || value.length < 3) {
      throw new Error('Role slug must be at least 3 characters');
    }
    if (!/^[A-Z_]+$/.test(value)) {
      throw new Error('Role slug must contain only uppercase letters and underscores');
    }
  }

  get value(): string {
    return this._value;
  }
}