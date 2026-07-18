import {
  IDiscoveryStrategy,
  DiscoveryResult,
} from '../../application/ports/discovery-provider.interface.js';

export class CohereDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'cohere';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://api.cohere.com/v1';
    return {
      providerType: 'cohere',
      providerName: 'Cohere',
      baseUrl: url,
      models: [
        {
          modelId: 'command-r-plus',
          displayName: 'Command R+',
          modelType: 'chat',
          contextWindow: 128000,
          maxOutputTokens: 4096,
          supportsTools: true,
          supportsJson: true,
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsTemperature: true,
          supportsTopP: true,
          pricingInput: 3.0,
          pricingOutput: 15.0,
        },
        {
          modelId: 'command-r',
          displayName: 'Command R',
          modelType: 'chat',
          contextWindow: 128000,
          maxOutputTokens: 4096,
          supportsTools: true,
          supportsJson: true,
          supportsStreaming: true,
          supportsFunctionCalling: true,
          supportsTemperature: true,
          supportsTopP: true,
          pricingInput: 0.5,
          pricingOutput: 1.5,
        },
        {
          modelId: 'command-light',
          displayName: 'Command Light',
          modelType: 'chat',
          contextWindow: 4096,
          maxOutputTokens: 4096,
          supportsStreaming: true,
          supportsTemperature: true,
          supportsTopP: true,
          pricingInput: 0.3,
          pricingOutput: 0.6,
        },
        {
          modelId: 'embed-english-v3.0',
          displayName: 'Embed English V3',
          modelType: 'embedding',
          contextWindow: 512,
          supportsEmbedding: true,
          pricingInput: 0.1,
          pricingOutput: 0,
        },
        {
          modelId: 'embed-multilingual-v3.0',
          displayName: 'Embed Multilingual V3',
          modelType: 'embedding',
          contextWindow: 512,
          supportsEmbedding: true,
          pricingInput: 0.1,
          pricingOutput: 0,
        },
        {
          modelId: 'rerank-english-v3.0',
          displayName: 'Rerank English V3',
          modelType: 'reranking',
          contextWindow: 4096,
          supportsReranking: true,
          pricingInput: 2.0,
          pricingOutput: 0,
        },
        {
          modelId: 'rerank-multilingual-v3.0',
          displayName: 'Rerank Multilingual V3',
          modelType: 'reranking',
          contextWindow: 4096,
          supportsReranking: true,
          pricingInput: 2.0,
          pricingOutput: 0,
        },
      ],
      metadata: { docs: 'https://docs.cohere.com' },
    };
  }

  async testConnection(
    apiKey: string,
    baseUrl?: string,
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://api.cohere.com/v1';
      const res = await fetch(`${url}/models`, {
        headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
        signal: AbortSignal.timeout(10000),
      });
      const latency = Date.now() - start;
      if (res.ok) return { success: true, latencyMs: latency };
      return { success: false, latencyMs: latency, error: `HTTP ${res.status}` };
    } catch (err) {
      return { success: false, latencyMs: Date.now() - start, error: (err as Error).message };
    }
  }
}
