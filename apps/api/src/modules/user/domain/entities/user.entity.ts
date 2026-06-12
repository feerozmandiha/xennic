import { Email } from '../value-objects/email.vo.js';
import { Password } from '../value-objects/password.vo.js';

export class UserEntity {
  private constructor(
    public readonly id: string,
    private _email: Email,
    private _password: Password,
    private _firstName: string,
    private _lastName: string,
    private _phone: string | null,
    private _avatarFileId: string | null,
    private _status: string,
    private _emailVerifiedAt: Date | null,
    private _lastLoginAt: Date | null,
    private _createdBy: string | null,
    private _updatedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(
    email: string,
    plainPassword: string,
    firstName: string,
    lastName: string,
    phone?: string,
    createdBy?: string,
  ): UserEntity {
    const now = new Date();

    return new UserEntity(
      crypto.randomUUID(),
      Email.create(email),
      Password.create(plainPassword),
      firstName.trim(),
      lastName.trim(),
      phone?.trim() || null,
      null,
      'active',
      null,
      null,
      createdBy || null,
      null,
      now,
      now,
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone: string | null;
    avatarFileId: string | null;
    status: string;
    emailVerifiedAt: Date | null;
    lastLoginAt: Date | null;
    createdBy: string | null;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): UserEntity {
    return new UserEntity(
      data.id,
      Email.reconstitute(data.email),
      Password.reconstitute(data.passwordHash),
      data.firstName,
      data.lastName,
      data.phone,
      data.avatarFileId,
      data.status,
      data.emailVerifiedAt,
      data.lastLoginAt,
      data.createdBy,
      data.updatedBy,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
    );
  }

  // ─── Getters ────────────────────────────────────────────────────────────────

  get email(): string { return this._email.value; }
  get emailValue(): Email { return this._email; }
  get password(): Password { return this._password; }
  get firstName(): string { return this._firstName; }

  // BUG FIX: was `return this._firstName + ' ' + this._lastName`
  get lastName(): string { return this._lastName; }

  get fullName(): string { return `${this._firstName} ${this._lastName}`; }

  get phone(): string | null { return this._phone; }
  get avatarFileId(): string | null { return this._avatarFileId; }
  get status(): string { return this._status; }
  get emailVerifiedAt(): Date | null { return this._emailVerifiedAt; }
  get lastLoginAt(): Date | null { return this._lastLoginAt; }
  get createdBy(): string | null { return this._createdBy; }
  get updatedBy(): string | null { return this._updatedBy; }

  // ─── Business Methods ────────────────────────────────────────────────────────

  updateProfile(firstName: string, lastName: string, updatedBy: string): void {
    if (!firstName || firstName.trim().length < 2) {
      throw new Error('First name must be at least 2 characters');
    }
    if (!lastName || lastName.trim().length < 2) {
      throw new Error('Last name must be at least 2 characters');
    }
    this._firstName = firstName.trim();
    this._lastName = lastName.trim();
    this._updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  updateEmail(newEmail: string, updatedBy: string): void {
    this._email = Email.create(newEmail);
    this._emailVerifiedAt = null;
    this._updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  updatePhone(phone: string | null, updatedBy: string): void {
    this._phone = phone;
    this._updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  updatePassword(newPassword: Password, updatedBy: string): void {
    this._password = newPassword;
    this._updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  verifyEmail(): void {
    this._emailVerifiedAt = new Date();
    this.updatedAt = new Date();
  }

  recordLogin(): void {
    this._lastLoginAt = new Date();
    this.updatedAt = new Date();
  }

  softDelete(deletedBy: string): void {
    this.deletedAt = new Date();
    this._updatedBy = deletedBy;
    this.updatedAt = new Date();
  }

  restore(restoredBy: string): void {
    this.deletedAt = null;
    this._updatedBy = restoredBy;
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }

  isActive(): boolean {
    return this._status === 'active' && !this.isDeleted();
  }

  setPasswordHash(hash: string): void {
    (this._password as any).setHash(hash);
  }

  needsPasswordHashing(): boolean {
    return this._password.needsHashing();
  }
}
