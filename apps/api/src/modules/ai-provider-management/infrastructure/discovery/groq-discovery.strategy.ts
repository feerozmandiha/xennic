import { IDiscoveryStrategy, DiscoveryResult } from '../../application/ports/discovery-provider.interface.js';

const GROQ_MODELS = [
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', context: 128000, output: 32768, tools: true, json: true, streaming: true, fc: true, temp: true },
  { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B', context: 128000, output: 8192, tools: true, json: true, streaming: true, fc: true, temp: true },
  { id: 'llama-3.2-90b-vision-preview', name: 'Llama 3.2 90B Vision', context: 128000, output: 8192, vision: true, streaming: true, temp: true },
  { id: 'llama-3.2-11b-vision-preview', name: 'Llama 3.2 11B Vision', context: 128000, output: 8192, vision: true, streaming: true, temp: true },
  { id: 'llama-3.2-3b-preview', name: 'Llama 3.2 3B', context: 128000, output: 8192, streaming: true, temp: true },
  { id: 'llama-3.2-1b-preview', name: 'Llama 3.2 1B', context: 128000, output: 8192, streaming: true, temp: true },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', context: 32768, output: 8192, tools: true, streaming: true, temp: true },
  { id: 'gemma2-9b-it', name: 'Gemma 2 9B', context: 8192, output: 8192, streaming: true, temp: true },
  { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill Llama 70B', context: 128000, output: 16384, streaming: true, temp: true, reasoning: true },
];

export class GroqDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'groq';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://api.groq.com/openai/v1';
    const models = await this.fetchModels(apiKey, url);
    return {
      providerType: 'groq',
      providerName: 'Groq',
      baseUrl: url,
      models,
      metadata: { docs: 'https://console.groq.com/docs' },
    };
  }

  async testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://api.groq.com/openai/v1';
      const res = await fetch(`${url}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      });
      const latency = Date.now() - start;
      if (res.ok) return { success: true, latencyMs: latency };
      const err = await res.text().catch(() => '');
      return { success: false, latencyMs: latency, error: `HTTP ${res.status}: ${err.slice(0, 100)}` };
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
      if (!res.ok) return this.getStaticModels();
      const data = await res.json() as any;
      const remoteIds = (data.data || []).map((m: any) => m.id);
      return this.intersectModels(remoteIds);
    } catch { return this.getStaticModels(); }
  }

  private getStaticModels(): DiscoveryResult['models'] {
    return GROQ_MODELS.map(m => ({
      modelId: m.id, displayName: m.name, modelType: m.vision ? 'vision' : 'chat',
      contextWindow: m.context, maxOutputTokens: m.output,
      supportsTools: m.tools ?? false, supportsJson: m.json ?? true,
      supportsStreaming: m.streaming ?? true, supportsVision: m.vision ?? false,
      supportsReasoning: m.reasoning ?? false,
      supportsFunctionCalling: m.fc ?? false,
      supportsTemperature: m.temp ?? true, supportsTopP: true,
    }));
  }

  private intersectModels(remoteIds: string[]): DiscoveryResult['models'] {
    const staticModels = this.getStaticModels();
    if (remoteIds.length === 0) return staticModels;
    const known = staticModels.filter(m => remoteIds.includes(m.modelId));
    const unknown = remoteIds.filter(id => !staticModels.some(sm => sm.modelId === id)).slice(0, 20).map(id => ({
      modelId: id, displayName: id, modelType: 'chat' as const, supportsStreaming: true, supportsTemperature: true, supportsTopP: true,
    }));
    return [...known, ...unknown];
  }
}
