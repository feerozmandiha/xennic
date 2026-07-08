import { IDiscoveryStrategy, DiscoveryResult } from '../../application/ports/discovery-provider.interface.js';

const GEMINI_MODELS = [
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', context: 1048576, maxOutput: 8192, tools: true, json: true, vision: true, streaming: true, fc: true, input: 0.10, output: 0.40 },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite', context: 1048576, maxOutput: 8192, tools: true, json: true, vision: true, streaming: true, fc: true, input: 0.075, output: 0.30 },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', context: 2097152, maxOutput: 8192, tools: true, json: true, vision: true, audio: true, streaming: true, fc: true, input: 1.25, output: 5.0 },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', context: 1048576, maxOutput: 8192, tools: true, json: true, vision: true, streaming: true, fc: true, input: 0.075, output: 0.30 },
  { id: 'text-embedding-004', name: 'Text Embedding 004', context: 2048, input: 0.025, output: 0 },
  { id: 'aqa', name: 'AQA (Attributed Question Answering)', context: 8192, input: 0.025, output: 0 },
];

export class GeminiDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'gemini';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
    const models = await this.fetchModels(apiKey, url);
    return {
      providerType: 'gemini',
      providerName: 'Google Gemini',
      baseUrl: url,
      models,
      metadata: { docs: 'https://ai.google.dev/docs' },
    };
  }

  async testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://generativelanguage.googleapis.com/v1beta';
      const res = await fetch(`${url}/models?key=${apiKey}`, { signal: AbortSignal.timeout(10000) });
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
      const res = await fetch(`${baseUrl}/models?key=${apiKey}`, { signal: AbortSignal.timeout(15000) });
      if (!res.ok) return this.getStaticModels();
      const data = await res.json() as any;
      const remoteModels = (data.models || []).map((m: any) => m.name.replace('models/', ''));
      return this.intersectModels(remoteModels);
    } catch { return this.getStaticModels(); }
  }

  private getStaticModels(): DiscoveryResult['models'] {
    return GEMINI_MODELS.map(m => ({
      modelId: m.id, displayName: m.name,
      modelType: m.id.includes('embedding') ? 'embedding' : m.id === 'aqa' ? 'reranking' : 'chat',
      contextWindow: m.context, maxOutputTokens: m.maxOutput,
      supportsTools: m.tools ?? false, supportsJson: m.json ?? true,
      supportsStreaming: m.streaming ?? true, supportsVision: m.vision ?? false,
      supportsAudioInput: m.audio ?? false,
      supportsFunctionCalling: m.fc ?? false,
      supportsTemperature: true, supportsTopP: true,
      pricingInput: m.input, pricingOutput: m.output,
    }));
  }

  private intersectModels(remoteIds: string[]): DiscoveryResult['models'] {
    const staticModels = this.getStaticModels();
    if (remoteIds.length === 0) return staticModels;
    const known = staticModels.filter(m => remoteIds.includes(m.modelId));
    const unknown = remoteIds
      .filter(id => !staticModels.some(sm => sm.modelId === id))
      .filter(id => !id.includes('draft'))
      .slice(0, 20)
      .map(id => ({ modelId: id, displayName: id, modelType: 'chat' as const, supportsStreaming: true, supportsTemperature: true, supportsTopP: true }));
    return [...known, ...unknown];
  }
}
