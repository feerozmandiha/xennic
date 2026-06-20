export type KnowledgeStatus = 'draft' | 'review' | 'published' | 'archived';
export type KnowledgeVisibility = 'public' | 'private' | 'workspace';
export type KnowledgeDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export const VALID_STATUS_TRANSITIONS: Record<KnowledgeStatus, KnowledgeStatus[]> = {
  draft: ['review'],
  review: ['draft', 'published'],
  published: ['archived'],
  archived: ['draft'],
};

export class KnowledgeEntity {
  constructor(
    public readonly id: string,
    public readonly workspaceId: string,
    private _slug: string,
    private _status: KnowledgeStatus,
    private _visibility: KnowledgeVisibility,
    private _language: string,
    private _version: number,
    private _isActive: boolean,
    private _content: Record<string, unknown>,
    private _searchText: string | null,
    private _readingTime: number | null,
    private _difficulty: KnowledgeDifficulty | null,
    private _authorId: string | null,
    private _reviewerId: string | null,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _publishedAt: Date | null,
    private _reviewedAt: Date | null,
    private _archivedAt: Date | null,
  ) {}

  static create(data: {
    workspaceId: string;
    slug?: string;
    content?: Record<string, unknown>;
    language?: string;
    visibility?: KnowledgeVisibility;
    difficulty?: KnowledgeDifficulty;
    authorId?: string;
  }): KnowledgeEntity {
    const now = new Date();
    const baseSlug = data.slug ?? crypto.randomUUID();
    const content = data.content ?? {};
    return new KnowledgeEntity(
      crypto.randomUUID(),
      data.workspaceId,
      baseSlug,
      'draft',
      data.visibility ?? 'public',
      data.language ?? 'fa',
      1,
      true,
      content,
      null,
      null,
      data.difficulty ?? null,
      data.authorId ?? null,
      null,
      now,
      now,
      null,
      null,
      null,
    );
  }

  static reconstitute(data: {
    id: string;
    workspaceId: string;
    slug: string;
    status: string;
    visibility: string;
    language: string;
    version: number;
    isActive: boolean;
    content: Record<string, unknown>;
    searchText: string | null;
    readingTime: number | null;
    difficulty: string | null;
    authorId: string | null;
    reviewerId: string | null;
    createdAt: Date;
    updatedAt: Date;
    publishedAt: Date | null;
    reviewedAt: Date | null;
    archivedAt: Date | null;
  }): KnowledgeEntity {
    return new KnowledgeEntity(
      data.id,
      data.workspaceId,
      data.slug,
      data.status as KnowledgeStatus,
      data.visibility as KnowledgeVisibility,
      data.language,
      data.version,
      data.isActive,
      data.content,
      data.searchText,
      data.readingTime,
      data.difficulty as KnowledgeDifficulty | null,
      data.authorId,
      data.reviewerId,
      data.createdAt,
      data.updatedAt,
      data.publishedAt,
      data.reviewedAt,
      data.archivedAt,
    );
  }

  // ─── Getters ─────────────────────────────────────────────────────────────────

  get slug(): string { return this._slug; }
  get status(): KnowledgeStatus { return this._status; }
  get visibility(): KnowledgeVisibility { return this._visibility; }
  get language(): string { return this._language; }
  get version(): number { return this._version; }
  get isActive(): boolean { return this._isActive; }
  get content(): Record<string, unknown> { return this._content; }
  get searchText(): string | null { return this._searchText; }
  get readingTime(): number | null { return this._readingTime; }
  get difficulty(): KnowledgeDifficulty | null { return this._difficulty; }
  get authorId(): string | null { return this._authorId; }
  get reviewerId(): string | null { return this._reviewerId; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get publishedAt(): Date | null { return this._publishedAt; }
  get reviewedAt(): Date | null { return this._reviewedAt; }
  get archivedAt(): Date | null { return this._archivedAt; }

  isDeleted(): boolean { return !this._isActive; }

  setSearchText(text: string | null): void {
    this._searchText = text;
  }

  // ─── Business Methods ────────────────────────────────────────────────────────

  update(data: {
    slug?: string;
    content?: Record<string, unknown>;
    language?: string;
    visibility?: KnowledgeVisibility;
    difficulty?: KnowledgeDifficulty;
    readingTime?: number | null;
  }): void {
    if (data.slug !== undefined) this._slug = data.slug;
    if (data.content !== undefined) this._content = data.content;
    if (data.language !== undefined) this._language = data.language;
    if (data.visibility !== undefined) this._visibility = data.visibility;
    if (data.difficulty !== undefined) this._difficulty = data.difficulty;
    if (data.readingTime !== undefined) this._readingTime = data.readingTime;
    this._updatedAt = new Date();
  }

  requestReview(reviewerId: string): void {
    this._transitionTo('review');
    this._reviewerId = reviewerId;
    this._updatedAt = new Date();
  }

  publish(): void {
    this._transitionTo('published');
    this._version += 1;
    this._publishedAt = new Date();
    this._updatedAt = new Date();
  }

  rejectReview(): void {
    this._transitionTo('draft');
    this._reviewerId = null;
    this._updatedAt = new Date();
  }

  archive(): void {
    this._transitionTo('archived');
    this._archivedAt = new Date();
    this._updatedAt = new Date();
  }

  restoreFromArchive(): void {
    this._transitionTo('draft');
    this._archivedAt = null;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    this._isActive = false;
    this._updatedAt = new Date();
  }

  restore(): void {
    this._isActive = true;
    this._updatedAt = new Date();
  }

  // ─── Private ─────────────────────────────────────────────────────────────────

  private _transitionTo(target: KnowledgeStatus): void {
    const allowed = VALID_STATUS_TRANSITIONS[this._status];
    if (!allowed.includes(target)) {
      throw new Error(
        `Invalid status transition from "${this._status}" to "${target}". ` +
        `Allowed: ${allowed.join(', ')}`,
      );
    }
    this._status = target;
  }
}
