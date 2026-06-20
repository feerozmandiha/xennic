jest.mock('@xennic/database', () => ({
  prisma: {
    knowledge_taxonomy: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      createMany: jest.fn(),
      delete: jest.fn(),
    },
    knowledge_analytics: {
      upsert: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
    knowledge_versions: {
      create: jest.fn(),
    },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { KnowledgeService } from './knowledge.service.js';
import { KnowledgeEntity } from '../../domain/entities/knowledge.entity.js';
import type { IKnowledgeRepository } from '../../domain/interfaces/knowledge.repository.interface.js';
import type { CreateKnowledgeDto, UpdateKnowledgeDto, AddTaxonomyDto } from '../../presentation/dtos/knowledge.dto.js';

const WS_ID = 'ws-123';
const USER_ID = 'user-456';
const ARTICLE_ID = 'article-789';

function makeEntity(overrides?: Partial<KnowledgeEntity>): KnowledgeEntity {
  const entity = KnowledgeEntity.create({ workspaceId: WS_ID, slug: 'test-article', authorId: USER_ID });
  Object.defineProperty(entity, 'id', { value: ARTICLE_ID });
  return entity;
}

describe('KnowledgeService', () => {
  let service: KnowledgeService;
  let repo: jest.Mocked<IKnowledgeRepository>;
  let prisma: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeService,
        {
          provide: 'IKnowledgeRepository',
          useValue: {
            findById: jest.fn(),
            findBySlug: jest.fn(),
            findAll: jest.fn(),
            count: jest.fn(),
            search: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            exists: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<KnowledgeService>(KnowledgeService);
    repo = module.get('IKnowledgeRepository') as jest.Mocked<IKnowledgeRepository>;
    prisma = jest.requireMock('@xennic/database').prisma;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── findAll ─────────────────────────────────────────────────────────────────

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const entities = [makeEntity()];
      repo.findAll.mockResolvedValue(entities);
      repo.count.mockResolvedValue(1);

      const result = await service.findAll(WS_ID, 1, 20);

      expect(result.data).toEqual(entities);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
      expect(repo.findAll).toHaveBeenCalledWith(WS_ID, 0, 20, undefined);
      expect(repo.count).toHaveBeenCalledWith(WS_ID, undefined);
    });

    it('should pass status filter', async () => {
      repo.findAll.mockResolvedValue([]);
      repo.count.mockResolvedValue(0);

      await service.findAll(WS_ID, 1, 20, 'draft');

      expect(repo.findAll).toHaveBeenCalledWith(WS_ID, 0, 20, 'draft');
      expect(repo.count).toHaveBeenCalledWith(WS_ID, 'draft');
    });

    it('should calculate correct offset', async () => {
      repo.findAll.mockResolvedValue([]);
      repo.count.mockResolvedValue(0);

      await service.findAll(WS_ID, 3, 10);

      expect(repo.findAll).toHaveBeenCalledWith(WS_ID, 20, 10, undefined);
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────────────

  describe('findOne', () => {
    it('should return entity when found and accessible', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);

      const result = await service.findOne(ARTICLE_ID, WS_ID);

      expect(result).toBe(entity);
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne(ARTICLE_ID, WS_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when soft-deleted', async () => {
      const entity = makeEntity();
      entity.softDelete();
      repo.findById.mockResolvedValue(entity);

      await expect(service.findOne(ARTICLE_ID, WS_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when workspace mismatch', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);

      await expect(service.findOne(ARTICLE_ID, 'other-ws')).rejects.toThrow(ForbiddenException);
    });
  });

  // ── findBySlug ──────────────────────────────────────────────────────────────

  describe('findBySlug', () => {
    it('should return entity when found', async () => {
      const entity = makeEntity();
      repo.findBySlug.mockResolvedValue(entity);

      const result = await service.findBySlug(WS_ID, 'test-article');

      expect(result).toBe(entity);
      expect(repo.findBySlug).toHaveBeenCalledWith(WS_ID, 'test-article');
    });

    it('should throw NotFoundException when not found', async () => {
      repo.findBySlug.mockResolvedValue(null);

      await expect(service.findBySlug(WS_ID, 'unknown')).rejects.toThrow(NotFoundException);
    });
  });

  // ── create ──────────────────────────────────────────────────────────────────

  describe('create', () => {
    it('should create entity and save to repository', async () => {
      const dto: CreateKnowledgeDto = {
        slug: 'new-article',
        content: { type: 'doc' },
        language: 'fa',
        visibility: 'workspace',
        difficulty: 'intermediate',
      };

      const result = await service.create(dto, WS_ID, USER_ID);

      expect(result.slug).toBe('new-article');
      expect(result.workspaceId).toBe(WS_ID);
      expect(result.authorId).toBe(USER_ID);
      expect(result.status).toBe('draft');
      expect(repo.save).toHaveBeenCalledWith(result);
    });

    it('should save taxonomy if provided', async () => {
      const dto: CreateKnowledgeDto = {
        slug: 'taxonomy-article',
        taxonomy: [
          { taxonomyType: 'tag', taxonomyId: 'tag-1' },
          { taxonomyType: 'category', taxonomyId: 'cat-1' },
        ],
      };

      await service.create(dto, WS_ID, USER_ID);

      expect(prisma.knowledge_taxonomy.createMany).toHaveBeenCalledWith({
        data: expect.arrayContaining([
          expect.objectContaining({ taxonomy_type: 'tag', taxonomy_id: 'tag-1' }),
          expect.objectContaining({ taxonomy_type: 'category', taxonomy_id: 'cat-1' }),
        ]),
      });
    });

    it('should not save taxonomy when absent', async () => {
      const dto: CreateKnowledgeDto = { slug: 'no-taxonomy' };

      await service.create(dto, WS_ID, USER_ID);

      expect(prisma.knowledge_taxonomy.createMany).not.toHaveBeenCalled();
    });
  });

  // ── update ──────────────────────────────────────────────────────────────────

  describe('update', () => {
    it('should update entity fields and save', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);

      const dto: UpdateKnowledgeDto = { slug: 'updated-slug', difficulty: 'advanced' };
      const result = await service.update(ARTICLE_ID, WS_ID, dto);

      expect(result.slug).toBe('updated-slug');
      expect(result.difficulty).toBe('advanced');
      expect(repo.save).toHaveBeenCalledWith(entity);
    });
  });

  // ── Workflow ────────────────────────────────────────────────────────────────

  describe('requestReview', () => {
    it('should transition to review', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);

      const result = await service.requestReview(ARTICLE_ID, WS_ID, 'reviewer-id');

      expect(result.status).toBe('review');
      expect(result.reviewerId).toBe('reviewer-id');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('publish', () => {
    it('should transition to published and create version snapshot', async () => {
      const entity = makeEntity();
      entity.requestReview('reviewer-id');
      repo.findById.mockResolvedValue(entity);

      const result = await service.publish(ARTICLE_ID, WS_ID);

      expect(result.status).toBe('published');
      expect(result.version).toBe(2);
      expect(prisma.knowledge_versions.create).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
    });

    it('should reject invalid transitions', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);

      await expect(service.publish(ARTICLE_ID, WS_ID)).rejects.toThrow();
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('rejectReview', () => {
    it('should transition back to draft', async () => {
      const entity = makeEntity();
      entity.requestReview('reviewer-id');
      repo.findById.mockResolvedValue(entity);

      const result = await service.rejectReview(ARTICLE_ID, WS_ID);

      expect(result.status).toBe('draft');
      expect(result.reviewerId).toBeNull();
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('archive', () => {
    it('should transition to archived', async () => {
      const entity = makeEntity();
      entity.requestReview('reviewer-id');
      entity.publish();
      repo.findById.mockResolvedValue(entity);

      const result = await service.archive(ARTICLE_ID, WS_ID);

      expect(result.status).toBe('archived');
      expect(repo.save).toHaveBeenCalled();
    });
  });

  describe('restoreFromArchive', () => {
    it('should transition to draft', async () => {
      const entity = makeEntity();
      entity.requestReview('reviewer-id');
      entity.publish();
      entity.archive();
      repo.findById.mockResolvedValue(entity);

      const result = await service.restoreFromArchive(ARTICLE_ID, WS_ID);

      expect(result.status).toBe('draft');
      expect(result.archivedAt).toBeNull();
      expect(repo.save).toHaveBeenCalled();
    });
  });

  // ── remove ──────────────────────────────────────────────────────────────────

  describe('remove', () => {
    it('should soft-delete entity', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);

      await service.remove(ARTICLE_ID, WS_ID);

      expect(entity.isDeleted()).toBe(true);
      expect(repo.save).toHaveBeenCalledWith(entity);
    });
  });

  // ── search ──────────────────────────────────────────────────────────────────

  describe('search', () => {
    it('should delegate to repository search', async () => {
      const entities = [makeEntity()];
      repo.search.mockResolvedValue({ data: entities, total: 1 });

      const result = await service.search(WS_ID, { q: 'test', page: '1', limit: '10' });

      expect(result.data).toEqual(entities);
      expect(result.meta.total).toBe(1);
      expect(repo.search).toHaveBeenCalledWith(WS_ID, expect.objectContaining({
        query: 'test', offset: 0, limit: 10,
      }));
    });

    it('should default page and limit', async () => {
      repo.search.mockResolvedValue({ data: [], total: 0 });

      await service.search(WS_ID, {});

      expect(repo.search).toHaveBeenCalledWith(WS_ID, expect.objectContaining({
        offset: 0, limit: 20,
      }));
    });
  });

  // ── Taxonomy ────────────────────────────────────────────────────────────────

  describe('addTaxonomy', () => {
    it('should add taxonomy assignment', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);
      prisma.knowledge_taxonomy.findFirst.mockResolvedValue(null);

      const dto: AddTaxonomyDto = { taxonomyType: 'tag', taxonomyId: 'tag-1' };
      await service.addTaxonomy(ARTICLE_ID, WS_ID, dto);

      expect(prisma.knowledge_taxonomy.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          knowledge_id: ARTICLE_ID,
          taxonomy_type: 'tag',
          taxonomy_id: 'tag-1',
        }),
      });
    });

    it('should throw ConflictException when already assigned', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);
      prisma.knowledge_taxonomy.findFirst.mockResolvedValue({ id: 'existing' });

      const dto: AddTaxonomyDto = { taxonomyType: 'tag', taxonomyId: 'tag-1' };
      await expect(service.addTaxonomy(ARTICLE_ID, WS_ID, dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('removeTaxonomy', () => {
    it('should remove taxonomy assignment', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);
      prisma.knowledge_taxonomy.findFirst.mockResolvedValue({ id: 'taxonomy-rel-1' });

      await service.removeTaxonomy(ARTICLE_ID, WS_ID, 'taxonomy-rel-1');

      expect(prisma.knowledge_taxonomy.delete).toHaveBeenCalledWith({ where: { id: 'taxonomy-rel-1' } });
    });

    it('should throw NotFoundException when not found', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);
      prisma.knowledge_taxonomy.findFirst.mockResolvedValue(null);

      await expect(service.removeTaxonomy(ARTICLE_ID, WS_ID, 'unknown')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTaxonomy', () => {
    it('should return all assignments for article', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);
      const rows = [{ id: 't1', taxonomy_type: 'tag', taxonomy_id: 'tag-1' }];
      prisma.knowledge_taxonomy.findMany.mockResolvedValue(rows);

      const result = await service.getTaxonomy(ARTICLE_ID, WS_ID);

      expect(result).toEqual(rows);
      expect(prisma.knowledge_taxonomy.findMany).toHaveBeenCalledWith({
        where: { knowledge_id: ARTICLE_ID },
      });
    });
  });

  // ── Analytics ───────────────────────────────────────────────────────────────

  describe('recordView', () => {
    it('should upsert view count', async () => {
      const entity = makeEntity();
      repo.findById.mockResolvedValue(entity);
      (prisma.knowledge_analytics.findUnique as jest.Mock).mockResolvedValue(null);

      await service.recordView(ARTICLE_ID, WS_ID);

      expect(prisma.knowledge_analytics.upsert).toHaveBeenCalledWith({
        where: { knowledge_id: ARTICLE_ID },
        update: expect.objectContaining({ views: { increment: 1 } }),
        create: expect.objectContaining({ knowledge_id: ARTICLE_ID, views: 1 }),
      });
    });
  });
});
