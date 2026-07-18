import { randomUUID } from 'crypto';

export type ModelType =
  | 'chat'
  | 'embedding'
  | 'vision'
  | 'reasoning'
  | 'image'
  | 'audio'
  | 'transcription'
  | 'translation'
  | 'reranking';

export class AIModelEntity {
  private constructor(
    public readonly id: string,
    public readonly providerId: string,
    public readonly modelId: string,
    public displayName: string,
    public readonly modelType: ModelType,
    public contextWindow: number | null,
    public maxOutputTokens: number | null,
    public supportsTools: boolean,
    public supportsJson: boolean,
    public supportsStreaming: boolean,
    public supportsReasoning: boolean,
    public supportsTemperature: boolean,
    public supportsTopP: boolean,
    public supportsSeed: boolean,
    public supportsStructuredOutputs: boolean,
    public supportsVision: boolean,
    public supportsEmbedding: boolean,
    public supportsFunctionCalling: boolean,
    public supportsImageInput: boolean,
    public supportsAudioInput: boolean,
    public supportsTranscription: boolean,
    public supportsTranslation: boolean,
    public supportsReranking: boolean,
    public pricingInput: number | null,
    public pricingOutput: number | null,
    public status: string,
    public enabled: boolean,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  static create(
    providerId: string,
    modelId: string,
    displayName: string,
    modelType: ModelType,
    options?: {
      contextWindow?: number;
      maxOutputTokens?: number;
      supportsTools?: boolean;
      supportsJson?: boolean;
      supportsStreaming?: boolean;
      supportsReasoning?: boolean;
      supportsTemperature?: boolean;
      supportsTopP?: boolean;
      supportsSeed?: boolean;
      supportsStructuredOutputs?: boolean;
      supportsVision?: boolean;
      supportsEmbedding?: boolean;
      supportsFunctionCalling?: boolean;
      supportsImageInput?: boolean;
      supportsAudioInput?: boolean;
      supportsTranscription?: boolean;
      supportsTranslation?: boolean;
      supportsReranking?: boolean;
      pricingInput?: number;
      pricingOutput?: number;
    },
  ): AIModelEntity {
    const now = new Date();
    return new AIModelEntity(
      randomUUID(),
      providerId,
      modelId,
      displayName,
      modelType,
      options?.contextWindow ?? null,
      options?.maxOutputTokens ?? null,
      options?.supportsTools ?? false,
      options?.supportsJson ?? false,
      options?.supportsStreaming ?? true,
      options?.supportsReasoning ?? false,
      options?.supportsTemperature ?? true,
      options?.supportsTopP ?? true,
      options?.supportsSeed ?? false,
      options?.supportsStructuredOutputs ?? false,
      options?.supportsVision ?? false,
      options?.supportsEmbedding ?? false,
      options?.supportsFunctionCalling ?? false,
      options?.supportsImageInput ?? false,
      options?.supportsAudioInput ?? false,
      options?.supportsTranscription ?? false,
      options?.supportsTranslation ?? false,
      options?.supportsReranking ?? false,
      options?.pricingInput ?? null,
      options?.pricingOutput ?? null,
      'active',
      true,
      now,
      now,
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    provider_id: string;
    model_id: string;
    display_name: string;
    model_type: string;
    context_window: number | null;
    max_output_tokens: number | null;
    supports_tools: boolean;
    supports_json: boolean;
    supports_streaming: boolean;
    supports_reasoning: boolean;
    supports_temperature: boolean;
    supports_top_p: boolean;
    supports_seed: boolean;
    supports_structured_outputs: boolean;
    supports_vision: boolean;
    supports_embedding: boolean;
    supports_function_calling: boolean;
    supports_image_input: boolean;
    supports_audio_input: boolean;
    supports_transcription: boolean;
    supports_translation: boolean;
    supports_reranking: boolean;
    pricing_input: number | null;
    pricing_output: number | null;
    status: string;
    enabled: boolean;
    created_at: Date;
    updated_at: Date;
    deleted_at: Date | null;
  }): AIModelEntity {
    return new AIModelEntity(
      data.id,
      data.provider_id,
      data.model_id,
      data.display_name,
      data.model_type as ModelType,
      data.context_window,
      data.max_output_tokens,
      data.supports_tools,
      data.supports_json,
      data.supports_streaming,
      data.supports_reasoning,
      data.supports_temperature,
      data.supports_top_p,
      data.supports_seed,
      data.supports_structured_outputs,
      data.supports_vision,
      data.supports_embedding,
      data.supports_function_calling,
      data.supports_image_input,
      data.supports_audio_input,
      data.supports_transcription,
      data.supports_translation,
      data.supports_reranking,
      data.pricing_input,
      data.pricing_output,
      data.status,
      data.enabled,
      data.created_at,
      data.updated_at,
      data.deleted_at,
    );
  }

  update(
    updates: Partial<{
      displayName: string;
      contextWindow: number | null;
      maxOutputTokens: number | null;
      supportsTools: boolean;
      supportsJson: boolean;
      supportsStreaming: boolean;
      supportsReasoning: boolean;
      supportsTemperature: boolean;
      supportsTopP: boolean;
      supportsSeed: boolean;
      supportsStructuredOutputs: boolean;
      supportsVision: boolean;
      supportsEmbedding: boolean;
      supportsFunctionCalling: boolean;
      supportsImageInput: boolean;
      supportsAudioInput: boolean;
      supportsTranscription: boolean;
      supportsTranslation: boolean;
      supportsReranking: boolean;
      pricingInput: number | null;
      pricingOutput: number | null;
      status: string;
      enabled: boolean;
    }>,
  ): void {
    if (updates.displayName !== undefined) this.displayName = updates.displayName;
    if (updates.contextWindow !== undefined) this.contextWindow = updates.contextWindow;
    if (updates.maxOutputTokens !== undefined) this.maxOutputTokens = updates.maxOutputTokens;
    if (updates.supportsTools !== undefined) this.supportsTools = updates.supportsTools;
    if (updates.supportsJson !== undefined) this.supportsJson = updates.supportsJson;
    if (updates.supportsStreaming !== undefined) this.supportsStreaming = updates.supportsStreaming;
    if (updates.supportsReasoning !== undefined) this.supportsReasoning = updates.supportsReasoning;
    if (updates.supportsTemperature !== undefined)
      this.supportsTemperature = updates.supportsTemperature;
    if (updates.supportsTopP !== undefined) this.supportsTopP = updates.supportsTopP;
    if (updates.supportsSeed !== undefined) this.supportsSeed = updates.supportsSeed;
    if (updates.supportsStructuredOutputs !== undefined)
      this.supportsStructuredOutputs = updates.supportsStructuredOutputs;
    if (updates.supportsVision !== undefined) this.supportsVision = updates.supportsVision;
    if (updates.supportsEmbedding !== undefined) this.supportsEmbedding = updates.supportsEmbedding;
    if (updates.supportsFunctionCalling !== undefined)
      this.supportsFunctionCalling = updates.supportsFunctionCalling;
    if (updates.supportsImageInput !== undefined)
      this.supportsImageInput = updates.supportsImageInput;
    if (updates.supportsAudioInput !== undefined)
      this.supportsAudioInput = updates.supportsAudioInput;
    if (updates.supportsTranscription !== undefined)
      this.supportsTranscription = updates.supportsTranscription;
    if (updates.supportsTranslation !== undefined)
      this.supportsTranslation = updates.supportsTranslation;
    if (updates.supportsReranking !== undefined) this.supportsReranking = updates.supportsReranking;
    if (updates.pricingInput !== undefined) this.pricingInput = updates.pricingInput;
    if (updates.pricingOutput !== undefined) this.pricingOutput = updates.pricingOutput;
    if (updates.status !== undefined) this.status = updates.status;
    if (updates.enabled !== undefined) this.enabled = updates.enabled;
    this.updatedAt = new Date();
  }

  softDelete(): void {
    this.deletedAt = new Date();
    this.updatedAt = new Date();
  }

  isDeleted(): boolean {
    return this.deletedAt !== null;
  }
}
