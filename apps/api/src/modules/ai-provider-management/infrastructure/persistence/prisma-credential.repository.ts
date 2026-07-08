import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ICredentialRepository } from '../../application/ports/credential-repository.interface.js';
import { ProviderCredentialEntity, CredentialType } from '../../domain/entities/provider-credential.entity.js';

const prisma = new PrismaClient();

@Injectable()
export class PrismaCredentialRepository implements ICredentialRepository {
  async findById(id: string): Promise<ProviderCredentialEntity | null> {
    const row = await prisma.ai_provider_credentials.findUnique({ where: { id } });
    if (!row) return null;
    return ProviderCredentialEntity.reconstitute(row);
  }

  async findByProviderId(providerId: string): Promise<ProviderCredentialEntity[]> {
    const rows = await prisma.ai_provider_credentials.findMany({
      where: { provider_id: providerId, deleted_at: null },
    });
    return rows.map(r => ProviderCredentialEntity.reconstitute(r));
  }

  async findByType(providerId: string, type: CredentialType): Promise<ProviderCredentialEntity | null> {
    const row = await prisma.ai_provider_credentials.findFirst({
      where: { provider_id: providerId, credential_type: type, deleted_at: null },
    });
    if (!row) return null;
    return ProviderCredentialEntity.reconstitute(row);
  }

  async save(credential: ProviderCredentialEntity): Promise<void> {
    await prisma.ai_provider_credentials.upsert({
      where: { id: credential.id },
      update: {
        encrypted_value: credential.encryptedValue,
        masked_value: credential.maskedValue,
        expires_at: credential.expiresAt,
        updated_at: credential.updatedAt,
        deleted_at: credential.deletedAt,
      },
      create: {
        id: credential.id,
        provider_id: credential.providerId,
        credential_type: credential.credentialType,
        encrypted_value: credential.encryptedValue,
        masked_value: credential.maskedValue,
        expires_at: credential.expiresAt,
        created_at: credential.createdAt,
        updated_at: credential.updatedAt,
        deleted_at: credential.deletedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.ai_provider_credentials.update({
      where: { id },
      data: { deleted_at: new Date() },
    });
  }

  async deleteByProviderId(providerId: string): Promise<void> {
    await prisma.ai_provider_credentials.updateMany({
      where: { provider_id: providerId },
      data: { deleted_at: new Date() },
    });
  }
}
