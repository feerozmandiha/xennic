import { IDiscoveryStrategy, DiscoveryResult } from '../../application/ports/discovery-provider.interface.js';

const ANTHROPIC_MODELS = [
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', context: 200000, maxOutput: 4096, tools: true, vision: true, reasoning: true, input: 15, output: 75 },
  { id: 'claude-3-sonnet-20240229', name: 'Claude 3 Sonnet', context: 200000, maxOutput: 4096, tools: true, vision: true, reasoning: true, input: 3, output: 15 },
  { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku', context: 200000, maxOutput: 4096, tools: true, vision: true, reasoning: true, input: 0.25, output: 1.25 },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', context: 200000, maxOutput: 8192, tools: true, vision: true, streaming: true, reasoning: true, input: 3, output: 15 },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', context: 200000, maxOutput: 8192, tools: true, vision: true, streaming: true, reasoning: true, input: 0.8, output: 4 },
  { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet (Legacy)', context: 200000, maxOutput: 4096, tools: true, vision: true, reasoning: true, input: 3, output: 15 },
];

export class AnthropicDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'anthropic';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://api.anthropic.com/v1';
    return {
      providerType: 'anthropic',
      providerName: 'Anthropic',
      baseUrl: url,
      models: ANTHROPIC_MODELS.map(m => ({
        modelId: m.id,
        displayName: m.name,
        modelType: 'chat',
        contextWindow: m.context,
        maxOutputTokens: m.maxOutput,
        supportsTools: m.tools ?? false,
        supportsJson: true,
        supportsStreaming: m.streaming ?? true,
        supportsVision: m.vision ?? false,
        supportsReasoning: m.reasoning ?? false,
        supportsTemperature: true,
        supportsTopP: true,
        pricingInput: m.input,
        pricingOutput: m.output,
      })),
      metadata: { docs: 'https://docs.anthropic.com' },
    };
  }

  async testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://api.anthropic.com/v1';
      const res = await fetch(`${url}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model: 'claude-3-haiku-20240307', max_tokens: 1, messages: [{ role: 'user', content: 'hi' }] }),
        signal: AbortSignal.timeout(15000),
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
