import { Injectable, Logger, Inject, ConflictException, NotFoundException } from '@nestjs/common';
import type { IProviderRepository } from '../ports/provider-repository.interface.js';
import { IPROVIDER_REPOSITORY } from '../ports/provider-repository.interface.js';
import type { ICredentialRepository } from '../ports/credential-repository.interface.js';
import { ICREDENTIAL_REPOSITORY } from '../ports/credential-repository.interface.js';
import type { IQuotaRepository } from '../ports/quota-repository.interface.js';
import { IQUOTA_REPOSITORY } from '../ports/quota-repository.interface.js';
import { AIProviderEntity, ProviderType } from '../../domain/entities/ai-provider.entity.js';
import { ProviderCredentialEntity } from '../../domain/entities/provider-credential.entity.js';
import { ProviderQuotaEntity } from '../../domain/entities/provider-quota.entity.js';
import { EncryptionService } from './encryption.service.js';

@Injectable()
export class ProviderRegistryService {
  private readonly logger = new Logger(ProviderRegistryService.name);

  constructor(
    @Inject(IPROVIDER_REPOSITORY)
    private readonly providerRepo: IProviderRepository,
    @Inject(ICREDENTIAL_REPOSITORY)
    private readonly credentialRepo: ICredentialRepository,
    @Inject(IQUOTA_REPOSITORY)
    private readonly quotaRepo: IQuotaRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async register(dto: {
    name: string;
    displayName: string;
    providerType: string;
    apiKey?: string;
    baseUrl?: string;
    orgId?: string;
    priority?: number;
    defaultWeight?: number;
    visibility?: string;
    headers?: Record<string, string>;
    metadata?: Record<string, unknown>;
    requestsPerMin?: number;
    tokensPerMin?: number;
    concurrentMax?: number;
    createdBy: string;
  }): Promise<AIProviderEntity> {
    const exists = await this.providerRepo.existsByName(dto.name);
    if (exists) throw new ConflictException(`Provider "${dto.name}" already exists`);

    const entity = AIProviderEntity.create(
      dto.name,
      dto.displayName,
      dto.providerType as ProviderType,
      dto.createdBy,
      {
        baseUrl: dto.baseUrl,
        orgId: dto.orgId,
        priority: dto.priority,
        defaultWeight: dto.defaultWeight,
        visibility: dto.visibility as any,
        headers: dto.headers,
        metadata: dto.metadata,
      },
    );

    await this.providerRepo.save(entity);

    if (dto.apiKey) {
      const encrypted = this.encryptionService.encryptApiKey(dto.apiKey);
      const masked = this.encryptionService.maskApiKey(dto.apiKey);
      const credential = ProviderCredentialEntity.create(entity.id, 'api_key', encrypted, masked);
      await this.credentialRepo.save(credential);
    }

    const quota = ProviderQuotaEntity.create(
      entity.id,
      dto.requestsPerMin,
      dto.tokensPerMin,
      dto.concurrentMax,
    );
    await this.quotaRepo.save(quota);

    this.logger.log(`Provider registered: ${entity.name} (${entity.id})`);
    return entity;
  }

  async update(
    id: string,
    dto: {
      displayName?: string;
      baseUrl?: string;
      orgId?: string;
      apiKey?: string;
      priority?: number;
      defaultWeight?: number;
      visibility?: string;
      enabled?: boolean;
      headers?: Record<string, string>;
      metadata?: Record<string, unknown>;
      requestsPerMin?: number;
      tokensPerMin?: number;
      concurrentMax?: number;
      updatedBy: string;
    },
  ): Promise<AIProviderEntity> {
    const entity = await this.providerRepo.findById(id);
    if (!entity) throw new NotFoundException(`Provider ${id} not found`);

    entity.update({
      displayName: dto.displayName,
      baseUrl: dto.baseUrl,
      orgId: dto.orgId,
      priority: dto.priority,
      defaultWeight: dto.defaultWeight,
      visibility: dto.visibility as any,
      headers: dto.headers,
      metadata: dto.metadata,
      updatedBy: dto.updatedBy,
    });

    if (dto.enabled !== undefined) {
      if (dto.enabled) entity.enable(dto.updatedBy);
      else entity.disable(dto.updatedBy);
    }

    await this.providerRepo.save(entity);

    if (dto.apiKey) {
      const encrypted = this.encryptionService.encryptApiKey(dto.apiKey);
      const masked = this.encryptionService.maskApiKey(dto.apiKey);
      await this.credentialRepo.deleteByProviderId(id);
      const credential = ProviderCredentialEntity.create(id, 'api_key', encrypted, masked);
      await this.credentialRepo.save(credential);
    }

    if (
      dto.requestsPerMin !== undefined ||
      dto.tokensPerMin !== undefined ||
      dto.concurrentMax !== undefined
    ) {
      const quota = await this.quotaRepo.findByProviderId(id);
      if (quota) {
        quota.update(dto.requestsPerMin, dto.tokensPerMin, dto.concurrentMax);
        await this.quotaRepo.save(quota);
      }
    }

    this.logger.log(`Provider updated: ${entity.name}`);
    return entity;
  }

  async delete(id: string, deletedBy: string): Promise<void> {
    const entity = await this.providerRepo.findById(id);
    if (!entity) throw new NotFoundException(`Provider ${id} not found`);
    entity.softDelete(deletedBy);
    await this.providerRepo.save(entity);
    await this.credentialRepo.deleteByProviderId(id);
    this.logger.log(`Provider soft-deleted: ${entity.name}`);
  }

  async findById(id: string): Promise<AIProviderEntity> {
    const entity = await this.providerRepo.findById(id);
    if (!entity) throw new NotFoundException(`Provider ${id} not found`);
    return entity;
  }

  async findByName(name: string): Promise<AIProviderEntity> {
    const entity = await this.providerRepo.findByName(name);
    if (!entity) throw new NotFoundException(`Provider "${name}" not found`);
    return entity;
  }

  async findAll(options?: {
    enabled?: boolean;
    includeDeleted?: boolean;
  }): Promise<AIProviderEntity[]> {
    return this.providerRepo.findAll(options);
  }

  async getEnabledProviders(): Promise<AIProviderEntity[]> {
    return this.providerRepo.findAll({ enabled: true });
  }

  async getApiKey(providerId: string): Promise<string | null> {
    const apikey = await this.credentialRepo.findByType(providerId, 'api_key');
    if (!apikey) return null;
    return this.encryptionService.decryptApiKey(apikey.encryptedValue);
  }

  async getCredentials(providerId: string): Promise<{ type: string; maskedValue: string }[]> {
    const credentials = await this.credentialRepo.findByProviderId(providerId);
    return credentials.map((c) => ({
      type: c.credentialType,
      maskedValue: c.maskedValue,
    }));
  }
}
