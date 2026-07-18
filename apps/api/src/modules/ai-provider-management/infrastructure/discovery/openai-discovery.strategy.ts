import {
  IDiscoveryStrategy,
  DiscoveryResult,
} from '../../application/ports/discovery-provider.interface.js';

const OPENAI_MODELS = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    context: 128000,
    output: 16384,
    tools: true,
    json: true,
    vision: true,
    streaming: true,
    fc: true,
    structured: true,
    temp: true,
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    context: 128000,
    output: 16384,
    tools: true,
    json: true,
    vision: true,
    streaming: true,
    fc: true,
    structured: true,
    temp: true,
  },
  {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    context: 128000,
    output: 4096,
    tools: true,
    json: true,
    vision: true,
    streaming: true,
    fc: true,
    structured: true,
    temp: true,
  },
  {
    id: 'gpt-4',
    name: 'GPT-4',
    context: 8192,
    output: 4096,
    tools: true,
    json: true,
    streaming: true,
    fc: true,
    temp: true,
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    context: 16385,
    output: 4096,
    tools: true,
    json: true,
    streaming: true,
    fc: true,
    temp: true,
  },
  {
    id: 'o1',
    name: 'O1',
    context: 200000,
    output: 100000,
    tools: false,
    json: false,
    vision: true,
    streaming: false,
    fc: false,
    reasoning: true,
    temp: false,
  },
  {
    id: 'o1-mini',
    name: 'O1 Mini',
    context: 128000,
    output: 65536,
    tools: false,
    json: false,
    vision: true,
    streaming: false,
    fc: false,
    reasoning: true,
    temp: false,
  },
  {
    id: 'o3-mini',
    name: 'O3 Mini',
    context: 200000,
    output: 100000,
    tools: true,
    json: true,
    vision: true,
    streaming: false,
    fc: true,
    reasoning: true,
    temp: true,
  },
  { id: 'text-embedding-3-small', name: 'Text Embedding 3 Small', context: 8191, embedding: true },
  { id: 'text-embedding-3-large', name: 'Text Embedding 3 Large', context: 8191, embedding: true },
  { id: 'dall-e-3', name: 'DALL-E 3', image: true },
  { id: 'whisper-1', name: 'Whisper', transcription: true, audio: true },
  { id: 'tts-1', name: 'TTS 1', audio: true },
  { id: 'tts-1-hd', name: 'TTS 1 HD', audio: true },
];

const PRICING: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 2.5, output: 10 },
  'gpt-4o-mini': { input: 0.15, output: 0.6 },
  'gpt-4-turbo': { input: 10, output: 30 },
  'gpt-4': { input: 30, output: 60 },
  'gpt-3.5-turbo': { input: 0.5, output: 1.5 },
  o1: { input: 15, output: 60 },
  'o1-mini': { input: 3, output: 12 },
  'o3-mini': { input: 1.1, output: 4.4 },
  'text-embedding-3-small': { input: 0.02, output: 0 },
  'text-embedding-3-large': { input: 0.13, output: 0 },
};

export class OpenAIDiscoveryStrategy implements IDiscoveryStrategy {
  readonly providerType = 'openai';

  async discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult> {
    const url = baseUrl || 'https://api.openai.com/v1';
    const models = await this.fetchModels(apiKey, url);
    return {
      providerType: 'openai',
      providerName: 'OpenAI',
      baseUrl: url,
      models,
      metadata: { docs: 'https://platform.openai.com/docs' },
    };
  }

  async testConnection(
    apiKey: string,
    baseUrl?: string,
  ): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const start = Date.now();
    try {
      const url = baseUrl || 'https://api.openai.com/v1';
      const res = await fetch(`${url}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(10000),
      });
      const latency = Date.now() - start;
      if (res.ok) return { success: true, latencyMs: latency };
      const err = await res.text().catch(() => '');
      return {
        success: false,
        latencyMs: latency,
        error: `HTTP ${res.status}: ${err.slice(0, 100)}`,
      };
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
      const data = (await res.json()) as any;
      const remoteModels = (data.data || []).map((m: any) => m.id);
      return this.intersectModels(remoteModels);
    } catch {
      return this.getStaticModels();
    }
  }

  private getStaticModels(): DiscoveryResult['models'] {
    return OPENAI_MODELS.map((m) => ({
      modelId: m.id,
      displayName: m.name,
      modelType: m.embedding
        ? 'embedding'
        : m.image
          ? 'image'
          : m.transcription
            ? 'transcription'
            : m.audio
              ? 'audio'
              : m.reasoning
                ? 'reasoning'
                : 'chat',
      contextWindow: m.context,
      maxOutputTokens: m.output,
      supportsTools: m.tools ?? false,
      supportsJson: m.json ?? false,
      supportsStreaming: m.streaming ?? true,
      supportsReasoning: m.reasoning ?? false,
      supportsVision: m.vision ?? false,
      supportsEmbedding: m.embedding ?? false,
      supportsFunctionCalling: m.fc ?? false,
      supportsImageInput: m.image ?? false,
      supportsAudioInput: m.audio ?? false,
      supportsTranscription: m.transcription ?? false,
      supportsTemperature: m.temp ?? true,
      supportsTopP: true,
      supportsSeed: m.id.includes('gpt-4o') || m.id.includes('gpt-3.5'),
      supportsStructuredOutputs: m.structured ?? false,
      pricingInput: PRICING[m.id]?.input,
      pricingOutput: PRICING[m.id]?.output,
    }));
  }

  private intersectModels(remoteIds: string[]): DiscoveryResult['models'] {
    const staticModels = this.getStaticModels();
    if (remoteIds.length === 0) return staticModels;
    const known = staticModels.filter((m) => remoteIds.includes(m.modelId));
    const unknown = remoteIds
      .filter((id) => !staticModels.some((sm) => sm.modelId === id))
      .filter((id) => !id.startsWith('ft:') && !id.startsWith('draft:'))
      .slice(0, 20)
      .map((id) => ({
        modelId: id,
        displayName: id,
        modelType: 'chat' as const,
        supportsStreaming: true,
        supportsTemperature: true,
        supportsTopP: true,
      }));
    return [...known, ...unknown];
  }
}
