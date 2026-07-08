import { IDiscoveryStrategy, DiscoveryResult } from '../../application/ports/discovery-provider.interface.js';

export class TogetherDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'together';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://api.together.xyz/v1';
    return {
      providerType: 'together',
      providerName: 'Together AI',
      baseUrl: url,
      models: [
        { modelId: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', displayName: 'Llama 3.3 70B', modelType: 'chat', contextWindow: 131072, maxOutputTokens: 4096, supportsTools: true, supportsJson: true, supportsStreaming: true, supportsTemperature: true, supportsTopP: true },
        { modelId: 'meta-llama/Llama-3.1-8B-Instruct-Turbo', displayName: 'Llama 3.1 8B', modelType: 'chat', contextWindow: 131072, maxOutputTokens: 4096, supportsTools: true, supportsJson: true, supportsStreaming: true, supportsTemperature: true, supportsTopP: true },
        { modelId: 'mistralai/Mixtral-8x22B-Instruct-v0.1', displayName: 'Mixtral 8x22B', modelType: 'chat', contextWindow: 65536, maxOutputTokens: 4096, supportsStreaming: true, supportsTemperature: true, supportsTopP: true },
        { modelId: 'deepseek-ai/DeepSeek-R1', displayName: 'DeepSeek R1', modelType: 'reasoning', contextWindow: 16384, maxOutputTokens: 4096, supportsStreaming: true, supportsReasoning: true, supportsTemperature: true, supportsTopP: true },
        { modelId: 'Qwen/Qwen2.5-72B-Instruct-Turbo', displayName: 'Qwen 2.5 72B', modelType: 'chat', contextWindow: 131072, maxOutputTokens: 4096, supportsTools: true, supportsJson: true, supportsStreaming: true, supportsTemperature: true, supportsTopP: true },
        { modelId: 'togethercomputer/m2-bert-80M-8k-retrieval', displayName: 'M2-BERT 80M Retrieval', modelType: 'embedding', contextWindow: 8192, supportsEmbedding: true },
        { modelId: 'black-forest-labs/FLUX.1-dev', displayName: 'FLUX.1 Dev', modelType: 'image', supportsImageInput: true },
      ],
      metadata: { docs: 'https://docs.together.ai' },
    };
  }

  async testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://api.together.xyz/v1';
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
