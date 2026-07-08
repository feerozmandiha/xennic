import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { IModelRepository } from '../ports/model-repository.interface.js';
import { IMODEL_REPOSITORY } from '../ports/model-repository.interface.js';
import { Inject } from '@nestjs/common';
import { AIModelEntity, ModelType } from '../../domain/entities/ai-model.entity.js';

@Injectable()
export class ModelRegistryService {
  private readonly logger = new Logger(ModelRegistryService.name);

  constructor(
    @Inject(IMODEL_REPOSITORY)
    private readonly modelRepo: IModelRepository,
  ) {}

  async findByProviderId(providerId: string): Promise<AIModelEntity[]> {
    return this.modelRepo.findByProviderId(providerId);
  }

  async findByType(type: ModelType): Promise<AIModelEntity[]> {
    return this.modelRepo.findByType(type, { enabledOnly: true });
  }

  async findAll(options?: { enabledOnly?: boolean }): Promise<AIModelEntity[]> {
    return this.modelRepo.findAll(options);
  }

  async updateModel(id: string, updates: Partial<{
    displayName: string; contextWindow: number; maxOutputTokens: number;
    supportsTools: boolean; supportsJson: boolean; supportsStreaming: boolean;
    supportsReasoning: boolean; supportsVision: boolean; supportsEmbedding: boolean;
    supportsFunctionCalling: boolean; pricingInput: number; pricingOutput: number;
    enabled: boolean; status: string;
  }>): Promise<AIModelEntity> {
    const model = await this.modelRepo.findById(id);
    if (!model) throw new NotFoundException(`Model ${id} not found`);
    model.update(updates as any);
    await this.modelRepo.save(model);
    return model;
  }

  async getChatModels(): Promise<AIModelEntity[]> {
    return this.modelRepo.findByType('chat', { enabledOnly: true });
  }

  async getEmbeddingModels(): Promise<AIModelEntity[]> {
    return this.modelRepo.findByType('embedding', { enabledOnly: true });
  }

  async getVisionModels(): Promise<AIModelEntity[]> {
    return this.modelRepo.findByType('vision', { enabledOnly: true });
  }

  async getReasoningModels(): Promise<AIModelEntity[]> {
    return this.modelRepo.findByType('reasoning', { enabledOnly: true });
  }
}
