import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { IPermissionRepository } from '../../domain/interfaces/permission.repository.interface.js';
import { PermissionEntity } from '../../domain/entities/permission.entity.js';

@Injectable()
export class PermissionRepository implements IPermissionRepository {

  // ─── save ───────────────────────────────────────────────────────────────────

  async save(permission: PermissionEntity): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "permissions" WHERE id = ${permission.id}
      `;

      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "permissions" SET
            name        = ${permission.name},
            description = ${permission.description}
          WHERE id = ${permission.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "permissions" (id, name, slug, description, domain, created_at)
          VALUES (
            ${permission.id},
            ${permission.name},
            ${permission.slug},
            ${permission.description},
            ${permission.domain},
            ${permission.createdAt}
          )
        `;
      }
    } catch (err) {
      const error = err as Error;
      throw new Error(`PermissionRepository.save failed: ${error.message}`);
    }
  }

  // ─── findById ────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<PermissionEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "permissions" WHERE id = ${id} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch (err) {
      const error = err as Error;
      console.error('PermissionRepository.findById error:', error.message);
      return null;
    }
  }

  // ─── findBySlug ──────────────────────────────────────────────────────────────

  async findBySlug(slug: string): Promise<PermissionEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "permissions" WHERE slug = ${slug} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._map(rows[0]);
    } catch (err) {
      const error = err as Error;
      console.error('PermissionRepository.findBySlug error:', error.message);
      return null;
    }
  }

  // ─── findAll ─────────────────────────────────────────────────────────────────

  async findAll(offset = 0, limit = 200): Promise<PermissionEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "permissions"
        ORDER BY domain ASC, slug ASC
        LIMIT ${limit} OFFSET ${offset}
      `;
      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('PermissionRepository.findAll error:', error.message);
      return [];
    }
  }

  // ─── findByDomain ────────────────────────────────────────────────────────────

  async findByDomain(domain: string): Promise<PermissionEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "permissions"
        WHERE domain = ${domain}
        ORDER BY slug ASC
      `;
      return rows.map((r) => this._map(r));
    } catch (err) {
      const error = err as Error;
      console.error('PermissionRepository.findByDomain error:', error.message);
      return [];
    }
  }

  // ─── count ───────────────────────────────────────────────────────────────────

  async count(): Promise<number> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "permissions"
      `;
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }

  // ─── delete ──────────────────────────────────────────────────────────────────

  async delete(id: string): Promise<void> {
    try {
      // پاک‌کردن وابستگی‌های role_permissions ابتدا
      await prisma.$executeRaw`
        DELETE FROM "role_permissions" WHERE permission_id = ${id}
      `;
      await prisma.$executeRaw`
        DELETE FROM "permissions" WHERE id = ${id}
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`PermissionRepository.delete failed: ${error.message}`);
    }
  }

  // ─── hasPermissionForRoles ───────────────────────────────────────────────────

  async hasPermissionForRoles(
    roleIds: string[],
    permissionSlug: string,
  ): Promise<boolean> {
    if (!roleIds || roleIds.length === 0) return false;
    try {
      // استفاده از ANY به جای IN برای آرایه‌های Prisma raw
      const rows = await prisma.$queryRaw<any[]>`
        SELECT 1
        FROM "role_permissions" rp
        INNER JOIN "permissions" p ON p.id = rp.permission_id
        WHERE rp.role_id = ANY(${roleIds}::uuid[])
          AND p.slug    = ${permissionSlug}
        LIMIT 1
      `;
      return rows.length > 0;
    } catch (err) {
      const error = err as Error;
      console.error('PermissionRepository.hasPermissionForRoles error:', error.message);
      return false;
    }
  }

  // ─── findPermissionsForRoles ─────────────────────────────────────────────────

  async findPermissionsForRoles(roleIds: string[]): Promise<string[]> {
    if (!roleIds || roleIds.length === 0) return [];
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT DISTINCT p.slug
        FROM "role_permissions" rp
        INNER JOIN "permissions" p ON p.id = rp.permission_id
        WHERE rp.role_id = ANY(${roleIds}::uuid[])
        ORDER BY p.slug ASC
      `;
      return rows.map((r) => r.slug as string);
    } catch (err) {
      const error = err as Error;
      console.error('PermissionRepository.findPermissionsForRoles error:', error.message);
      return [];
    }
  }

  // ─── assignPermissionToRole ──────────────────────────────────────────────────

  async assignPermissionToRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      // جلوگیری از duplicate
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "role_permissions"
        WHERE role_id = ${roleId} AND permission_id = ${permissionId}
        LIMIT 1
      `;
      if (existing && existing.length > 0) return;

      await prisma.$executeRaw`
        INSERT INTO "role_permissions" (id, role_id, permission_id)
        VALUES (${crypto.randomUUID()}, ${roleId}, ${permissionId})
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`PermissionRepository.assignPermissionToRole failed: ${error.message}`);
    }
  }

  // ─── removePermissionFromRole ────────────────────────────────────────────────

  async removePermissionFromRole(
    roleId: string,
    permissionId: string,
  ): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "role_permissions"
        WHERE role_id = ${roleId} AND permission_id = ${permissionId}
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`PermissionRepository.removePermissionFromRole failed: ${error.message}`);
    }
  }

  // ─── mapper ──────────────────────────────────────────────────────────────────

  private _map(row: any): PermissionEntity {
    return PermissionEntity.reconstitute({
      id:          row.id,
      name:        row.name,
      slug:        row.slug,
      description: row.description ?? null,
      domain:      row.domain,
      createdAt:   row.created_at,
    });
  }
}
