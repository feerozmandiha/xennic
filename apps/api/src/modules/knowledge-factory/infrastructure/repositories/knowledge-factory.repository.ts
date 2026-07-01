import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IKnowledgeFactoryRepository } from '../../domain/interfaces/knowledge-factory.repository.interface.js';
import { EkosEntity } from '../../domain/ekos.entity.js';
import type { SourceType, EkoStatus } from '../../domain/constants.js';

@Injectable()
export class KnowledgeFactoryRepository implements IKnowledgeFactoryRepository {
  async save(entity: EkosEntity): Promise<void> {
    const data = {
      id: entity.id,
      workspace_id: entity.workspaceId,
      slug: `eko-${entity.id}`,
      status: entity.status,
      visibility: 'private',
      language: 'en',
      version: 1,
      is_active: true,
      content: {
        documentId: entity.documentId,
        sourceType: entity.sourceType,
        metadata: entity.metadata,
        checksum: entity.checksum,
        content: entity.content,
      } as any,
      search_text: entity.content.slice(0, 5000),
      author_id: null,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
      published_at: null,
      reviewed_at: null,
      archived_at: null,
    };

    await prisma.knowledge.upsert({
      where: { id: entity.id },
      update: {
        status: entity.status,
        is_active: true,
        content: data.content,
        search_text: data.search_text,
        updated_at: entity.updatedAt,
      },
      create: data,
    });
  }

  async findById(id: string): Promise<EkosEntity | null> {
    const row = await prisma.knowledge.findUnique({ where: { id } });
    if (!row) return null;
    return this.toEntity(row);
  }

  async findByChecksum(checksum: string): Promise<EkosEntity | null> {
    const rows = await prisma.knowledge.findMany({
      where: {
        content: {
          path: ['checksum'],
          equals: checksum,
        },
      },
      take: 1,
    });
    if (!rows.length) return null;
    return this.toEntity(rows[0]);
  }

  async findByWorkspace(workspaceId: string): Promise<EkosEntity[]> {
    const rows = await prisma.knowledge.findMany({
      where: { workspace_id: workspaceId },
      orderBy: { created_at: 'desc' },
    });
    return rows.map((r) => this.toEntity(r));
  }

  async updateStatus(id: string, status: EkoStatus): Promise<void> {
    await prisma.knowledge.update({
      where: { id },
      data: { status, updated_at: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await prisma.knowledge.delete({ where: { id } });
  }

  private toEntity(row: any): EkosEntity {
    const content = (row.content as Record<string, unknown>) ?? {};
    return EkosEntity.reconstitute({
      id: row.id,
      documentId: (content.documentId as string) ?? '',
      workspaceId: row.workspace_id,
      sourceType: (content.sourceType as SourceType) ?? 'pdf',
      content: (content.content as string) ?? '',
      metadata: (content.metadata as Record<string, unknown>) ?? {},
      checksum: (content.checksum as string) ?? '',
      status: (row.status as EkoStatus) ?? 'pending',
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
}
