import {
  IDiscoveryStrategy,
  DiscoveryResult,
} from '../../application/ports/discovery-provider.interface.js';

export class OpenAICompatibleDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'openai_compatible';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    if (!baseUrl) throw new Error('OpenAI Compatible requires a base URL');
    const url = baseUrl.replace(/\/+$/, '');
    const models = await this.fetchModels(apiKey, url);
    return {
      providerType: 'openai_compatible',
      providerName: 'OpenAI Compatible',
      baseUrl: url,
      models,
      metadata: {},
    };
  }

  async testConnection(
    apiKey: string,
    baseUrl?: string,
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      if (!baseUrl) throw new Error('Base URL required');
      const url = baseUrl.replace(/\/+$/, '');
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

  private async fetchModels(apiKey: string, baseUrl: string): Promise<DiscoveryResult['models']> {
    try {
      const res = await fetch(`${baseUrl}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as any;
      return (data.data || []).slice(0, 30).map((m: any) => ({
        modelId: m.id,
        displayName: m.id,
        modelType: 'chat',
        supportsStreaming: true,
        supportsTemperature: true,
        supportsTopP: true,
      }));
    } catch {
      return [];
    }
  }
}
