import { IDiscoveryStrategy, DiscoveryResult } from '../../application/ports/discovery-provider.interface.js';

const MISTRAL_MODELS = [
  { id: 'mistral-large-latest', name: 'Mistral Large', context: 128000, maxOutput: 8192, tools: true, json: true, streaming: true, fc: true, input: 2, output: 6 },
  { id: 'mistral-small-latest', name: 'Mistral Small', context: 32000, maxOutput: 4096, tools: true, json: true, streaming: true, fc: true, input: 0.6, output: 1.8 },
  { id: 'open-mistral-7b', name: 'Open Mistral 7B', context: 32000, maxOutput: 4096, streaming: true, input: 0.1, output: 0.3 },
  { id: 'open-mixtral-8x7b', name: 'Open Mixtral 8x7B', context: 32000, maxOutput: 4096, streaming: true, input: 0.1, output: 0.3 },
  { id: 'open-mixtral-8x22b', name: 'Open Mixtral 8x22B', context: 64000, maxOutput: 4096, streaming: true, input: 0.2, output: 0.6 },
  { id: 'codestral-latest', name: 'Codestral', context: 256000, maxOutput: 8192, tools: true, streaming: true, fc: true, input: 1, output: 3 },
  { id: 'mistral-embed', name: 'Mistral Embed', context: 8192, embedding: true, input: 0.1, output: 0 },
  { id: 'mistral-moderation-latest', name: 'Mistral Moderation', context: 32000, input: 0.1, output: 0 },
];

export class MistralDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'mistral';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://api.mistral.ai/v1';
    return {
      providerType: 'mistral',
      providerName: 'Mistral AI',
      baseUrl: url,
      models: MISTRAL_MODELS.map(m => ({
        modelId: m.id, displayName: m.name,
        modelType: m.embedding ? 'embedding' : 'chat',
        contextWindow: m.context, maxOutputTokens: m.maxOutput,
        supportsTools: m.tools ?? false, supportsJson: m.json ?? true,
        supportsStreaming: m.streaming ?? true,
        supportsFunctionCalling: m.fc ?? false,
        supportsTemperature: true, supportsTopP: true, supportsSeed: true,
        supportsStructuredOutputs: m.json ?? false,
        pricingInput: m.input, pricingOutput: m.output,
      })),
      metadata: { docs: 'https://docs.mistral.ai' },
    };
  }

  async testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://api.mistral.ai/v1';
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
}
