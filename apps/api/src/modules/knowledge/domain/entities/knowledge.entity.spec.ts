import { KnowledgeEntity, VALID_STATUS_TRANSITIONS } from './knowledge.entity.js';

const WS_ID = 'ws-123';
const AUTHOR_ID = 'user-456';

function createEntity(overrides?: Partial<ConstructorParameters<typeof KnowledgeEntity>>): KnowledgeEntity {
  return KnowledgeEntity.create({
    workspaceId: WS_ID,
    slug: 'test-article',
    content: { type: 'doc', content: [] },
    language: 'fa',
    visibility: 'workspace',
    difficulty: 'intermediate',
    authorId: AUTHOR_ID,
    ...overrides,
  });
}

describe('KnowledgeEntity', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });
  // ── Factory: create ───────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create entity with default values', () => {
      const entity = KnowledgeEntity.create({ workspaceId: WS_ID });

      expect(entity.workspaceId).toBe(WS_ID);
      expect(entity.status).toBe('draft');
      expect(entity.visibility).toBe('public');
      expect(entity.language).toBe('fa');
      expect(entity.version).toBe(1);
      expect(entity.isActive).toBe(true);
      expect(entity.content).toEqual({});
      expect(entity.readingTime).toBeNull();
      expect(entity.difficulty).toBeNull();
      expect(entity.authorId).toBeNull();
      expect(entity.publishedAt).toBeNull();
      expect(entity.archivedAt).toBeNull();
      expect(entity.reviewedAt).toBeNull();
      expect(entity.reviewerId).toBeNull();
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.isDeleted()).toBe(false);
    });

    it('should generate a random slug when not provided', () => {
      const entity = KnowledgeEntity.create({ workspaceId: WS_ID });
      expect(entity.slug).toBeDefined();
      expect(entity.slug.length).toBeGreaterThan(0);
    });

    it('should set all provided fields', () => {
      const entity = createEntity();
      expect(entity.slug).toBe('test-article');
      expect(entity.content).toEqual({ type: 'doc', content: [] });
      expect(entity.language).toBe('fa');
      expect(entity.visibility).toBe('workspace');
      expect(entity.difficulty).toBe('intermediate');
      expect(entity.authorId).toBe(AUTHOR_ID);
    });
  });

  // ── Factory: reconstitute ─────────────────────────────────────────────────────

  describe('reconstitute', () => {
    const now = new Date();
    const data = {
      id: 'article-1',
      workspaceId: WS_ID,
      slug: 'reconstituted-article',
      status: 'published',
      visibility: 'public',
      language: 'en',
      version: 3,
      isActive: true,
      content: { type: 'doc', content: [{ type: 'paragraph' }] },
      readingTime: 5,
      difficulty: 'advanced',
      authorId: AUTHOR_ID,
      reviewerId: 'reviewer-789',
      createdAt: now,
      updatedAt: now,
      publishedAt: now,
      reviewedAt: now,
      archivedAt: null,
    };

    it('should reconstitute entity from stored data', () => {
      const entity = KnowledgeEntity.reconstitute(data);
      expect(entity.id).toBe('article-1');
      expect(entity.slug).toBe('reconstituted-article');
      expect(entity.status).toBe('published');
      expect(entity.version).toBe(3);
      expect(entity.readingTime).toBe(5);
      expect(entity.reviewerId).toBe('reviewer-789');
      expect(entity.publishedAt).toEqual(now);
      expect(entity.reviewedAt).toEqual(now);
      expect(entity.archivedAt).toBeNull();
    });

    it('should set isDeleted correctly', () => {
      const active = KnowledgeEntity.reconstitute({ ...data, isActive: true });
      expect(active.isDeleted()).toBe(false);

      const deleted = KnowledgeEntity.reconstitute({ ...data, isActive: false });
      expect(deleted.isDeleted()).toBe(true);
    });
  });

  // ── update ────────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update provided fields and preserve others', () => {
      const entity = createEntity();
      entity.update({ slug: 'new-slug', content: { updated: true } });

      expect(entity.slug).toBe('new-slug');
      expect(entity.content).toEqual({ updated: true });
      expect(entity.language).toBe('fa');
      expect(entity.difficulty).toBe('intermediate');
    });

    it('should not update fields set to undefined', () => {
      const entity = createEntity();
      entity.update({ slug: undefined });

      expect(entity.slug).toBe('test-article');
    });

    it('should update readingTime to null when explicitly set', () => {
      const entity = createEntity();
      expect(entity.readingTime).toBeNull();

      entity.update({ readingTime: 10 });
      expect(entity.readingTime).toBe(10);

      entity.update({ readingTime: null });
      expect(entity.readingTime).toBeNull();
    });

    it('should bump updatedAt timestamp', () => {
      const entity = createEntity();
      const before = entity.updatedAt.getTime();

      entity.update({ slug: 'new-slug' });

      expect(entity.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
    });
  });

  // ── Status Transitions ────────────────────────────────────────────────────────

  describe('status transitions', () => {
    const VALID_MAP: Record<string, string[]> = {
      'draft->review': ['review'],
      'review->draft': ['reject'],
      'review->published': ['publish'],
      'published->archived': ['archive'],
      'archived->draft': ['restore'],
    };

    it.each([
      ['draft', 'review'],
      ['review', 'draft'],
      ['review', 'published'],
      ['published', 'archived'],
      ['archived', 'draft'],
    ])('should allow %s -> %s', (from, to) => {
      const entity = createEntityWithStatus(from as any);
      step(entity, VALID_MAP[`${from}->${to}`]!);
      expect(entity.status).toBe(to);
    });

    const INVALID_SPEC: [string, string, string][] = [
      ['draft', 'published', 'publish'],
      ['draft', 'archived',  'archive'],
      ['review', 'archived', 'archive'],
      ['published', 'draft', 'reject'],
      ['archived', 'published', 'publish'],
      ['archived', 'review', 'review'],
    ];

    it.each(INVALID_SPEC)('should reject invalid transition %s -> %s', (from, to, action) => {
      const entity = createEntityWithStatus(from as any);
      expect(() => doAction(entity, action)).toThrow(
        `Invalid status transition from "${from}" to "${to}"`,
      );
    });
  });

  // ── Workflow Methods ──────────────────────────────────────────────────────────

  describe('requestReview', () => {
    it('should set status to review and assign reviewer', () => {
      const entity = createEntity();
      entity.requestReview('reviewer-id');
      expect(entity.status).toBe('review');
      expect(entity.reviewerId).toBe('reviewer-id');
    });
  });

  describe('publish', () => {
    it('should increment version and set publishedAt', () => {
      const entity = createEntityWithStatus('review');
      const before = entity.version;
      entity.publish();
      expect(entity.status).toBe('published');
      expect(entity.version).toBe(before + 1);
      expect(entity.publishedAt).toBeInstanceOf(Date);
    });
  });

  describe('rejectReview', () => {
    it('should return to draft and clear reviewer', () => {
      const entity = createEntityWithStatus('review');
      entity.rejectReview();
      expect(entity.status).toBe('draft');
      expect(entity.reviewerId).toBeNull();
    });
  });

  describe('archive', () => {
    it('should set status to archived and set archivedAt', () => {
      const entity = createEntityWithStatus('published');
      entity.archive();
      expect(entity.status).toBe('archived');
      expect(entity.archivedAt).toBeInstanceOf(Date);
    });
  });

  describe('restoreFromArchive', () => {
    it('should return to draft and clear archivedAt', () => {
      const entity = createEntityWithStatus('archived');
      entity.restoreFromArchive();
      expect(entity.status).toBe('draft');
      expect(entity.archivedAt).toBeNull();
    });
  });

  // ── Soft Delete / Restore ─────────────────────────────────────────────────────

  describe('softDelete / restore', () => {
    it('should set isActive to false', () => {
      const entity = createEntity();
      entity.softDelete();
      expect(entity.isDeleted()).toBe(true);
      expect(entity.isActive).toBe(false);
    });

    it('should set isActive back to true', () => {
      const entity = createEntity();
      entity.softDelete();
      entity.restore();
      expect(entity.isDeleted()).toBe(false);
      expect(entity.isActive).toBe(true);
    });
  });
});

// ── Helpers ──────────────────────────────────────────────────────────────────────

function step(entity: KnowledgeEntity, steps: string[]) {
  for (const s of steps) {
    doAction(entity, s);
  }
}

function createEntityWithStatus(status: 'draft' | 'review' | 'published' | 'archived'): KnowledgeEntity {
  const entity = KnowledgeEntity.create({ workspaceId: WS_ID });
  const path: Record<string, string[]> = {
    draft: [],
    review: ['review'],
    published: ['review', 'publish'],
    archived: ['review', 'publish', 'archive'],
  };
  step(entity, path[status]!);
  return entity;
}

function doAction(entity: KnowledgeEntity, action: string): void {
  switch (action) {
    case 'review':  entity.requestReview('x'); break;
    case 'publish': entity.publish(); break;
    case 'archive': entity.archive(); break;
    case 'restore': entity.restoreFromArchive(); break;
    case 'reject':  entity.rejectReview(); break;
  }
}
