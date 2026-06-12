import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Inject,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WorkspaceService } from '../../../workspace/application/services/workspace.service.js';
import { prisma } from '@xennic/database';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  private readonly logger = new Logger(WorkspaceGuard.name);

  constructor(
    @Inject(WorkspaceService)
    private readonly workspaceService: WorkspaceService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user    = request.user;

    if (!user?.userId) {
      throw new ForbiddenException('User not authenticated');
    }

    // ── workspace_id از چند منبع (case-insensitive headers) ────────────────
    const rawHeaders = request.headers as Record<string, string | string[] | undefined>;
    let workspaceId: string | undefined =
      (rawHeaders['x-workspace-id'] as string)     ||
      (rawHeaders['X-Workspace-Id'] as string)     ||
      request.params?.workspaceId                  ||
      request.params?.id                           ||
      request.body?.workspaceId;

    // ── اگر workspaceId نیامد، اولین workspace کاربر را پیدا کن ──────────
    if (!workspaceId) {
      workspaceId = await this._getFirstWorkspace(user.userId) ?? undefined;
      if (workspaceId) {
        this.logger.debug(
          `WorkspaceGuard: auto-detected workspace ${workspaceId} for user ${user.userId}`,
        );
      }
    }

    if (!workspaceId) {
      this.logger.warn(
        `WorkspaceGuard: no workspace found for user ${user.userId}`,
      );
      throw new ForbiddenException(
        'Workspace ID is required. Send x-workspace-id header or create a workspace first.',
      );
    }

    // ── بررسی عضویت ──────────────────────────────────────────────────────
    const isMember = await this.workspaceService.isUserMember(user.userId, workspaceId);
    if (!isMember) {
      this.logger.warn(
        `WorkspaceGuard: user ${user.userId} is NOT member of workspace ${workspaceId}`,
      );
      throw new ForbiddenException('User does not have access to this workspace');
    }

    this.logger.debug(
      `WorkspaceGuard: user ${user.userId} ✅ workspace ${workspaceId}`,
    );
    request.workspaceId = workspaceId;
    return true;
  }

  // ── اولین workspace کاربر ─────────────────────────────────────────────────
  private async _getFirstWorkspace(userId: string): Promise<string | null> {
    try {
      // اول workspace هایی که owner هستیم
      const owned = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "workspaces"
        WHERE created_by = ${userId} AND deleted_at IS NULL
        ORDER BY created_at ASC LIMIT 1
      `;
      if (owned.length > 0) return owned[0]!.id;

      // بعد workspace هایی که عضو هستیم
      const member = await prisma.$queryRaw<{ workspace_id: string }[]>`
        SELECT workspace_id FROM "workspace_members"
        WHERE user_id = ${userId}
        ORDER BY joined_at ASC LIMIT 1
      `;
      if (member.length > 0) return member[0]!.workspace_id;

      return null;
    } catch {
      return null;
    }
  }
}
