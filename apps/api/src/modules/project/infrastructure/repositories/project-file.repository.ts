import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IProjectFileRepository } from '../../domain/interfaces/project-file.repository.interface.js';
import { ProjectFile } from '../../domain/entities/project-file.entity.js';

@Injectable()
export class ProjectFileRepository implements IProjectFileRepository {
  async save(projectFile: ProjectFile): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "project_files" (id, project_id, file_id, added_by, created_at)
        VALUES (${projectFile.id}, ${projectFile.projectId}, ${projectFile.fileId}, ${projectFile.addedBy}, ${projectFile.createdAt})
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`ProjectFileRepository.save failed: ${error.message}`);
    }
  }

  async findByProjectId(projectId: string, offset = 0, limit = 50): Promise<ProjectFile[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "project_files"
        WHERE project_id = ${projectId}
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('ProjectFileRepository.findByProjectId error:', error.message);
      return [];
    }
  }

  async findByFileId(fileId: string): Promise<ProjectFile[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "project_files"
        WHERE file_id = ${fileId}
        ORDER BY created_at DESC
      `;
      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('ProjectFileRepository.findByFileId error:', error.message);
      return [];
    }
  }

  async find(projectId: string, fileId: string): Promise<ProjectFile | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "project_files"
        WHERE project_id = ${projectId} AND file_id = ${fileId}
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch {
      return null;
    }
  }

  async delete(projectId: string, fileId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "project_files"
        WHERE project_id = ${projectId} AND file_id = ${fileId}
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`ProjectFileRepository.delete failed: ${error.message}`);
    }
  }

  async countByProjectId(projectId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<{ count: string }[]>`
        SELECT COUNT(*)::text as count FROM "project_files"
        WHERE project_id = ${projectId}
      `;
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }

  async exists(projectId: string, fileId: string): Promise<boolean> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT 1 FROM "project_files"
        WHERE project_id = ${projectId} AND file_id = ${fileId}
        LIMIT 1
      `;
      return rows.length > 0;
    } catch {
      return false;
    }
  }

  private _map(row: any): ProjectFile {
    return ProjectFile.reconstitute({
      id: row.id,
      projectId: row.project_id,
      fileId: row.file_id,
      addedBy: row.added_by,
      createdAt: row.created_at,
    });
  }
}
