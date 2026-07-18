import {
  IDiscoveryStrategy,
  DiscoveryResult,
} from '../../application/ports/discovery-provider.interface.js';

export class OpenRouterDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'openrouter';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://openrouter.ai/api/v1';
    const models = await this.fetchModels(apiKey, url);
    return {
      providerType: 'openrouter',
      providerName: 'OpenRouter',
      baseUrl: url,
      models,
      metadata: { docs: 'https://openrouter.ai/docs' },
    };
  }

  async testConnection(
    apiKey: string,
    baseUrl?: string,
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://openrouter.ai/api/v1';
      const res = await fetch(`${url}/auth/key`, {
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

  private async fetchModels(apiKey: string, baseUrl: string): Promise<DiscoveryResult['models']> {
    try {
      const res = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) return this.getTopModels();
      const data = (await res.json()) as any;
      const models = (data.data || []).slice(0, 50);
      return models.map((m: any) => ({
        modelId: m.id,
        displayName: m.name || m.id,
        modelType:
          m.architecture?.modality === 'embedding'
            ? 'embedding'
            : m.architecture?.modality === 'image'
              ? 'image'
              : 'chat',
        contextWindow: m.context_length,
        supportsStreaming: true,
        supportsTemperature: true,
        supportsTopP: true,
        supportsVision: m.architecture?.modality === 'text+image',
        supportsTools:
          !m.architecture?.modality?.includes('image') &&
          !m.architecture?.modality?.includes('embedding'),
        pricingInput: m.pricing?.input ? parseFloat(m.pricing.input) * 1000 : undefined,
        pricingOutput: m.pricing?.output ? parseFloat(m.pricing.output) * 1000 : undefined,
      }));
    } catch {
      return this.getTopModels();
    }
  }

  private getTopModels(): DiscoveryResult['models'] {
    const models = [
      'openai/gpt-4o',
      'openai/gpt-4o-mini',
      'openai/gpt-4-turbo',
      'openai/gpt-4',
      'anthropic/claude-3.5-sonnet',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-haiku',
      'google/gemini-2.0-flash',
      'google/gemini-1.5-pro',
      'google/gemini-1.5-flash',
      'mistralai/mistral-large',
      'mistralai/mistral-small',
      'meta-llama/llama-3.3-70b-instruct',
      'meta-llama/llama-3.1-8b-instruct',
      'deepseek/deepseek-r1',
      'deepseek/deepseek-chat',
      'cohere/command-r-plus',
    ];
    return models.map((id) => ({
      modelId: id,
      displayName: id,
      modelType: 'chat' as const,
      supportsStreaming: true,
      supportsTemperature: true,
      supportsTopP: true,
    }));
  }
}
