export class PermissionSlugVO {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value;
  }

  static create(value: string): PermissionSlugVO {
    return new PermissionSlugVO(value);
  }

  private validate(value: string): void {
    const slugRegex = /^[a-z]+\.[a-z_]+$/;
    if (!slugRegex.test(value)) {
      throw new Error(`Invalid permission slug format: ${value}`);
    }
  }

  get value(): string {
    return this._value;
  }
}