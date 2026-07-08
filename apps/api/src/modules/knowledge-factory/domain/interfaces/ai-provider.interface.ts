import type { ProviderConfig } from '../value-objects/provider-config.vo.js';

export interface AIProvider {
  readonly name: string;
  readonly type: string;
  readonly isHealthy: () => Promise<boolean>;

  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
}

export interface EmbeddingProviderMetadata {
  provider: string;
  model: string;
  dimensions: number;
  latencyMs: number;
  cached?: boolean;
}

export interface AIProviderRegistry {
  register(config: ProviderConfig): void;
  getProvider(type: string): AIProvider | undefined;
  getProvidersByPriority(): AIProvider[];
  getFallbackChain(primaryType: string): AIProvider[];
  markUnhealthy(type: string): void;
  markHealthy(type: string): void;
  getAvailableProviders(): string[];
}
