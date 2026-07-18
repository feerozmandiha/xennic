import {
  IDiscoveryStrategy,
  DiscoveryResult,
} from '../../application/ports/discovery-provider.interface.js';

export class OllamaDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'ollama';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'http://localhost:11434/v1';
    const models = await this.fetchModels(url);
    return {
      providerType: 'ollama',
      providerName: 'Ollama',
      baseUrl: url,
      models,
      metadata: { docs: 'https://github.com/ollama/ollama' },
    };
  }

  async testConnection(
    apiKey: string,
    baseUrl?: string,
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'http://localhost:11434';
      const res = await fetch(`${url}/api/tags`, { signal: AbortSignal.timeout(5000) });
      const latency = Date.now() - start;
      if (res.ok) return { success: true, latencyMs: latency };
      return { success: false, latencyMs: latency, error: `HTTP ${res.status}` };
    } catch (err) {
      return { success: false, latencyMs: Date.now() - start, error: (err as Error).message };
    }
  }

  private async fetchModels(baseUrl: string): Promise<DiscoveryResult['models']> {
    try {
      const res = await fetch(`${baseUrl.replace('/v1', '')}/api/tags`, {
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) return [];
      const data = (await res.json()) as any;
      return (data.models || []).slice(0, 20).map((m: any) => ({
        modelId: m.name,
        displayName: m.name,
        modelType: m.details?.modality === 'embedding' ? 'embedding' : 'chat',
        contextWindow: 32768,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsTemperature: true,
        supportsTopP: true,
      }));
    } catch {
      return [];
    }
  }
}
