import { Injectable, Logger, Optional } from '@nestjs/common';
import type { AIProvider } from '../../domain/interfaces/ai-provider.interface.js';
import type { ProviderConfig } from '../../domain/value-objects/provider-config.vo.js';
import { ProviderRegistryService } from '../../../ai-provider-management/application/services/provider-registry.service.js';
import { CredentialService } from '../../../ai-provider-management/application/services/credential.service.js';
import { ModelRegistryService } from '../../../ai-provider-management/application/services/model-registry.service.js';
import { ProviderExecutionService } from '../../../ai-provider-management/application/services/provider-execution.service.js';

@Injectable()
export class AIProviderRegistry {
  private readonly providers = new Map<string, AIProvider>();
  private readonly unhealthyProviders = new Set<string>();
  private readonly logger = new Logger(AIProviderRegistry.name);

  private readonly providerConfigs = new Map<string, ProviderConfig>();

  constructor(
    @Optional() private readonly execution?: ProviderExecutionService,
    @Optional() private readonly providerRegistry?: ProviderRegistryService,
    @Optional() private readonly credentialService?: CredentialService,
    @Optional() private readonly modelRegistry?: ModelRegistryService,
  ) {}

  register(config: ProviderConfig): void {
    if (!config.enabled) return;

    this.providerConfigs.set(config.type, config);
    this.providers.set(config.type, {
      type: config.type,
      name: config.name,
      isHealthy: async () => !this.unhealthyProviders.has(config.type),
      embed: async (text: string) => this.embed(text, config.type),
      embedBatch: async (texts: string[]) => this.embedBatch(texts, config.type),
    });
  }

  getProvider(type: string): AIProvider | undefined {
    if (this.unhealthyProviders.has(type)) return undefined;
    return this.providers.get(type);
  }

  getProvidersByPriority(): AIProvider[] {
    return Array.from(this.providers.values())
      .filter((provider) => !this.unhealthyProviders.has(provider.type))
      .sort((a, b) => {
        const aPriority = this.providerConfigs.get(a.type)?.priority ?? 0;
        const bPriority = this.providerConfigs.get(b.type)?.priority ?? 0;
        return aPriority - bPriority;
      });
  }

  getFallbackChain(primaryType: string): AIProvider[] {
    return this.getProvidersByPriority().filter((provider) => provider.type !== primaryType);
  }

  markUnhealthy(type: string): void {
    this.unhealthyProviders.add(type);
    this.logger.warn(`AI provider marked as unhealthy: ${type}`);
  }

  markHealthy(type: string): void {
    this.unhealthyProviders.delete(type);
    this.logger.log(`AI provider marked as healthy: ${type}`);
  }

  getAvailableProviders(): string[] {
    return this.getProvidersByPriority().map((provider) => provider.type);
  }

  async embed(text: string, preferredProvider?: string): Promise<number[]> {
    if (!this.execution) {
      throw new Error('ProviderExecutionService is not available');
    }

    const result = await this.execution.embed({
      input: text,
      providerId: preferredProvider,
      capability: 'embedding',
    });
    return result.embeddings[0] ?? [];
  }

  async embedBatch(texts: string[], preferredProvider?: string): Promise<number[][]> {
    if (!this.execution) {
      throw new Error('ProviderExecutionService is not available');
    }

    const result = await this.execution.embed({
      input: texts,
      providerId: preferredProvider,
      capability: 'embedding',
    });
    return result.embeddings;
  }
}
