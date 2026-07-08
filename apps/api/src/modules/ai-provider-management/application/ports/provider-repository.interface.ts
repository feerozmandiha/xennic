import { AIProviderEntity, ProviderType } from '../../domain/entities/ai-provider.entity.js';

export interface IProviderRepository {
  findById(id: string): Promise<AIProviderEntity | null>;
  findByName(name: string): Promise<AIProviderEntity | null>;
  findByType(type: ProviderType): Promise<AIProviderEntity[]>;
  findAll(options?: { enabled?: boolean; status?: string; includeDeleted?: boolean }): Promise<AIProviderEntity[]>;
  save(provider: AIProviderEntity): Promise<void>;
  delete(id: string): Promise<void>;
  count(options?: { enabled?: boolean }): Promise<number>;
  exists(id: string): Promise<boolean>;
  existsByName(name: string): Promise<boolean>;
}

export const IPROVIDER_REPOSITORY = 'IProviderRepository';
