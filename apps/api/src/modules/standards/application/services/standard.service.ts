import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { IStandardRepository } from '../../domain/interfaces/standard.repository.interface.js';
import { StandardEntity } from '../../domain/entities/standard.entity.js';
import type { CreateStandardDto, UpdateStandardDto } from '../../presentation/dtos/standard.dto.js';

export interface PaginatedStandards {
  data: StandardEntity[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable()
export class StandardService {
  constructor(
    @Inject('IStandardRepository')
    private readonly repository: IStandardRepository,
  ) {}

  async findAll(page = 1, limit = 20, query?: string, organization?: string, status?: string): Promise<PaginatedStandards> {
    const offset = (page - 1) * limit;
    const result = await this.repository.findAll({
      query,
      organization,
      status,
      offset,
      limit,
    });
    return {
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }

  async findById(id: string): Promise<StandardEntity> {
    const entity = await this.repository.findById(id);
    if (!entity) throw new NotFoundException('Standard not found');
    return entity;
  }

  async findByCode(code: string): Promise<StandardEntity> {
    const entity = await this.repository.findByCode(code);
    if (!entity) throw new NotFoundException('Standard not found');
    return entity;
  }

  async create(dto: CreateStandardDto): Promise<StandardEntity> {
    const existing = await this.repository.findByCode(dto.code);
    if (existing) throw new ConflictException('Standard with this code already exists');

    const entity = StandardEntity.reconstitute({
      id: randomUUID(),
      code: dto.code,
      title: dto.title,
      organization: dto.organization,
      version: dto.version,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
      status: dto.status ?? 'active',
    });

    await this.repository.save(entity);
    return entity;
  }

  async update(id: string, dto: UpdateStandardDto): Promise<StandardEntity> {
    const entity = await this.findById(id);

    if (dto.code && dto.code !== entity.code) {
      const existing = await this.repository.findByCode(dto.code);
      if (existing) throw new ConflictException('Standard with this code already exists');
    }

    const updated = StandardEntity.reconstitute({
      id: entity.id,
      code: dto.code ?? entity.code,
      title: dto.title ?? entity.title,
      organization: dto.organization ?? entity.organization,
      version: dto.version ?? entity.version,
      publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : entity.publishedAt,
      status: dto.status ?? entity.status,
    });

    await this.repository.save(updated);
    return updated;
  }

  async remove(id: string): Promise<void> {
    await this.findById(id);
    await this.repository.delete(id);
  }
}
