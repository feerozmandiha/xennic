import { Injectable, Logger, Inject } from '@nestjs/common';
import { DiscoveryStrategyFactory } from '../../infrastructure/discovery/discovery-strategy.factory.js';
import type { IModelRepository } from '../ports/model-repository.interface.js';
import { IMODEL_REPOSITORY } from '../ports/model-repository.interface.js';
import type { IProviderRepository } from '../ports/provider-repository.interface.js';
import { IPROVIDER_REPOSITORY } from '../ports/provider-repository.interface.js';
import { AIModelEntity, ModelType } from '../../domain/entities/ai-model.entity.js';
import { CredentialService } from './credential.service.js';

@Injectable()
export class ProviderDiscoveryService {
  private readonly logger = new Logger(ProviderDiscoveryService.name);

  constructor(
    private readonly strategyFactory: DiscoveryStrategyFactory,
    @Inject(IMODEL_REPOSITORY)
    private readonly modelRepo: IModelRepository,
    @Inject(IPROVIDER_REPOSITORY)
    private readonly providerRepo: IProviderRepository,
    private readonly credentials: CredentialService,
  ) {}

  async testConnection(
    apiKey: string,
    providerType: string,
    baseUrl?: string,
  ): Promise<{
    success: boolean;
    latencyMs: number;
    error?: string;
    detectedProvider?: string;
  }> {
    const strategy = this.strategyFactory.getStrategy(providerType);
    const result = await strategy.testConnection(apiKey, baseUrl);
    return {
      ...result,
      detectedProvider: result.success ? providerType : undefined,
    };
  }

  async discover(
    apiKey: string,
    providerType: string,
    baseUrl?: string,
  ): Promise<{
    providerType: string;
    providerName: string;
    baseUrl: string;
    models: AIModelEntity[];
    metadata: Record<string, unknown>;
  }> {
    const strategy = this.strategyFactory.getStrategy(providerType);
    const result = await strategy.discover(apiKey, baseUrl);
    const models = result.models.map((m) =>
      AIModelEntity.create('pending', m.modelId, m.displayName, m.modelType as ModelType, {
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
        supportsTools: m.supportsTools,
        supportsJson: m.supportsJson,
        supportsStreaming: m.supportsStreaming,
        supportsReasoning: m.supportsReasoning,
        supportsVision: m.supportsVision,
        supportsEmbedding: m.supportsEmbedding,
        supportsFunctionCalling: m.supportsFunctionCalling,
        supportsImageInput: m.supportsImageInput,
        supportsAudioInput: m.supportsAudioInput,
        supportsTranscription: m.supportsTranscription,
        supportsTranslation: m.supportsTranslation,
        supportsReranking: m.supportsReranking,
        supportsTemperature: m.supportsTemperature,
        supportsTopP: m.supportsTopP,
        supportsSeed: m.supportsSeed,
        supportsStructuredOutputs: m.supportsStructuredOutputs,
        pricingInput: m.pricingInput,
        pricingOutput: m.pricingOutput,
      }),
    );

    this.logger.log(`Discovered ${models.length} models for ${providerType}`);
    return { ...result, models };
  }

  async saveDiscoveredModels(
    providerId: string,
    models: AIModelEntity[],
  ): Promise<AIModelEntity[]> {
    const saved: AIModelEntity[] = [];
    for (const model of models) {
      try {
        const m = AIModelEntity.create(
          providerId,
          model.modelId,
          model.displayName,
          model.modelType,
          {
            contextWindow: model.contextWindow ?? undefined,
            maxOutputTokens: model.maxOutputTokens ?? undefined,
            supportsTools: model.supportsTools,
            supportsJson: model.supportsJson,
            supportsStreaming: model.supportsStreaming,
            supportsReasoning: model.supportsReasoning,
            supportsVision: model.supportsVision,
            supportsEmbedding: model.supportsEmbedding,
            supportsFunctionCalling: model.supportsFunctionCalling,
            supportsImageInput: model.supportsImageInput,
            supportsAudioInput: model.supportsAudioInput,
            supportsTranscription: model.supportsTranscription,
            supportsTranslation: model.supportsTranslation,
            supportsReranking: model.supportsReranking,
            supportsTemperature: model.supportsTemperature,
            supportsTopP: model.supportsTopP,
            supportsSeed: model.supportsSeed,
            supportsStructuredOutputs: model.supportsStructuredOutputs,
            pricingInput: model.pricingInput ?? undefined,
            pricingOutput: model.pricingOutput ?? undefined,
          },
        );
        await this.modelRepo.save(m);
        saved.push(m);
      } catch (err) {
        this.logger.warn(`Failed to save model ${model.modelId}: ${(err as Error).message}`);
      }
    }
    return saved;
  }

  async refreshModels(providerId: string): Promise<AIModelEntity[]> {
    const provider = await this.providerRepo.findById(providerId);
    if (!provider) throw new Error(`Provider ${providerId} not found`);

    const strategy = this.strategyFactory.getStrategy(provider.providerType);
    const apiKey = await this.credentials.getApiKey(providerId);
    if (!apiKey) throw new Error(`No API key available for provider ${provider.name}`);
    const result = await strategy.discover(apiKey, provider.baseUrl ?? undefined);

    const models = result.models.map((m) =>
      AIModelEntity.create(providerId, m.modelId, m.displayName, m.modelType as ModelType, {
        contextWindow: m.contextWindow,
        maxOutputTokens: m.maxOutputTokens,
        supportsTools: m.supportsTools,
        supportsJson: m.supportsJson,
        supportsStreaming: m.supportsStreaming,
        supportsReasoning: m.supportsReasoning,
        supportsVision: m.supportsVision,
        supportsEmbedding: m.supportsEmbedding,
        supportsFunctionCalling: m.supportsFunctionCalling,
        supportsTemperature: m.supportsTemperature,
        supportsTopP: m.supportsTopP,
        pricingInput: m.pricingInput,
        pricingOutput: m.pricingOutput,
      }),
    );

    // Remove old models, save new ones
    const existing = await this.modelRepo.findByProviderId(providerId);
    for (const old of existing) {
      await this.modelRepo.delete(old.id);
    }

    return this.saveDiscoveredModels(providerId, models);
  }

  getSupportedTypes(): string[] {
    return this.strategyFactory.getSupportedTypes();
  }
}
