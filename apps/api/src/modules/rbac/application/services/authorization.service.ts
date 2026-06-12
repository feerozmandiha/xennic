import { Injectable, Inject, Logger } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IRoleRepository } from '../../domain/interfaces/role.repository.interface.js';
import type { IPermissionRepository } from '../../domain/interfaces/permission.repository.interface.js';

@Injectable()
export class AuthorizationService {
  private readonly logger = new Logger(AuthorizationService.name);

  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  async hasPermission(
    userId: string,
    workspaceId: string,
    permissionSlug: string,
  ): Promise<boolean> {
    // ── OWNER از workspace_members یا workspaces.created_by ───────────────
    if (workspaceId) {
      const isOwner = await this._isWorkspaceOwner(userId, workspaceId);
      if (isOwner) {
        this.logger.debug(`hasPermission: user ${userId} is OWNER → granted`);
        return true;
      }
    }

    // ── بررسی roles از user_roles ─────────────────────────────────────────
    const userRoles = await this.roleRepository.findUserRolesInWorkspace(
      userId,
      workspaceId,
    );

    if (userRoles.length === 0) {
      // ── Fallback: بررسی workspace_members role ────────────────────────────
      // اگر user_roles خالی است اما در workspace_members نقش دارد
      const memberRole = await this._getMemberRole(userId, workspaceId);
      if (memberRole) {
        this.logger.debug(
          `hasPermission: user ${userId} has member role ${memberRole} — granting via fallback`,
        );
        return true; // ADMIN/MEMBER/ENGINEER در workspace = دسترسی به محاسبات پایه
      }
      return false;
    }

    if (userRoles.some((r) => r.slug === 'SUPER_ADMIN')) {
      return true;
    }

    return this.permissionRepository.hasPermissionForRoles(
      userRoles.map((r) => r.id),
      permissionSlug,
    );
  }

  async hasPermissions(
    userId: string,
    workspaceId: string,
    permissionSlugs: string[],
  ): Promise<boolean> {
    // ── OWNER همیشه همه permission ها را دارد ─────────────────────────────
    if (workspaceId) {
      const isOwner = await this._isWorkspaceOwner(userId, workspaceId);
      if (isOwner) return true;
    }

    // ── بررسی هر slug ─────────────────────────────────────────────────────
    const results = await Promise.all(
      permissionSlugs.map((slug) =>
        this.hasPermission(userId, workspaceId, slug),
      ),
    );
    return results.every((r) => r === true);
  }

  async getUserPermissions(
    userId: string,
    workspaceId: string,
  ): Promise<string[]> {
    // OWNER همه permission ها را دارد
    if (workspaceId) {
      const isOwner = await this._isWorkspaceOwner(userId, workspaceId);
      if (isOwner) return ['*'];
    }

    const userRoles = await this.roleRepository.findUserRolesInWorkspace(
      userId,
      workspaceId,
    );

    if (userRoles.some((r) => r.slug === 'SUPER_ADMIN')) {
      return ['*'];
    }

    if (userRoles.length === 0) {
      // Fallback
      const memberRole = await this._getMemberRole(userId, workspaceId);
      if (memberRole) return ['*']; // عضو workspace = دسترسی کامل در این مرحله
      return [];
    }

    return this.permissionRepository.findPermissionsForRoles(
      userRoles.map((r) => r.id),
    );
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  /**
   * بررسی OWNER بودن از workspace_members و workspaces.created_by
   */
  private async _isWorkspaceOwner(
    userId: string,
    workspaceId: string,
  ): Promise<boolean> {
    if (!userId || !workspaceId) return false;
    try {
      // بررسی از workspace_members با role OWNER
      const memberRows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "workspace_members"
        WHERE workspace_id = ${workspaceId}
          AND user_id      = ${userId}
          AND role         = 'OWNER'
        LIMIT 1
      `;
      if (memberRows.length > 0) return true;

      // بررسی از workspaces.created_by (fallback)
      const wsRows = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "workspaces"
        WHERE id         = ${workspaceId}
          AND created_by = ${userId}
          AND deleted_at IS NULL
        LIMIT 1
      `;
      return wsRows.length > 0;
    } catch (err) {
      const error = err as Error;
      this.logger.warn(`_isWorkspaceOwner error: ${error.message}`);
      return false;
    }
  }

  /**
   * دریافت نقش کاربر از workspace_members (برای fallback)
   */
  private async _getMemberRole(
    userId: string,
    workspaceId: string,
  ): Promise<string | null> {
    if (!userId || !workspaceId) return null;
    try {
      const rows = await prisma.$queryRaw<{ role: string }[]>`
        SELECT role FROM "workspace_members"
        WHERE workspace_id = ${workspaceId}
          AND user_id      = ${userId}
        LIMIT 1
      `;
      return rows.length > 0 ? rows[0]!.role : null;
    } catch {
      return null;
    }
  }
}
