export type ProjectStatus = 'active' | 'completed' | 'archived' | 'cancelled';
export type ProjectMemberRole = 'owner' | 'admin' | 'engineer' | 'viewer';

// ─── ProjectMember Value Object ───────────────────────────────────────────────

export class ProjectMember {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly userId: string,
    public readonly role: ProjectMemberRole,
    public readonly joinedAt: Date,
  ) {}

  static create(
    projectId: string,
    userId: string,
    role: ProjectMemberRole = 'viewer',
  ): ProjectMember {
    return new ProjectMember(
      crypto.randomUUID(),
      projectId,
      userId,
      role,
      new Date(),
    );
  }
}

// ─── ProjectNote Value Object ─────────────────────────────────────────────────

export class ProjectNote {
  constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly content: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
  ) {}

  static create(
    projectId: string,
    content: string,
    createdBy: string,
  ): ProjectNote {
    if (!content || content.trim().length === 0) {
      throw new Error('Note content cannot be empty');
    }
    return new ProjectNote(
      crypto.randomUUID(),
      projectId,
      content.trim(),
      createdBy,
      new Date(),
    );
  }
}

// ─── ProjectEntity (Aggregate Root) ──────────────────────────────────────────

export class ProjectEntity {
  private constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    private _name: string,
    private _description: string | null,
    private _status: ProjectStatus,
    private _startDate: Date | null,
    private _endDate: Date | null,
    private _createdBy: string,
    private _updatedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
    public deletedAt: Date | null,
  ) {}

  // ─── Factory ────────────────────────────────────────────────────────────────

  static create(
    workspaceId: string,
    name: string,
    createdBy: string,
    description?: string,
    startDate?: Date,
    endDate?: Date,
  ): ProjectEntity {
    if (!name || name.trim().length < 2) {
      throw new Error('Project name must be at least 2 characters');
    }
    if (name.trim().length > 150) {
      throw new Error('Project name must not exceed 150 characters');
    }
    if (endDate && startDate && endDate < startDate) {
      throw new Error('End date cannot be before start date');
    }

    const now = new Date();
    return new ProjectEntity(
      crypto.randomUUID(),
      workspaceId,
      name.trim(),
      description?.trim() || null,
      'active',
      startDate || null,
      endDate   || null,
      createdBy,
      null,
      now,
      now,
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    name: string;
    description: string | null;
    status: string;
    startDate: Date | null;
    endDate: Date | null;
    createdBy: string;
    updatedBy: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): ProjectEntity {
    return new ProjectEntity(
      data.id,
      data.workspaceId,
      data.name,
      data.description,
      data.status as ProjectStatus,
      data.startDate,
      data.endDate,
      data.createdBy,
      data.updatedBy,
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
    );
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get name(): string       { return this._name; }
  get description(): string | null { return this._description; }
  get status(): ProjectStatus      { return this._status; }
  get startDate(): Date | null     { return this._startDate; }
  get endDate(): Date | null       { return this._endDate; }
  get createdBy(): string          { return this._createdBy; }
  get updatedBy(): string | null   { return this._updatedBy; }

  // ─── Business Methods ────────────────────────────────────────────────────────

  update(
    data: {
      name?: string;
      description?: string | null;
      status?: ProjectStatus;
      startDate?: Date | null;
      endDate?: Date | null;
    },
    updatedBy: string,
  ): void {
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        throw new Error('Project name must be at least 2 characters');
      }
      this._name = data.name.trim();
    }
    if (data.description !== undefined) {
      this._description = data.description?.trim() || null;
    }
    if (data.status !== undefined) {
      this._status = data.status;
    }
    if (data.startDate !== undefined) {
      this._startDate = data.startDate;
    }
    if (data.endDate !== undefined) {
      if (data.endDate && this._startDate && data.endDate < this._startDate) {
        throw new Error('End date cannot be before start date');
      }
      this._endDate = data.endDate;
    }
    this._updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  complete(updatedBy: string): void {
    if (this._status === 'cancelled') {
      throw new Error('Cannot complete a cancelled project');
    }
    this._status = 'completed';
    this._updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  archive(updatedBy: string): void {
    this._status = 'archived';
    this._updatedBy = updatedBy;
    this.updatedAt = new Date();
  }

  softDelete(deletedBy: string): void {
    this.deletedAt = new Date();
    this._updatedBy = deletedBy;
    this.updatedAt = new Date();
  }

  restore(restoredBy: string): void {
    this.deletedAt = null;
    this._updatedBy = restoredBy;
    this.updatedAt = new Date();
  }

  isDeleted(): boolean { return this.deletedAt !== null; }
  isActive(): boolean  { return this._status === 'active' && !this.isDeleted(); }
}
