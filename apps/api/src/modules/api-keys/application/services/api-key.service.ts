import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import type { IApiKeyRepository } from '../../domain/interfaces/api-key.repository.interface.js';
import { ApiKeyEntity } from '../../domain/entities/api-key.entity.js';

@Injectable()
export class ApiKeyService {
  constructor(
    @Inject('IApiKeyRepository')
    private readonly apiKeyRepository: IApiKeyRepository,
  ) {}

  async create(data: {
    workspaceId: string;
    name: string;
    expiresAt?: Date;
  }): Promise<{ apiKey: ApiKeyEntity; rawKey: string }> {
    const existing = await this.apiKeyRepository.findAllByWorkspace(data.workspaceId, { limit: 100 });
    if (existing.length >= 50) {
      throw new BadRequestException('Maximum number of API keys (50) reached for this workspace');
    }

    if (!data.name || data.name.trim().length === 0) {
      throw new BadRequestException('API key name is required');
    }

    const { entity, rawKey } = ApiKeyEntity.create(data);
    await this.apiKeyRepository.save(entity);
    return { apiKey: entity, rawKey };
  }

  async findAll(
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: ApiKeyEntity[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.apiKeyRepository.findAllByWorkspace(workspaceId, { offset, limit }),
      this.apiKeyRepository.countByWorkspace(workspaceId),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, workspaceId: string): Promise<ApiKeyEntity> {
    return this._getKey(id, workspaceId);
  }

  async revoke(id: string, workspaceId: string): Promise<ApiKeyEntity> {
    const key = await this._getKey(id, workspaceId);
    if (key.status === 'revoked') {
      throw new BadRequestException('API key is already revoked');
    }
    key.revoke();
    await this.apiKeyRepository.update(key);
    return key;
  }

  async delete(id: string, workspaceId: string): Promise<void> {
    const key = await this._getKey(id, workspaceId);
    await this.apiKeyRepository.delete(key.id);
  }

  async validate(rawKey: string): Promise<ApiKeyEntity | null> {
    const keyHash = ApiKeyEntity.hashKey(rawKey);
    const key = await this.apiKeyRepository.findByKeyHash(keyHash);
    if (!key) return null;
    if (!key.isActive()) return null;
    key.markAsUsed();
    await this.apiKeyRepository.update(key).catch(() => {});
    return key;
  }

  private async _getKey(id: string, workspaceId: string): Promise<ApiKeyEntity> {
    const key = await this.apiKeyRepository.findById(id);
    if (!key) {
      throw new NotFoundException(`API key "${id}" not found`);
    }
    if (key.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied to this API key');
    }
    return key;
  }
}
