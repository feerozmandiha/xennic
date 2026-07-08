import { Injectable, Logger } from '@nestjs/common';
import type { IProviderRepository } from '../ports/provider-repository.interface.js';
import { IPROVIDER_REPOSITORY } from '../ports/provider-repository.interface.js';
import type { ICredentialRepository } from '../ports/credential-repository.interface.js';
import { ICREDENTIAL_REPOSITORY } from '../ports/credential-repository.interface.js';
import type { IQuotaRepository } from '../ports/quota-repository.interface.js';
import { IQUOTA_REPOSITORY } from '../ports/quota-repository.interface.js';
import { Inject } from '@nestjs/common';
import { AIProviderEntity, ProviderType } from '../../domain/entities/ai-provider.entity.js';
import { ProviderCredentialEntity } from '../../domain/entities/provider-credential.entity.js';
import { ProviderQuotaEntity } from '../../domain/entities/provider-quota.entity.js';
import { EncryptionService } from './encryption.service.js';

interface EnvProviderConfig {
  name: string;
  displayName: string;
  type: ProviderType;
  apiKey: string;
  baseUrl?: string;
  model?: string;
}

@Injectable()
export class ProviderMigrationService {
  private readonly logger = new Logger(ProviderMigrationService.name);

  constructor(
    @Inject(IPROVIDER_REPOSITORY)
    private readonly providerRepo: IProviderRepository,
    @Inject(ICREDENTIAL_REPOSITORY)
    private readonly credentialRepo: ICredentialRepository,
    @Inject(IQUOTA_REPOSITORY)
    private readonly quotaRepo: IQuotaRepository,
    private readonly encryptionService: EncryptionService,
  ) {}

  async migrateFromEnv(createdBy: string): Promise<{ migrated: number; skipped: number; errors: string[] }> {
    const configs = this.detectEnvProviders();
    let migrated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const config of configs) {
      try {
        const exists = await this.providerRepo.existsByName(config.name);
        if (exists) {
          this.logger.log(`Provider "${config.name}" already exists, skipping`);
          skipped++;
          continue;
        }

        const entity = AIProviderEntity.create(config.name, config.displayName, config.type, createdBy, {
          baseUrl: config.baseUrl,
        });
        await this.providerRepo.save(entity);

        if (config.apiKey) {
          const encrypted = this.encryptionService.encryptApiKey(config.apiKey);
          const masked = this.encryptionService.maskApiKey(config.apiKey);
          const credential = ProviderCredentialEntity.create(entity.id, 'api_key', encrypted, masked);
          await this.credentialRepo.save(credential);
        }

        const quota = ProviderQuotaEntity.create(entity.id, 60, 100000, 10);
        await this.quotaRepo.save(quota);

        entity.metadata = { ...entity.metadata, migrated_from_env: true, migrated_model: config.model };
        await this.providerRepo.save(entity);

        migrated++;
        this.logger.log(`Migrated provider: ${config.name}`);
      } catch (err) {
        errors.push(`${config.name}: ${(err as Error).message}`);
        this.logger.error(`Migration failed for ${config.name}: ${(err as Error).message}`);
      }
    }

    this.logger.log(`Migration complete: ${migrated} migrated, ${skipped} skipped, ${errors.length} errors`);
    return { migrated, skipped, errors };
  }

  private detectEnvProviders(): EnvProviderConfig[] {
    const configs: EnvProviderConfig[] = [];
    const env = process.env;

    const providerMap: Record<string, { type: ProviderType; name: string; display: string }> = {
      openai: { type: 'openai', name: 'env-openai', display: 'OpenAI (from .env)' },
      anthropic: { type: 'anthropic', name: 'env-anthropic', display: 'Anthropic (from .env)' },
      gemini: { type: 'gemini', name: 'env-gemini', display: 'Google Gemini (from .env)' },
      mistral: { type: 'mistral', name: 'env-mistral', display: 'Mistral AI (from .env)' },
      groq: { type: 'groq', name: 'env-groq', display: 'Groq (from .env)' },
      deepseek: { type: 'deepseek', name: 'env-deepseek', display: 'DeepSeek (from .env)' },
      cohere: { type: 'cohere', name: 'env-cohere', display: 'Cohere (from .env)' },
      voyageai: { type: 'voyageai', name: 'env-voyageai', display: 'Voyage AI (from .env)' },
      ollama: { type: 'ollama', name: 'env-ollama', display: 'Ollama (from .env)' },
      azure_openai: { type: 'azure_openai', name: 'env-azure-openai', display: 'Azure OpenAI (from .env)' },
    };

    // Check AI_PROVIDER for primary provider
    const primaryProvider = env['AI_PROVIDER'];
    const primaryKey = env['AI_API_KEY'] || env['GROQ_API_KEY'];

    if (primaryProvider && primaryKey && providerMap[primaryProvider]) {
      const p = providerMap[primaryProvider];
      configs.push({
        name: p.name,
        displayName: p.display,
        type: p.type,
        apiKey: primaryKey,
        baseUrl: env['AI_BASE_URL'],
        model: env['AI_MODEL'],
      });
    } else if (primaryProvider && primaryKey && primaryProvider !== 'mock') {
      configs.push({
        name: `env-${primaryProvider}`,
        displayName: `${primaryProvider} (from .env)`,
        type: primaryProvider as ProviderType,
        apiKey: primaryKey,
        baseUrl: env['AI_BASE_URL'],
        model: env['AI_MODEL'],
      });
    }

    // Check individual provider API keys
    const keyMappings: Record<string, { type: ProviderType; name: string }> = {
      OPENAI_API_KEY: { type: 'openai', name: 'env-openai' },
      ANTHROPIC_API_KEY: { type: 'anthropic', name: 'env-anthropic' },
      GOOGLE_API_KEY: { type: 'gemini', name: 'env-gemini' },
      GROQ_API_KEY: { type: 'groq', name: 'env-groq' },
      MISTRAL_API_KEY: { type: 'mistral', name: 'env-mistral' },
      DEEPSEEK_API_KEY: { type: 'deepseek', name: 'env-deepseek' },
      COHERE_API_KEY: { type: 'cohere', name: 'env-cohere' },
      VOYAGE_API_KEY: { type: 'voyageai', name: 'env-voyageai' },
    };

    for (const [envKey, mapping] of Object.entries(keyMappings)) {
      const key = env[envKey];
      if (key && !configs.some(c => c.type === mapping.type)) {
        configs.push({
          name: mapping.name,
          displayName: `${mapping.type} (from .env)`,
          type: mapping.type,
          apiKey: key,
        });
      }
    }

    return configs;
  }

  async isMigrationNeeded(): Promise<boolean> {
    const count = await this.providerRepo.count();
    if (count > 0) return false;

    // Check if there are env providers to migrate
    const configs = this.detectEnvProviders();
    return configs.length > 0;
  }
}
