import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IRoleRepository } from '../../domain/interfaces/role.repository.interface.js';
import { RoleEntity } from '../../domain/entities/role.entity.js';

@Injectable()
export class RoleRepository implements IRoleRepository {

  // ─── save ───────────────────────────────────────────────────────────────────

  async save(role: RoleEntity): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "roles" WHERE id = ${role.id}
      `;

      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "roles" SET
            name        = ${role.name},
            description = ${role.description},
            updated_at  = ${role.updatedAt}
          WHERE id = ${role.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "roles" (id, name, slug, description, created_at, updated_at)
          VALUES (
            ${role.id},
            ${role.name},
            ${role.slug},
            ${role.description},
            ${role.createdAt},
            ${role.updatedAt}
          )
        `;
      }
    } catch (err) {
      const error = err as Error;
      throw new Error(`RoleRepository.save failed: ${error.message}`);
    }
  }

  // ─── findById ────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<RoleEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "roles" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch (err) {
      const error = err as Error;
      console.error('RoleRepository.findById error:', error.message);
      return null;
    }
  }

  // ─── findBySlug ──────────────────────────────────────────────────────────────

  async findBySlug(slug: string): Promise<RoleEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "roles" WHERE slug = ${slug} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch (err) {
      const error = err as Error;
      console.error('RoleRepository.findBySlug error:', error.message);
      return null;
    }
  }

  // ─── findAll ─────────────────────────────────────────────────────────────────

  async findAll(offset = 0, limit = 100): Promise<RoleEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "roles"
        ORDER BY created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('RoleRepository.findAll error:', error.message);
      return [];
    }
  }

  // ─── count ───────────────────────────────────────────────────────────────────

  async count(): Promise<number> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "roles"
      `;
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }

  // ─── delete ──────────────────────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    try {
      await prisma.$executeRaw`DELETE FROM "roles" WHERE id = ${id}`;
    } catch (err) {
      const error = err as Error;
      throw new Error(`RoleRepository.delete failed: ${error.message}`);
    }
  }

  // ─── findUserRolesInWorkspace ────────────────────────────────────────────────

  async findUserRolesInWorkspace(
    userId: string,
    workspaceId: string,
  ): Promise<RoleEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT r.*
        FROM "roles" r
        INNER JOIN "user_roles" ur ON ur.role_id = r.id
        WHERE ur.user_id      = ${userId}
          AND ur.workspace_id = ${workspaceId}
      `;
      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('RoleRepository.findUserRolesInWorkspace error:', error.message);
      return [];
    }
  }

  // ─── assignRoleToUser ────────────────────────────────────────────────────────

  async assignRoleToUser(
    userId: string,
    roleId: string,
    workspaceId: string,
    assignedBy?: string,
  ): Promise<void> {
    try {
      // جلوگیری از duplicate
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "user_roles"
        WHERE user_id = ${userId} AND role_id = ${roleId} AND workspace_id = ${workspaceId}
        LIMIT 1
      `;
      if (existing && existing.length > 0) return;

      await prisma.$executeRaw`
        INSERT INTO "user_roles" (id, user_id, role_id, workspace_id)
        VALUES (${crypto.randomUUID()}, ${userId}, ${roleId}, ${workspaceId})
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`RoleRepository.assignRoleToUser failed: ${error.message}`);
    }
  }

  // ─── removeRoleFromUser ──────────────────────────────────────────────────────

  async removeRoleFromUser(
    userId: string,
    roleId: string,
    workspaceId: string,
  ): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "user_roles"
        WHERE user_id = ${userId} AND role_id = ${roleId} AND workspace_id = ${workspaceId}
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`RoleRepository.removeRoleFromUser failed: ${error.message}`);
    }
  }

  // ─── mapper ──────────────────────────────────────────────────────────────────

  private _map(row: any): RoleEntity {
    return RoleEntity.reconstitute({
      id:          row.id,
      name:        row.name,
      slug:        row.slug,
      description: row.description ?? null,
      createdAt:   row.created_at,
      updatedAt:   row.updated_at,
    });
  }
}
