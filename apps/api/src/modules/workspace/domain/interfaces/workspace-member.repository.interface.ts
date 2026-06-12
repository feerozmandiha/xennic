import type { WorkspaceMemberEntity, WorkspaceMemberRole } from '../entities/workspace-member.entity.js';
import type { WorkspaceInvitationEntity } from '../entities/workspace-invitation.entity.js';

export interface IWorkspaceMemberRepository {
  // ── Members ─────────────────────────────────────────────────────────────────
  saveMember(member: WorkspaceMemberEntity): Promise<void>;
  findMember(workspaceId: string, userId: string): Promise<WorkspaceMemberEntity | null>;
  findMembers(workspaceId: string): Promise<WorkspaceMemberEntity[]>;
  removeMember(workspaceId: string, userId: string): Promise<void>;
  isMember(workspaceId: string, userId: string): Promise<boolean>;
  countMembers(workspaceId: string): Promise<number>;

  // ── Invitations ──────────────────────────────────────────────────────────────
  saveInvitation(invitation: WorkspaceInvitationEntity): Promise<void>;
  findInvitationByToken(token: string): Promise<WorkspaceInvitationEntity | null>;
  findInvitationByEmail(workspaceId: string, email: string): Promise<WorkspaceInvitationEntity | null>;
  findInvitations(workspaceId: string): Promise<WorkspaceInvitationEntity[]>;
  updateInvitationStatus(id: string, status: string): Promise<void>;
}
