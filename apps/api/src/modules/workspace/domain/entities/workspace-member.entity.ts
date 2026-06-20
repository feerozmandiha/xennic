export type WorkspaceMemberRole =
  | 'OWNER'
  | 'ADMIN'
  | 'EDITOR'
  | 'KNOWLEDGE_WRITER'
  | 'REVIEWER'
  | 'ENGINEER'
  | 'CONSULTANT'
  | 'MEMBER'
  | 'VIEWER';

export class WorkspaceMemberEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    public readonly userId: string,
    private _role: WorkspaceMemberRole,
    public readonly joinedAt: Date,
  ) {}

  // ─── Factory ────────────────────────────────────────────────────────────────

  static create(
    workspaceId: string,
    userId: string,
    role: WorkspaceMemberRole = 'MEMBER',
  ): WorkspaceMemberEntity {
    return new WorkspaceMemberEntity(
      crypto.randomUUID(),
      workspaceId,
      userId,
      role,
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    userId: string;
    role: string;
    joinedAt: Date;
  }): WorkspaceMemberEntity {
    return new WorkspaceMemberEntity(
      data.id,
      data.workspaceId,
      data.userId,
      data.role as WorkspaceMemberRole,
      data.joinedAt,
    );
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get role(): WorkspaceMemberRole { return this._role; }

  // ─── Business Methods ────────────────────────────────────────────────────────

  changeRole(newRole: WorkspaceMemberRole): void {
    if (this._role === 'OWNER') {
      throw new Error('Cannot change role of workspace OWNER');
    }
    this._role = newRole;
  }

  isOwner(): boolean    { return this._role === 'OWNER'; }
  isAdmin(): boolean    { return this._role === 'ADMIN' || this._role === 'OWNER'; }
  canManage(): boolean  { return this._role === 'OWNER' || this._role === 'ADMIN'; }
}
