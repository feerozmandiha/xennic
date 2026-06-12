import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IWorkspaceRepository } from '../../domain/interfaces/workspace.repository.interface.js';
import type { IWorkspaceMemberRepository } from '../../domain/interfaces/workspace-member.repository.interface.js';
import { WorkspaceEntity } from '../../domain/entities/workspace.entity.js';
import { WorkspaceMemberEntity, type WorkspaceMemberRole } from '../../domain/entities/workspace-member.entity.js';
import { WorkspaceInvitationEntity } from '../../domain/entities/workspace-invitation.entity.js';
import type { CreateWorkspaceDto } from '../../presentation/dtos/create-workspace.dto.js';

@Injectable()
export class WorkspaceService {
  private readonly logger = new Logger(WorkspaceService.name);

  constructor(
    @Inject('IWorkspaceRepository')
    private readonly workspaceRepository: IWorkspaceRepository,
    @Inject('IWorkspaceMemberRepository')
    private readonly memberRepository: IWorkspaceMemberRepository,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  // WORKSPACE CRUD
  // ══════════════════════════════════════════════════════════════════════════

  async create(
    createWorkspaceDto: CreateWorkspaceDto,
    userId: string,
  ): Promise<WorkspaceEntity> {
    const existingWorkspaces = await this.workspaceRepository.findAll(0, 100);
    const duplicate = existingWorkspaces.find(
      (w) =>
        w.name.toLowerCase() === createWorkspaceDto.name.toLowerCase() &&
        !w.isDeleted(),
    );
    if (duplicate) {
      throw new ConflictException(
        `Workspace with name "${createWorkspaceDto.name}" already exists`,
      );
    }

    const workspace = WorkspaceEntity.create(createWorkspaceDto.name, userId);
    await this.workspaceRepository.save(workspace);

    // سازنده به‌عنوان OWNER ثبت می‌شود
    const ownerMember = WorkspaceMemberEntity.create(workspace.id, userId, 'OWNER');
    await this.memberRepository.saveMember(ownerMember);

    // ── ثبت در user_roles برای PermissionsGuard ────────────────────────────
    // بدون این، PermissionsGuard نقش کاربر را پیدا نمی‌کند
    try {
      const ownerRole = await prisma.$queryRaw<{ id: string }[]>`
        SELECT id FROM "roles" WHERE slug = 'OWNER' LIMIT 1
      `;
      if (ownerRole.length > 0) {
        const roleId = ownerRole[0]!.id;
        const existing = await prisma.$queryRaw<{ id: string }[]>`
          SELECT id FROM "user_roles"
          WHERE user_id = ${userId} AND role_id = ${roleId} AND workspace_id = ${workspace.id}
          LIMIT 1
        `;
        if (!existing.length) {
          await prisma.$executeRaw`
            INSERT INTO "user_roles" (id, user_id, role_id, workspace_id)
            VALUES (${crypto.randomUUID()}, ${userId}, ${roleId}, ${workspace.id})
          `;
        }
        this.logger.debug(`OWNER role assigned in user_roles for user ${userId} in workspace ${workspace.id}`);
      }
    } catch (err) {
      const error = err as Error;
      this.logger.warn(`Could not assign user_roles for workspace owner: ${error.message}`);
      // غیر بحرانی — _isWorkspaceOwner fallback دارد
    }

    return workspace;
  }

  // ── findAll بدون فیلتر (فقط برای admin) ─────────────────────────────────
  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{
    data: WorkspaceEntity[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.workspaceRepository.findAll(offset, limit),
      this.workspaceRepository.count(),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── findByUser — workspace های یک کاربر خاص ──────────────────────────────
  async findByUser(
    userId: string,
    page = 1,
    limit = 20,
  ): Promise<{
    data: WorkspaceEntity[];
    meta: { page: number; limit: number; total: number; totalPages: number };
  }> {
    try {
      const offset = (page - 1) * limit;

      // workspace هایی که کاربر owner است یا عضو است
      const rows = await prisma.$queryRaw<any[]>`
        SELECT DISTINCT w.*
        FROM "workspaces" w
        LEFT JOIN "workspace_members" wm ON wm.workspace_id = w.id AND wm.user_id = ${userId}
        WHERE w.deleted_at IS NULL
          AND (w.created_by = ${userId} OR wm.user_id = ${userId})
        ORDER BY w.created_at ASC
        LIMIT ${limit} OFFSET ${offset}
      `;

      const countResult = await prisma.$queryRaw<{ count: bigint }[]>`
        SELECT COUNT(DISTINCT w.id) as count
        FROM "workspaces" w
        LEFT JOIN "workspace_members" wm ON wm.workspace_id = w.id AND wm.user_id = ${userId}
        WHERE w.deleted_at IS NULL
          AND (w.created_by = ${userId} OR wm.user_id = ${userId})
      `;

      const total = Number(countResult[0]?.count ?? 0);

      const data = rows.map((r) =>
        WorkspaceEntity.reconstitute({
          id:        r.id,
          code:      r.code,
          name:      r.name,
          createdBy: r.created_by,
          updatedBy: r.updated_by ?? null,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          deletedAt: r.deleted_at ?? null,
        }),
      );

      return {
        data,
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      };
    } catch (err) {
      const error = err as Error;
      throw new Error(`WorkspaceService.findByUser failed: ${error.message}`);
    }
  }

  async findOne(id: string): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace || workspace.isDeleted()) {
      throw new NotFoundException(`Workspace with ID "${id}" not found`);
    }
    return workspace;
  }

  async update(
    id: string,
    name: string,
    userId: string,
  ): Promise<WorkspaceEntity> {
    const workspace = await this.findOne(id);
    workspace.updateName(name, userId);
    await this.workspaceRepository.save(workspace);
    return workspace;
  }

  async remove(id: string, userId: string): Promise<void> {
    const workspace = await this.findOne(id);
    workspace.softDelete(userId);
    await this.workspaceRepository.save(workspace);
  }

  async restore(id: string, userId: string): Promise<WorkspaceEntity> {
    const workspace = await this.workspaceRepository.findById(id);
    if (!workspace) {
      throw new NotFoundException(`Workspace with ID "${id}" not found`);
    }
    workspace.restore(userId);
    await this.workspaceRepository.save(workspace);
    return workspace;
  }

  async hardDelete(id: string): Promise<void> {
    const exists = await this.workspaceRepository.exists(id);
    if (!exists) {
      throw new NotFoundException(`Workspace with ID "${id}" not found`);
    }
    await this.workspaceRepository.delete(id);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MEMBERSHIP
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * بررسی می‌کند کاربر عضو workspace است یا نه.
   * توسط WorkspaceGuard در هر request استفاده می‌شود.
   */
  async isUserMember(userId: string, workspaceId: string): Promise<boolean> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    if (!workspace || workspace.isDeleted()) return false;

    // owner workspace همیشه دسترسی دارد (حتی اگر در جدول نباشد)
    if (workspace.createdBy === userId) return true;

    return this.memberRepository.isMember(workspaceId, userId);
  }

  async getMembers(workspaceId: string): Promise<WorkspaceMemberEntity[]> {
    await this.findOne(workspaceId);
    return this.memberRepository.findMembers(workspaceId);
  }

  async getMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMemberEntity> {
    const member = await this.memberRepository.findMember(workspaceId, userId);
    if (!member) {
      throw new NotFoundException(
        `User "${userId}" is not a member of this workspace`,
      );
    }
    return member;
  }

  async addMember(
    workspaceId: string,
    userId: string,
    role: WorkspaceMemberRole,
    addedBy: string,
  ): Promise<WorkspaceMemberEntity> {
    await this.findOne(workspaceId);

    // بررسی دسترسی — فقط OWNER یا ADMIN می‌توانند عضو اضافه کنند
    await this._assertCanManage(workspaceId, addedBy);

    const existing = await this.memberRepository.findMember(workspaceId, userId);
    if (existing) {
      throw new ConflictException('User is already a member of this workspace');
    }

    // نمی‌توان مستقیم OWNER اضافه کرد
    if (role === 'OWNER') {
      throw new BadRequestException(
        'Cannot add a member with OWNER role directly. Use transfer ownership instead.',
      );
    }

    const member = WorkspaceMemberEntity.create(workspaceId, userId, role);
    await this.memberRepository.saveMember(member);
    return member;
  }

  async updateMemberRole(
    workspaceId: string,
    userId: string,
    newRole: WorkspaceMemberRole,
    updatedBy: string,
  ): Promise<WorkspaceMemberEntity> {
    await this._assertCanManage(workspaceId, updatedBy);

    const member = await this.getMember(workspaceId, userId);

    if (newRole === 'OWNER') {
      throw new BadRequestException('Use transfer ownership to change OWNER.');
    }

    member.changeRole(newRole);
    await this.memberRepository.saveMember(member);
    return member;
  }

  async removeMember(
    workspaceId: string,
    userId: string,
    removedBy: string,
  ): Promise<void> {
    await this._assertCanManage(workspaceId, removedBy);

    const member = await this.getMember(workspaceId, userId);
    if (member.isOwner()) {
      throw new ForbiddenException('Cannot remove the workspace OWNER');
    }

    await this.memberRepository.removeMember(workspaceId, userId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INVITATIONS
  // ══════════════════════════════════════════════════════════════════════════

  async inviteMember(
    workspaceId: string,
    email: string,
    role: WorkspaceMemberRole,
    invitedBy: string,
  ): Promise<WorkspaceInvitationEntity> {
    await this.findOne(workspaceId);
    await this._assertCanManage(workspaceId, invitedBy);

    if (role === 'OWNER') {
      throw new BadRequestException('Cannot invite with OWNER role.');
    }

    // بررسی دعوتنامه pending موجود
    const existing = await this.memberRepository.findInvitationByEmail(
      workspaceId,
      email,
    );
    if (existing && existing.isPending()) {
      throw new ConflictException(
        `A pending invitation already exists for "${email}"`,
      );
    }

    const invitation = WorkspaceInvitationEntity.create(
      workspaceId,
      email,
      role,
      invitedBy,
    );
    await this.memberRepository.saveInvitation(invitation);
    return invitation;
  }

  async acceptInvitation(
    token: string,
    userId: string,
  ): Promise<WorkspaceMemberEntity> {
    const invitation = await this.memberRepository.findInvitationByToken(token);
    if (!invitation || !invitation.isPending()) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    invitation.accept();
    await this.memberRepository.updateInvitationStatus(invitation.id, 'accepted');

    const member = WorkspaceMemberEntity.create(
      invitation.workspaceId,
      userId,
      invitation.role,
    );
    await this.memberRepository.saveMember(member);
    return member;
  }

  async cancelInvitation(
    workspaceId: string,
    invitationId: string,
    cancelledBy: string,
  ): Promise<void> {
    await this._assertCanManage(workspaceId, cancelledBy);
    await this.memberRepository.updateInvitationStatus(invitationId, 'cancelled');
  }

  async getInvitations(workspaceId: string): Promise<WorkspaceInvitationEntity[]> {
    await this.findOne(workspaceId);
    return this.memberRepository.findInvitations(workspaceId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PRIVATE HELPERS
  // ══════════════════════════════════════════════════════════════════════════

  private async _assertCanManage(
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    const workspace = await this.workspaceRepository.findById(workspaceId);
    // owner همیشه می‌تواند
    if (workspace?.createdBy === userId) return;

    const member = await this.memberRepository.findMember(workspaceId, userId);
    if (!member || !member.canManage()) {
      throw new ForbiddenException(
        'Only OWNER or ADMIN can perform this action',
      );
    }
  }
}
