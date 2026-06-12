import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IStorageRepository } from '../../domain/interfaces/storage.repository.interface.js';
import { FileEntity } from '../../domain/entities/file.entity.js';

@Injectable()
export class StorageRepository implements IStorageRepository {

  async save(file: FileEntity): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "files" (
          id, workspace_id, bucket, path, filename, original_name,
          extension, mime_type, size, checksum, uploaded_by, created_at
        ) VALUES (
          ${file.id}, ${file.workspaceId}, ${file.bucket}, ${file.path},
          ${file.filename}, ${file.originalName}, ${file.extension},
          ${file.mimeType}, ${BigInt(file.size)}, ${file.checksum},
          ${file.uploadedBy}, ${file.createdAt}
        )
      `;
    } catch (err) {
      throw new Error(`StorageRepository.save failed: ${(err as Error).message}`);
    }
  }

  async findById(id: string): Promise<FileEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "files"
        WHERE id = ${id} AND deleted_at IS NULL
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch { return null; }
  }

  async findAll(
    workspaceId: string,
    options?: { mimeType?: string; bucket?: string; offset?: number; limit?: number },
  ): Promise<FileEntity[]> {
    const offset = options?.offset ?? 0;
    const limit  = options?.limit  ?? 20;

    try {
      let rows: any[];
      if (options?.bucket && options?.mimeType) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "files"
          WHERE workspace_id = ${workspaceId}
            AND deleted_at IS NULL
            AND bucket = ${options.bucket}
            AND mime_type LIKE ${options.mimeType + '%'}
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
      } else if (options?.bucket) {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "files"
          WHERE workspace_id = ${workspaceId}
            AND deleted_at IS NULL
            AND bucket = ${options.bucket}
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
      } else {
        rows = await prisma.$queryRaw<any[]>`
          SELECT * FROM "files"
          WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
          ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}
        `;
      }
      return rows.map(r => this._map(r));
    } catch { return []; }
  }

  async count(workspaceId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM "files"
        WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
      `;
      return Number(result[0]?.count ?? 0);
    } catch { return 0; }
  }

  async softDelete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "files" SET deleted_at = NOW() WHERE id = ${id}
      `;
    } catch (err) {
      throw new Error(`StorageRepository.softDelete failed: ${(err as Error).message}`);
    }
  }

  async getTotalSize(workspaceId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<{ total: string }[]>`
        SELECT COALESCE(SUM(size), 0)::text as total FROM "files"
        WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
      `;
      return Number(result[0]?.total ?? 0);
    } catch { return 0; }
  }

  private _map(row: any): FileEntity {
    return FileEntity.reconstitute({
      id:           row.id,
      workspaceId:  row.workspace_id,
      bucket:       row.bucket,
      path:         row.path,
      filename:     row.filename,
      originalName: row.original_name,
      extension:    row.extension,
      mimeType:     row.mime_type,
      size:         Number(row.size),
      checksum:     row.checksum ?? null,
      uploadedBy:   row.uploaded_by,
      createdAt:    row.created_at,
      deletedAt:    row.deleted_at ?? null,
    });
  }
}
