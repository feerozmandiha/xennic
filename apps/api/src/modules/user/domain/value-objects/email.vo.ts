export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this.validate(value);
    this._value = value.toLowerCase();
  }

  static create(value: string): Email {
    return new Email(value);
  }

  static reconstitute(value: string): Email {
    return new Email(value);
  }

  private validate(value: string): void {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(value)) {
      throw new Error(`Invalid email format: ${value}`);
    }
    if (value.length > 255) {
      throw new Error('Email must not exceed 255 characters');
    }
  }

  get value(): string {
    return this._value;
  }

  equals(other: Email): boolean {
    return this._value === other._value;
  }
}