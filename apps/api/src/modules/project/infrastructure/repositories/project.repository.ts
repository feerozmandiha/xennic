import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IProjectRepository } from '../../domain/interfaces/project.repository.interface.js';
import {
  ProjectEntity,
  ProjectMember,
  ProjectMemberRole,
  ProjectNote,
} from '../../domain/entities/project.entity.js';

@Injectable()
export class ProjectRepository implements IProjectRepository {

  // ══════════════════════════════════════════════════════════════════════════
  // PROJECT CRUD
  // ══════════════════════════════════════════════════════════════════════════

  async save(project: ProjectEntity): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "projects" WHERE id = ${project.id}
      `;

      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "projects" SET
            name        = ${project.name},
            description = ${project.description},
            status      = ${project.status},
            start_date  = ${project.startDate},
            end_date    = ${project.endDate},
            updated_by  = ${project.updatedBy},
            updated_at  = ${project.updatedAt},
            deleted_at  = ${project.deletedAt}
          WHERE id = ${project.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "projects" (
            id, workspace_id, name, description, status,
            start_date, end_date, created_by, updated_by,
            created_at, updated_at
          ) VALUES (
            ${project.id},
            ${project.workspaceId},
            ${project.name},
            ${project.description},
            ${project.status},
            ${project.startDate},
            ${project.endDate},
            ${project.createdBy},
            ${project.updatedBy},
            ${project.createdAt},
            ${project.updatedAt}
          )
        `;
      }
    } catch (err) {
      const error = err as Error;
      throw new Error(`ProjectRepository.save failed: ${error.message}`);
    }
  }

  async findById(id: string): Promise<ProjectEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "projects" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapProject(rows[0]);
    } catch (err) {
      const error = err as Error;
      console.error('ProjectRepository.findById error:', error.message);
      return null;
    }
  }

  async findAll(
    workspaceId: string,
    offset = 0,
    limit = 20,
  ): Promise<ProjectEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "projects"
        WHERE workspace_id = ${workspaceId}
          AND deleted_at IS NULL
        ORDER BY created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map((r) => this._mapProject(r));
    } catch (err) {
      const error = err as Error;
      console.error('ProjectRepository.findAll error:', error.message);
      return [];
    }
  }

  async count(workspaceId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "projects"
        WHERE workspace_id = ${workspaceId} AND deleted_at IS NULL
      `;
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      // cascade: حذف members و notes
      await prisma.$executeRaw`DELETE FROM "project_members" WHERE project_id = ${id}`;
      await prisma.$executeRaw`DELETE FROM "project_notes"   WHERE project_id = ${id}`;
      await prisma.$executeRaw`DELETE FROM "projects"        WHERE id = ${id}`;
    } catch (err) {
      const error = err as Error;
      throw new Error(`ProjectRepository.delete failed: ${error.message}`);
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT 1 FROM "projects" WHERE id = ${id} LIMIT 1
      `;
      return rows.length > 0;
    } catch {
      return false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MEMBERS
  // ══════════════════════════════════════════════════════════════════════════

  async saveMember(member: ProjectMember): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "project_members"
        WHERE project_id = ${member.projectId} AND user_id = ${member.userId}
        LIMIT 1
      `;
      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "project_members" SET role = ${member.role}
          WHERE project_id = ${member.projectId} AND user_id = ${member.userId}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "project_members" (id, project_id, user_id, role, joined_at)
          VALUES (${member.id}, ${member.projectId}, ${member.userId}, ${member.role}, ${member.joinedAt})
        `;
      }
    } catch (err) {
      const error = err as Error;
      throw new Error(`ProjectRepository.saveMember failed: ${error.message}`);
    }
  }

  async findMembers(projectId: string): Promise<ProjectMember[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "project_members"
        WHERE project_id = ${projectId}
        ORDER BY joined_at ASC
      `;
      return rows.map((r) => this._mapMember(r));
    } catch (err) {
      const error = err as Error;
      console.error('ProjectRepository.findMembers error:', error.message);
      return [];
    }
  }

  async findMember(
    projectId: string,
    userId: string,
  ): Promise<ProjectMember | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "project_members"
        WHERE project_id = ${projectId} AND user_id = ${userId}
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapMember(rows[0]);
    } catch {
      return null;
    }
  }

  async removeMember(projectId: string, userId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "project_members"
        WHERE project_id = ${projectId} AND user_id = ${userId}
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`ProjectRepository.removeMember failed: ${error.message}`);
    }
  }

  async isMember(projectId: string, userId: string): Promise<boolean> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT 1 FROM "project_members"
        WHERE project_id = ${projectId} AND user_id = ${userId}
        LIMIT 1
      `;
      return rows.length > 0;
    } catch {
      return false;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NOTES
  // ══════════════════════════════════════════════════════════════════════════

  async saveNote(note: ProjectNote): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO "project_notes" (id, project_id, content, created_by, created_at)
        VALUES (${note.id}, ${note.projectId}, ${note.content}, ${note.createdBy}, ${note.createdAt})
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`ProjectRepository.saveNote failed: ${error.message}`);
    }
  }

  async findNotes(projectId: string): Promise<ProjectNote[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "project_notes"
        WHERE project_id = ${projectId}
        ORDER BY created_at DESC
      `;
      return rows.map((r) => new ProjectNote(
        r.id,
        r.project_id,
        r.content,
        r.created_by,
        r.created_at,
      ));
    } catch (err) {
      const error = err as Error;
      console.error('ProjectRepository.findNotes error:', error.message);
      return [];
    }
  }

  async deleteNote(noteId: string): Promise<void> {
    try {
      await prisma.$executeRaw`DELETE FROM "project_notes" WHERE id = ${noteId}`;
    } catch (err) {
      const error = err as Error;
      throw new Error(`ProjectRepository.deleteNote failed: ${error.message}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAPPERS
  // ══════════════════════════════════════════════════════════════════════════

  private _mapProject(row: any): ProjectEntity {
    return ProjectEntity.reconstitute({
      id:          row.id,
      workspaceId: row.workspace_id,
      name:        row.name,
      description: row.description ?? null,
      status:      row.status,
      startDate:   row.start_date  ?? null,
      endDate:     row.end_date    ?? null,
      createdBy:   row.created_by,
      updatedBy:   row.updated_by  ?? null,
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
      deletedAt:   row.deleted_at  ?? null,
    });
  }

  private _mapMember(row: any): ProjectMember {
    return new ProjectMember(
      row.id,
      row.project_id,
      row.user_id,
      row.role as ProjectMemberRole,
      row.joined_at,
    );
  }
}
