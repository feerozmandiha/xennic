import { AIModelEntity, ModelType } from '../../domain/entities/ai-model.entity.js';

export interface IModelRepository {
  findById(id: string): Promise<AIModelEntity | null>;
  findByProviderId(providerId: string): Promise<AIModelEntity[]>;
  findByModelId(providerId: string, modelId: string): Promise<AIModelEntity | null>;
  findByType(type: ModelType, options?: { enabledOnly?: boolean }): Promise<AIModelEntity[]>;
  findAll(options?: { enabledOnly?: boolean; includeDeleted?: boolean }): Promise<AIModelEntity[]>;
  save(model: AIModelEntity): Promise<void>;
  delete(id: string): Promise<void>;
  existsByModelId(providerId: string, modelId: string): Promise<boolean>;
}

export const IMODEL_REPOSITORY = 'IModelRepository';
