export class Password {
  private readonly _value: string;
  private readonly _hash: string;

  private constructor(value: string, hash?: string) {
    if (hash) {
      // Reconstitute from database
      this._hash = hash;
      this._value = '';
    } else {
      // Create new password
      this.validate(value);
      this._value = value;
      this._hash = ''; // Will be hashed by service
    }
  }

  static create(plainText: string): Password {
    return new Password(plainText);
  }

  static reconstitute(hash: string): Password {
    return new Password('', hash);
  }

  private validate(value: string): void {
    if (value.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }
    if (value.length > 128) {
      throw new Error('Password must not exceed 128 characters');
    }
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!strongPasswordRegex.test(value)) {
      throw new Error(
        'Password must contain at least one uppercase, one lowercase, one number, and one special character',
      );
    }
  }

  get value(): string {
    if (!this._value) {
      throw new Error('Cannot access plain text password from hash');
    }
    return this._value;
  }

  get hash(): string {
    if (!this._hash && this._value) {
      throw new Error('Password not yet hashed');
    }
    return this._hash;
  }

  setHash(hash: string): void {
    (this as any)._hash = hash;
  }

  needsHashing(): boolean {
    return !!this._value && !this._hash;
  }
}