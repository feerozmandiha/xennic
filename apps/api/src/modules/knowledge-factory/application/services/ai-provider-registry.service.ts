import { Injectable, Logger } from '@nestjs/common';
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

  constructor(
    private readonly execution: ProviderExecutionService,
    private readonly providerRegistry: ProviderRegistryService,
    private readonly credentialService: CredentialService,
    private readonly modelRegistry: ModelRegistryService,
  ) {}

  register(config: ProviderConfig): void {
    this.logger.log(`Provider registration via config deferred to ProviderManagement: ${config.name}`);
  }

  getProvider(type: string): AIProvider | undefined {
    if (this.unhealthyProviders.has(type)) return undefined;
    return this.providers.get(type);
  }

  getProvidersByPriority(): AIProvider[] {
    return [];
  }

  getFallbackChain(primaryType: string): AIProvider[] {
    return [];
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
    return [];
  }

  async embed(text: string, preferredProvider?: string): Promise<number[]> {
    const result = await this.execution.embed({
      input: text,
      providerId: preferredProvider,
      capability: 'embedding',
    });
    return result.embeddings[0] ?? [];
  }

  async embedBatch(texts: string[], preferredProvider?: string): Promise<number[][]> {
    const result = await this.execution.embed({
      input: texts,
      providerId: preferredProvider,
      capability: 'embedding',
    });
    return result.embeddings;
  }
}
