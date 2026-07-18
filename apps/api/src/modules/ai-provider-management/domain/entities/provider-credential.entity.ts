import { randomUUID } from 'crypto';

export type CredentialType = 'api_key' | 'org_id' | 'tenant_id' | 'custom_header';

export class ProviderCredentialEntity {
  private constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly credentialType: CredentialType,
    public readonly encryptedValue: string,
    public readonly maskedValue: string,
    public expiresAt: Date | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(
    providerId: string,
    credentialType: CredentialType,
    encryptedValue: string,
    maskedValue: string,
    expiresAt?: Date,
  ): ProviderCredentialEntity {
    const now = new Date();
    return new ProviderCredentialEntity(
      randomUUID(),
      providerId,
      credentialType,
      encryptedValue,
      maskedValue,
      expiresAt ?? null,
      now,
      now,
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    provider_id: string;
    credential_type: string;
    encrypted_value: string;
    masked_value: string;
    expires_at: Date | null;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }): ProviderCredentialEntity {
    return new ProviderCredentialEntity(
      data.id,
      data.provider_id,
      data.credential_type as CredentialType,
      data.encrypted_value,
      data.masked_value,
      data.expires_at,
      data.created_at,
      data.updated_at,
      data.deleted_at,
    );
  }

  isExpired(): boolean {
    return this.expiresAt !== null && this.expiresAt < new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }
}
