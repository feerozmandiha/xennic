export interface DiscoveryResult {
  providerType: string;
  providerName: string;
  baseUrl: string;
  models: Array<{
    modelId: string;
    displayName: string;
    modelType: string;
    contextWindow?: number;
    maxOutputTokens?: number;
    supportsTools?: boolean;
    supportsJson?: boolean;
    supportsStreaming?: boolean;
    supportsReasoning?: boolean;
    supportsVision?: boolean;
    supportsEmbedding?: boolean;
    supportsFunctionCalling?: boolean;
    supportsImageInput?: boolean;
    supportsAudioInput?: boolean;
    supportsTranscription?: boolean;
    supportsTranslation?: boolean;
    supportsReranking?: boolean;
    supportsTemperature?: boolean;
    supportsTopP?: boolean;
    supportsSeed?: boolean;
    supportsStructuredOutputs?: boolean;
    pricingInput?: number;
    pricingOutput?: number;
  }>;
  metadata: Record<string, unknown>;
}

export interface IDiscoveryStrategy {
  readonly providerType: string;
  discover(apiKey: string, baseUrl?: string): Promise<DiscoveryResult>;
  testConnection(apiKey: string, baseUrl?: string): Promise<{ success: boolean; latencyMs: number; error?: string }>;
}

export const IDISCOVERY_STRATEGY = 'IDiscoveryStrategy';
