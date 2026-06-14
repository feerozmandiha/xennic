import * as crypto from 'crypto';

export class RefreshTokenEntity {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly tokenHash: string,
    public expiresAt: Date,
    public revokedAt: Date | null,
    public readonly createdAt: Date,
  ) {}

  static create(userId: string, tokenHash: string, expiresInSeconds: number = 30 * 24 * 60 * 60): RefreshTokenEntity {
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
    return new RefreshTokenEntity(
      crypto.randomUUID(),
      userId,
      tokenHash,
      expiresAt,
      null,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    revokedAt: Date | null;
    createdAt: Date;
  }): RefreshTokenEntity {
    return new RefreshTokenEntity(
      data.id,
      data.userId,
      data.tokenHash,
      data.expiresAt,
      data.revokedAt,
      data.createdAt,
    );
  }

  revoke(): void {
    this.revokedAt = new Date();
  }

  isRevoked(): boolean {
    return this.revokedAt !== null;
  }

  isExpired(): boolean {
    return this.expiresAt < new Date();
  }

  isValid(): boolean {
    return !this.isRevoked() && !this.isExpired();
  }
}