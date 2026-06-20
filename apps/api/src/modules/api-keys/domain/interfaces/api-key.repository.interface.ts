import type { ApiKeyEntity } from '../entities/api-key.entity.js';

export interface IApiKeyRepository {
  save(apiKey: ApiKeyEntity): Promise<void>;
  update(apiKey: ApiKeyEntity): Promise<void>;
  findById(id: string): Promise<ApiKeyEntity | null>;
  findByKeyHash(keyHash: string): Promise<ApiKeyEntity | null>;
  findAllByWorkspace(
    workspaceId: string,
    options?: { offset?: number; limit?: number },
  ): Promise<ApiKeyEntity[]>;
  countByWorkspace(workspaceId: string): Promise<number>;
  delete(id: string): Promise<void>;
}
