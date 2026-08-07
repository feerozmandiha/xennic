import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IFileVersionRepository } from '../../domain/interfaces/file-version.repository.interface.js';
import { FileVersionEntity } from '../../domain/entities/file-version.entity.js';

@Injectable()
export class FileVersionRepository implements IFileVersionRepository {
  async save(version: FileVersionEntity): Promise<void> {
    await prisma.$executeRaw`
      INSERT INTO "file_versions" (
        id,
        file_id,
        version,
        path,
        size,
        mime_type,
        original_name,
        checksum,
        change_reason,
        created_by,
        created_at
      ) VALUES (
        ${version.id},
        ${version.fileId},
        ${version.version},
        ${version.path},
        ${BigInt(version.size)},
        ${version.mimeType},
        ${version.originalName},
        ${version.checksum},
        ${version.changeReason},
        ${version.createdBy},
        ${version.createdAt}
      )
    `;
  }

  async findById(id: string): Promise<FileVersionEntity | null> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM "file_versions"
      WHERE id = ${id}
      LIMIT 1
    `;

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]);
  }

  async findByFileId(
    fileId: string,
    options?: { offset?: number; limit?: number },
  ): Promise<FileVersionEntity[]> {
    const offset = options?.offset ?? 0;
    const limit = options?.limit ?? 20;

    const rows = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM "file_versions"
      WHERE file_id = ${fileId}
      ORDER BY version DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return rows.map((row) => this.mapRow(row));
  }

  async findByFileIdAndVersion(fileId: string, version: number): Promise<FileVersionEntity | null> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM "file_versions"
      WHERE file_id = ${fileId}
        AND version = ${version}
      LIMIT 1
    `;

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]);
  }

  async getLatestVersion(fileId: string): Promise<FileVersionEntity | null> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT *
      FROM "file_versions"
      WHERE file_id = ${fileId}
      ORDER BY version DESC
      LIMIT 1
    `;

    if (rows.length === 0) return null;
    return this.mapRow(rows[0]);
  }

  async getNextVersionNumber(fileId: string): Promise<number> {
    const rows = await prisma.$queryRaw<{ next_version: number }[]>`
      SELECT COALESCE(MAX(version), 0) + 1 AS next_version
      FROM "file_versions"
      WHERE file_id = ${fileId}
    `;

    return Number(rows[0]?.next_version ?? 1);
  }

  async countByFileId(fileId: string): Promise<number> {
    const rows = await prisma.$queryRaw<{ count: string }[]>`
      SELECT COUNT(*)::text AS count
      FROM "file_versions"
      WHERE file_id = ${fileId}
    `;

    return Number(rows[0]?.count ?? 0);
  }

  async delete(id: string): Promise<void> {
    await prisma.$executeRaw`
      DELETE FROM "file_versions"
      WHERE id = ${id}
    `;
  }

  private mapRow(row: any): FileVersionEntity {
    return FileVersionEntity.reconstitute({
      id: row.id,
      fileId: row.file_id,
      version: Number(row.version),
      path: row.path,
      size: Number(row.size),
      mimeType: row.mime_type,
      originalName: row.original_name,
      checksum: row.checksum ?? null,
      changeReason: row.change_reason ?? null,
      createdBy: row.created_by ?? null,
      createdAt: row.created_at,
    });
  }
}
