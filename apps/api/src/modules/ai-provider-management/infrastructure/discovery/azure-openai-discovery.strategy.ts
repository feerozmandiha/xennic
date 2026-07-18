import {
  IDiscoveryStrategy,
  DiscoveryResult,
} from '../../application/ports/discovery-provider.interface.js';

export class AzureOpenAIDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'azure_openai';

  async discover(apiKey: string, baseUrl: string): Promise<DiscoveryResult> {
    if (!baseUrl)
      throw new Error(
        'Azure OpenAI requires a base URL (e.g., https://your-resource.openai.azure.com)',
      );
    const url = baseUrl.replace(/\/+$/, '');
    return {
      providerType: 'azure_openai',
      providerName: 'Azure OpenAI',
      baseUrl: url,
      models: await this.fetchModels(apiKey, url),
      metadata: { docs: 'https://learn.microsoft.com/azure/ai-services/openai' },
    };
  }

  async testConnection(
    apiKey: string,
    baseUrl?: string,
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    if (!baseUrl) return { success: false, latencyMs: 0, error: 'Azure OpenAI requires base URL' };
    const start = Date.now();
    try {
      const res = await fetch(
        `${baseUrl.replace(/\/+$/, '')}/openai/models?api-version=2024-02-01`,
        {
          headers: { 'api-key': apiKey },
          signal: AbortSignal.timeout(15000),
        },
      );
      const latency = Date.now() - start;
      if (res.ok) return { success: true, latencyMs: latency };
      return { success: false, latencyMs: latency, error: `HTTP ${res.status}` };
    } catch (err) {
      return { success: false, latencyMs: Date.now() - start, error: (err as Error).message };
    }
  }

  private async fetchModels(apiKey: string, baseUrl: string): Promise<DiscoveryResult['models']> {
    try {
      const res = await fetch(`${baseUrl}/openai/models?api-version=2024-02-01`, {
        headers: { 'api-key': apiKey },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return DEFAULT_MODELS;
      const data = (await res.json()) as any;
      return (data.data || []).slice(0, 30).map((m: any) => ({
        modelId: m.id,
        displayName: m.id,
        modelType: 'chat',
        contextWindow: 128000,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsTemperature: true,
        supportsTopP: true,
      }));
    } catch {
      return DEFAULT_MODELS;
    }
  }
}

const DEFAULT_MODELS: DiscoveryResult['models'] = [
  {
    modelId: 'gpt-4o',
    displayName: 'GPT-4o',
    modelType: 'chat',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsTools: true,
    supportsJson: true,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsTemperature: true,
    supportsTopP: true,
  },
  {
    modelId: 'gpt-4o-mini',
    displayName: 'GPT-4o Mini',
    modelType: 'chat',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    supportsTools: true,
    supportsJson: true,
    supportsStreaming: true,
    supportsVision: true,
    supportsFunctionCalling: true,
    supportsTemperature: true,
    supportsTopP: true,
  },
  {
    modelId: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    modelType: 'chat',
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsTools: true,
    supportsJson: true,
    supportsStreaming: true,
    supportsTemperature: true,
    supportsTopP: true,
  },
  {
    modelId: 'text-embedding-3-small',
    displayName: 'Text Embedding 3 Small',
    modelType: 'embedding',
    contextWindow: 8191,
    supportsEmbedding: true,
  },
  {
    modelId: 'text-embedding-3-large',
    displayName: 'Text Embedding 3 Large',
    modelType: 'embedding',
    contextWindow: 8191,
    supportsEmbedding: true,
  },
];
