import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IStandardRepository, StandardSearchParams, StandardSearchResult } from '../../domain/interfaces/standard.repository.interface.js';
import { StandardEntity } from '../../domain/entities/standard.entity.js';

@Injectable()
export class StandardRepository implements IStandardRepository {
  async findById(id: string): Promise<StandardEntity | null> {
    const row = await prisma.engineering_standards.findUnique({ where: { id } });
    return row ? this._toEntity(row) : null;
  }

  async findByCode(code: string): Promise<StandardEntity | null> {
    const row = await prisma.engineering_standards.findUnique({ where: { code } });
    return row ? this._toEntity(row) : null;
  }

  async findAll(params: StandardSearchParams): Promise<StandardSearchResult> {
    const where: any = {};

    if (params.status) where.status = params.status;
    if (params.organization) where.organization = params.organization;

    if (params.query) {
      where.OR = [
        { code: { contains: params.query, mode: 'insensitive' } },
        { title: { contains: params.query, mode: 'insensitive' } },
        { organization: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.engineering_standards.findMany({
        where,
        skip: params.offset ?? 0,
        take: params.limit ?? 20,
        orderBy: { code: 'asc' },
      }),
      prisma.engineering_standards.count({ where }),
    ]);

    return { data: data.map(r => this._toEntity(r)), total };
  }

  async save(entity: StandardEntity): Promise<void> {
    await prisma.engineering_standards.upsert({
      where: { id: entity.id },
      update: {
        code: entity.code,
        title: entity.title,
        organization: entity.organization,
        version: entity.version,
        published_at: entity.publishedAt,
        status: entity.status,
      },
      create: {
        id: entity.id,
        code: entity.code,
        title: entity.title,
        organization: entity.organization,
        version: entity.version,
        published_at: entity.publishedAt,
        status: entity.status,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.engineering_standards.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.engineering_standards.count({ where: { id } });
    return count > 0;
  }

  private _toEntity(row: any): StandardEntity {
    return StandardEntity.reconstitute({
      id: row.id,
      code: row.code,
      title: row.title,
      organization: row.organization,
      version: row.version,
      publishedAt: row.published_at ?? null,
      status: row.status,
    });
  }
}
