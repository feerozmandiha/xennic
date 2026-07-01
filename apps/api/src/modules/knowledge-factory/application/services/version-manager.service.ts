import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { KnowledgeStatus } from '../../domain/knowledge-object.entity.js';

export type VersionStatus = 'active' | 'superseded' | 'deprecated' | 'withdrawn' | 'archived';

export interface VersionRecord {
  id: string;
  knowledgeObjectId: string;
  version: number;
  status: VersionStatus;
  snapshot: Record<string, unknown>;
  comment?: string;
  createdBy?: string;
  createdAt: Date;
}

@Injectable()
export class VersionManagerService {
  private readonly logger = new Logger(VersionManagerService.name);

  async createVersion(
    knowledgeObjectId: string,
    snapshot: Record<string, unknown>,
    comment?: string,
    createdBy?: string,
  ): Promise<VersionRecord> {
    const currentVersion = await prisma.knowledge_object_versions.findFirst({
      where: { knowledge_object_id: knowledgeObjectId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    const nextVersion = (currentVersion?.version ?? 0) + 1;

    const row = await prisma.knowledge_object_versions.create({
      data: {
        knowledge_object_id: knowledgeObjectId,
        version: nextVersion,
        status: 'active',
        snapshot: snapshot as any,
        comment,
        created_by: createdBy,
      },
    });

    this.logger.log(`Version ${nextVersion} created for knowledge object ${knowledgeObjectId}`);
    return this.toRecord(row);
  }

  async getVersions(knowledgeObjectId: string): Promise<VersionRecord[]> {
    const rows = await prisma.knowledge_object_versions.findMany({
      where: { knowledge_object_id: knowledgeObjectId },
      orderBy: { version: 'desc' },
    });
    return rows.map(this.toRecord);
  }

  async getVersion(knowledgeObjectId: string, version: number): Promise<VersionRecord | null> {
    const row = await prisma.knowledge_object_versions.findUnique({
      where: { knowledge_object_id_version: { knowledge_object_id: knowledgeObjectId, version } },
    });
    return row ? this.toRecord(row) : null;
  }

  async updateStatus(
    knowledgeObjectId: string,
    version: number,
    newStatus: VersionStatus,
    comment?: string,
  ): Promise<VersionRecord> {
    const existing = await prisma.knowledge_object_versions.findUnique({
      where: { knowledge_object_id_version: { knowledge_object_id: knowledgeObjectId, version } },
    });
    if (!existing) throw new ConflictException(`Version ${version} not found`);

    const row = await prisma.knowledge_object_versions.update({
      where: { id: existing.id },
      data: { status: newStatus },
    });

    this.logger.log(`Version ${version} of ${knowledgeObjectId} → ${newStatus}`);
    return this.toRecord(row);
  }

  async supersede(
    knowledgeObjectId: string,
    oldVersion: number,
    newVersion: number,
  ): Promise<void> {
    await prisma.$transaction([
      prisma.knowledge_object_versions.update({
        where: { knowledge_object_id_version: { knowledge_object_id: knowledgeObjectId, version: oldVersion } },
        data: { status: 'superseded' },
      }),
      prisma.knowledge_object_versions.update({
        where: { knowledge_object_id_version: { knowledge_object_id: knowledgeObjectId, version: newVersion } },
        data: { status: 'active' },
      }),
    ]);
    this.logger.log(`Version ${oldVersion} superseded by version ${newVersion}`);
  }

  private toRecord(row: any): VersionRecord {
    return {
      id: row.id,
      knowledgeObjectId: row.knowledge_object_id,
      version: row.version,
      status: row.status,
      snapshot: row.snapshot as Record<string, unknown>,
      comment: row.comment ?? undefined,
      createdBy: row.created_by ?? undefined,
      createdAt: row.created_at,
    };
  }
}
