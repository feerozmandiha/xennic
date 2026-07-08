import { IDiscoveryStrategy, DiscoveryResult } from '../../application/ports/discovery-provider.interface.js';

export class DeepSeekDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'deepseek';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://api.deepseek.com/v1';
    return {
      providerType: 'deepseek',
      providerName: 'DeepSeek',
      baseUrl: url,
      models: [
        { modelId: 'deepseek-chat', displayName: 'DeepSeek Chat (V3)', modelType: 'chat', contextWindow: 65536, maxOutputTokens: 8192, supportsTools: true, supportsJson: true, supportsStreaming: true, supportsFunctionCalling: true, supportsTemperature: true, supportsTopP: true, supportsSeed: true, pricingInput: 0.27, pricingOutput: 1.10 },
        { modelId: 'deepseek-reasoner', displayName: 'DeepSeek Reasoner (R1)', modelType: 'reasoning', contextWindow: 65536, maxOutputTokens: 8192, supportsStreaming: true, supportsReasoning: true, supportsTemperature: true, supportsTopP: true, pricingInput: 0.55, pricingOutput: 2.19 },
      ],
      metadata: { docs: 'https://api-docs.deepseek.com' },
    };
  }

  async testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://api.deepseek.com/v1';
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
