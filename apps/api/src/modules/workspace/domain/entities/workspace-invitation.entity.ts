import type { WorkspaceMemberRole } from './workspace-member.entity.js';

export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

export class WorkspaceInvitationEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly email: string,
    public readonly role: WorkspaceMemberRole,
    public readonly token: string,
    public readonly invitedBy: string,
    private _status: InvitationStatus,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
  ) {}

  // ─── Factory ────────────────────────────────────────────────────────────────

  static create(
    workspaceId: string,
    email: string,
    role: WorkspaceMemberRole,
    invitedBy: string,
    ttlHours = 72,
  ): WorkspaceInvitationEntity {
    const token     = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

    return new WorkspaceInvitationEntity(
      crypto.randomUUID(),
      workspaceId,
      email.toLowerCase().trim(),
      role,
      token,
      invitedBy,
      'pending',
      expiresAt,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    email: string;
    role: string;
    token: string;
    invitedBy: string;
    status: string;
    expiresAt: Date;
    createdAt: Date;
  }): WorkspaceInvitationEntity {
    return new WorkspaceInvitationEntity(
      data.id,
      data.workspaceId,
      data.email,
      data.role as WorkspaceMemberRole,
      data.token,
      data.invitedBy,
      data.status as InvitationStatus,
      data.expiresAt,
      data.createdAt,
    );
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get status(): InvitationStatus { return this._status; }

  // ─── Business Methods ────────────────────────────────────────────────────────

  accept(): void {
    if (!this.isPending()) throw new Error('Invitation is no longer pending');
    this._status = 'accepted';
  }

  cancel(): void {
    if (!this.isPending()) throw new Error('Only pending invitations can be cancelled');
    this._status = 'cancelled';
  }

  isPending(): boolean  { return this._status === 'pending' && !this.isExpired(); }
  isExpired(): boolean  { return this.expiresAt < new Date(); }
  isAccepted(): boolean { return this._status === 'accepted'; }
}
