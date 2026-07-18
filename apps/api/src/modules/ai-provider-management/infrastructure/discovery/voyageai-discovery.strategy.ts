import {
  IDiscoveryStrategy,
  DiscoveryResult,
} from '../../application/ports/discovery-provider.interface.js';

export class VoyageAIDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'voyageai';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://api.voyageai.com/v1';
    return {
      providerType: 'voyageai',
      providerName: 'Voyage AI',
      baseUrl: url,
      models: [
        {
          modelId: 'voyage-3-large',
          displayName: 'Voyage 3 Large',
          modelType: 'embedding',
          contextWindow: 16000,
          supportsEmbedding: true,
          pricingInput: 0.12,
          pricingOutput: 0,
        },
        {
          modelId: 'voyage-3',
          displayName: 'Voyage 3',
          modelType: 'embedding',
          contextWindow: 16000,
          supportsEmbedding: true,
          pricingInput: 0.06,
          pricingOutput: 0,
        },
        {
          modelId: 'voyage-3-lite',
          displayName: 'Voyage 3 Lite',
          modelType: 'embedding',
          contextWindow: 16000,
          supportsEmbedding: true,
          pricingInput: 0.03,
          pricingOutput: 0,
        },
        {
          modelId: 'voyage-code-3',
          displayName: 'Voyage Code 3',
          modelType: 'embedding',
          contextWindow: 16000,
          supportsEmbedding: true,
          pricingInput: 0.06,
          pricingOutput: 0,
        },
        {
          modelId: 'voyage-2',
          displayName: 'Voyage 2',
          modelType: 'embedding',
          contextWindow: 4000,
          supportsEmbedding: true,
          pricingInput: 0.1,
          pricingOutput: 0,
        },
        {
          modelId: 'voyage-code-2',
          displayName: 'Voyage Code 2',
          modelType: 'embedding',
          contextWindow: 16000,
          supportsEmbedding: true,
          pricingInput: 0.1,
          pricingOutput: 0,
        },
        {
          modelId: 'rerank-2',
          displayName: 'Rerank 2',
          modelType: 'reranking',
          contextWindow: 8000,
          supportsReranking: true,
          pricingInput: 0.08,
          pricingOutput: 0,
        },
        {
          modelId: 'rerank-2-lite',
          displayName: 'Rerank 2 Lite',
          modelType: 'reranking',
          contextWindow: 8000,
          supportsReranking: true,
          pricingInput: 0.04,
          pricingOutput: 0,
        },
      ],
      metadata: { docs: 'https://docs.voyageai.com' },
    };
  }

  async testConnection(
    apiKey: string,
    baseUrl?: string,
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://api.voyageai.com/v1';
      const res = await fetch(`${url}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
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
