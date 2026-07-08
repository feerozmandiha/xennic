import { Injectable, Logger } from '@nestjs/common';
import { IDiscoveryStrategy } from '../../application/ports/discovery-provider.interface.js';
import { OpenAIDiscoveryStrategy } from './openai-discovery.strategy.js';
import { AnthropicDiscoveryStrategy } from './anthropic-discovery.strategy.js';
import { GeminiDiscoveryStrategy } from './gemini-discovery.strategy.js';
import { MistralDiscoveryStrategy } from './mistral-discovery.strategy.js';
import { GroqDiscoveryStrategy } from './groq-discovery.strategy.js';
import { OpenRouterDiscoveryStrategy } from './openrouter-discovery.strategy.js';
import { TogetherDiscoveryStrategy } from './together-discovery.strategy.js';
import { DeepSeekDiscoveryStrategy } from './deepseek-discovery.strategy.js';
import { CohereDiscoveryStrategy } from './cohere-discovery.strategy.js';
import { VoyageAIDiscoveryStrategy } from './voyageai-discovery.strategy.js';
import { OllamaDiscoveryStrategy } from './ollama-discovery.strategy.js';
import { AzureOpenAIDiscoveryStrategy } from './azure-openai-discovery.strategy.js';
import { OpenAICompatibleDiscoveryStrategy } from './openai-compatible-discovery.strategy.js';

@Injectable()
export class DiscoveryStrategyFactory {
  private readonly logger = new Logger(DiscoveryStrategyFactory.name);
  private readonly strategies: Map<string, IDiscoveryStrategy> = new Map();

  constructor() {
    const strategies: IDiscoveryStrategy[] = [
      new OpenAIDiscoveryStrategy(),
      new AnthropicDiscoveryStrategy(),
      new GeminiDiscoveryStrategy(),
      new MistralDiscoveryStrategy(),
      new GroqDiscoveryStrategy(),
      new OpenRouterDiscoveryStrategy(),
      new TogetherDiscoveryStrategy(),
      new DeepSeekDiscoveryStrategy(),
      new CohereDiscoveryStrategy(),
      new VoyageAIDiscoveryStrategy(),
      new OllamaDiscoveryStrategy(),
      new AzureOpenAIDiscoveryStrategy(),
      new OpenAICompatibleDiscoveryStrategy(),
    ];

    for (const s of strategies) {
      this.strategies.set(s.providerType, s);
    }

    this.logger.log(`Registered ${strategies.length} discovery strategies`);
  }

  getStrategy(providerType: string): IDiscoveryStrategy {
    const strategy = this.strategies.get(providerType);
    if (!strategy) {
      if (providerType === 'custom' || providerType === 'openai_compatible') {
        return this.strategies.get('openai_compatible')!;
      }
      throw new Error(`No discovery strategy for provider type: ${providerType}`);
    }
    return strategy;
  }

  hasStrategy(providerType: string): boolean {
    return this.strategies.has(providerType) || providerType === 'custom';
  }

  getSupportedTypes(): string[] {
    return Array.from(this.strategies.keys());
  }
}
