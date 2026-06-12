import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IWorkspaceMemberRepository } from '../../domain/interfaces/workspace-member.repository.interface.js';
import { WorkspaceMemberEntity } from '../../domain/entities/workspace-member.entity.js';
import { WorkspaceInvitationEntity } from '../../domain/entities/workspace-invitation.entity.js';

@Injectable()
export class WorkspaceMemberRepository implements IWorkspaceMemberRepository {

  // ══════════════════════════════════════════════════════════════════════════
  // MEMBERS
  // ══════════════════════════════════════════════════════════════════════════

  async saveMember(member: WorkspaceMemberEntity): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "workspace_members"
        WHERE workspace_id = ${member.workspaceId} AND user_id = ${member.userId}
        LIMIT 1
      `;

      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "workspace_members"
          SET role = ${member.role}
          WHERE workspace_id = ${member.workspaceId} AND user_id = ${member.userId}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "workspace_members" (id, workspace_id, user_id, role, joined_at)
          VALUES (${member.id}, ${member.workspaceId}, ${member.userId}, ${member.role}, ${member.joinedAt})
        `;
      }
    } catch (err) {
      const error = err as Error;
      throw new Error(`WorkspaceMemberRepository.saveMember failed: ${error.message}`);
    }
  }

  async findMember(
    workspaceId: string,
    userId: string,
  ): Promise<WorkspaceMemberEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "workspace_members"
        WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapMember(rows[0]);
    } catch {
      return null;
    }
  }

  async findMembers(workspaceId: string): Promise<WorkspaceMemberEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "workspace_members"
        WHERE workspace_id = ${workspaceId}
        ORDER BY joined_at ASC
      `;
      return rows.map((r) => this._mapMember(r));
    } catch (err) {
      const error = err as Error;
      console.error('WorkspaceMemberRepository.findMembers error:', error.message);
      return [];
    }
  }

  async removeMember(workspaceId: string, userId: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        DELETE FROM "workspace_members"
        WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`WorkspaceMemberRepository.removeMember failed: ${error.message}`);
    }
  }

  async isMember(workspaceId: string, userId: string): Promise<boolean> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT 1 FROM "workspace_members"
        WHERE workspace_id = ${workspaceId} AND user_id = ${userId}
        LIMIT 1
      `;
      return rows.length > 0;
    } catch {
      return false;
    }
  }

  async countMembers(workspaceId: string): Promise<number> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) as count FROM "workspace_members"
        WHERE workspace_id = ${workspaceId}
      `;
      return Number(result[0]?.count ?? 0);
    } catch {
      return 0;
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // INVITATIONS
  // ══════════════════════════════════════════════════════════════════════════

  async saveInvitation(invitation: WorkspaceInvitationEntity): Promise<void> {
    try {
      const existing = await prisma.$queryRaw<any[]>`
        SELECT id FROM "workspace_invitations" WHERE id = ${invitation.id} LIMIT 1
      `;

      if (existing && existing.length > 0) {
        await prisma.$executeRaw`
          UPDATE "workspace_invitations"
          SET status = ${invitation.status}
          WHERE id = ${invitation.id}
        `;
      } else {
        await prisma.$executeRaw`
          INSERT INTO "workspace_invitations"
            (id, workspace_id, email, role, token, invited_by, status, expires_at, created_at)
          VALUES
            (${invitation.id}, ${invitation.workspaceId}, ${invitation.email},
             ${invitation.role}, ${invitation.token}, ${invitation.invitedBy},
             ${invitation.status}, ${invitation.expiresAt}, ${invitation.createdAt})
        `;
      }
    } catch (err) {
      const error = err as Error;
      throw new Error(`WorkspaceMemberRepository.saveInvitation failed: ${error.message}`);
    }
  }

  async findInvitationByToken(
    token: string,
  ): Promise<WorkspaceInvitationEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "workspace_invitations"
        WHERE token = ${token} LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapInvitation(rows[0]);
    } catch {
      return null;
    }
  }

  async findInvitationByEmail(
    workspaceId: string,
    email: string,
  ): Promise<WorkspaceInvitationEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "workspace_invitations"
        WHERE workspace_id = ${workspaceId}
          AND email = ${email.toLowerCase()}
          AND status = 'pending'
        ORDER BY created_at DESC
        LIMIT 1
      `;
      if (!rows || rows.length === 0) return null;
      return this._mapInvitation(rows[0]);
    } catch {
      return null;
    }
  }

  async findInvitations(
    workspaceId: string,
  ): Promise<WorkspaceInvitationEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "workspace_invitations"
        WHERE workspace_id = ${workspaceId}
        ORDER BY created_at DESC
      `;
      return rows.map((r) => this._mapInvitation(r));
    } catch (err) {
      const error = err as Error;
      console.error('WorkspaceMemberRepository.findInvitations error:', error.message);
      return [];
    }
  }

  async updateInvitationStatus(id: string, status: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "workspace_invitations" SET status = ${status} WHERE id = ${id}
      `;
    } catch (err) {
      const error = err as Error;
      throw new Error(`WorkspaceMemberRepository.updateInvitationStatus failed: ${error.message}`);
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MAPPERS
  // ══════════════════════════════════════════════════════════════════════════

  private _mapMember(row: any): WorkspaceMemberEntity {
    return WorkspaceMemberEntity.reconstitute({
      id:          row.id,
      workspaceId: row.workspace_id,
      userId:      row.user_id,
      role:        row.role,
      joinedAt:    row.joined_at,
    });
  }

  private _mapInvitation(row: any): WorkspaceInvitationEntity {
    return WorkspaceInvitationEntity.reconstitute({
      id:          row.id,
      workspaceId: row.workspace_id,
      email:       row.email,
      role:        row.role,
      token:       row.token,
      invitedBy:   row.invited_by,
      status:      row.status,
      expiresAt:   row.expires_at,
      createdAt:   row.created_at,
    });
  }
}
