jest.mock('@xennic/database', () => ({
  prisma: {
    $queryRaw: jest.fn(),
    $queryRawUnsafe: jest.fn(),
    $executeRawUnsafe: jest.fn(),
    knowledge_taxonomy: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), createMany: jest.fn(), delete: jest.fn() },
    knowledge_analytics: { upsert: jest.fn() },
    knowledge_versions: { create: jest.fn() },
    workspaces: { findUnique: jest.fn(), findMany: jest.fn(), upsert: jest.fn(), count: jest.fn() },
    workspace_members: { findFirst: jest.fn(), findMany: jest.fn(), create: jest.fn(), delete: jest.fn(), count: jest.fn() },
    roles: { findUnique: jest.fn(), findMany: jest.fn() },
    role_permissions: { findMany: jest.fn(), deleteMany: jest.fn(), createMany: jest.fn() },
    users: { findUnique: jest.fn(), findMany: jest.fn(), count: jest.fn() },
  },
}));

import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeController } from './knowledge.controller.js';
import { KnowledgeService } from '../../application/services/knowledge.service.js';
import { KnowledgeEntity } from '../../domain/entities/knowledge.entity.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';


const WS_ID = 'ws-123';
const USER_ID = 'user-456';
const ARTICLE_ID = 'article-789';

function makeReq(): any {
  return {
    workspaceId: WS_ID,
    user: { userId: USER_ID },
  };
}

function makeEntity(): KnowledgeEntity {
  return KnowledgeEntity.create({ workspaceId: WS_ID, slug: 'test-article', authorId: USER_ID });
}

describe('KnowledgeController', () => {
  let controller: KnowledgeController;
  let knowledgeService: jest.Mocked<KnowledgeService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgeController],
      providers: [
        {
          provide: KnowledgeService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            findBySlug: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            requestReview: jest.fn(),
            publish: jest.fn(),
            rejectReview: jest.fn(),
            archive: jest.fn(),
            restoreFromArchive: jest.fn(),
            search: jest.fn(),
            addTaxonomy: jest.fn(),
            removeTaxonomy: jest.fn(),
            getTaxonomy: jest.fn(),
            recordView: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<KnowledgeController>(KnowledgeController);
    knowledgeService = module.get(KnowledgeService) as jest.Mocked<KnowledgeService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /knowledge', () => {
    it('should return paginated list', async () => {
      const entities = [makeEntity()];
      knowledgeService.findAll.mockResolvedValue({ data: entities, meta: { page: 1, limit: 20, total: 1, totalPages: 1 } });

      const result = await controller.findAll(makeReq(), '1', '20', undefined);

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(knowledgeService.findAll).toHaveBeenCalledWith(WS_ID, 1, 20, undefined);
    });
  });

  describe('POST /knowledge', () => {
    it('should create an article', async () => {
      const entity = makeEntity();
      knowledgeService.create.mockResolvedValue(entity);

      const dto = { slug: 'new-article' };
      const result = await controller.create(dto as any, makeReq());

      expect(result.success).toBe(true);
      expect(result.data.slug).toBe('test-article');
      expect(knowledgeService.create).toHaveBeenCalledWith(dto, WS_ID, USER_ID);
    });
  });

  describe('GET /knowledge/search', () => {
    it('should return search results', async () => {
      const entities = [makeEntity()];
      knowledgeService.search.mockResolvedValue({ data: entities, meta: { page: 1, limit: 20, total: 1, totalPages: 1 } });

      const query = { q: 'test' };
      const result = await controller.search(makeReq(), query as any);

      expect(result.success).toBe(true);
      expect(knowledgeService.search).toHaveBeenCalledWith(WS_ID, query);
    });
  });

  describe('GET /knowledge/slug/:slug', () => {
    it('should return article by slug', async () => {
      const entity = makeEntity();
      knowledgeService.findBySlug.mockResolvedValue(entity);

      const result = await controller.findBySlug('test-article', makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.findBySlug).toHaveBeenCalledWith(WS_ID, 'test-article');
    });
  });

  describe('GET /knowledge/:id', () => {
    it('should return article by id', async () => {
      const entity = makeEntity();
      knowledgeService.findOne.mockResolvedValue(entity);

      const result = await controller.findOne(ARTICLE_ID, makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.findOne).toHaveBeenCalledWith(ARTICLE_ID, WS_ID);
    });
  });

  describe('PATCH /knowledge/:id', () => {
    it('should update article', async () => {
      const entity = makeEntity();
      knowledgeService.update.mockResolvedValue(entity);

      const dto = { slug: 'updated' };
      const result = await controller.update(ARTICLE_ID, dto as any, makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.update).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, dto);
    });
  });

  describe('DELETE /knowledge/:id', () => {
    it('should soft-delete article', async () => {
      await controller.remove(ARTICLE_ID, makeReq());

      expect(knowledgeService.remove).toHaveBeenCalledWith(ARTICLE_ID, WS_ID);
    });
  });

  describe('POST /knowledge/:id/review', () => {
    it('should request review', async () => {
      const entity = makeEntity();
      knowledgeService.requestReview.mockResolvedValue(entity);

      const result = await controller.requestReview(ARTICLE_ID, { reviewerId: 'reviewer-id' }, makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.requestReview).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, 'reviewer-id');
    });
  });

  describe('POST /knowledge/:id/publish', () => {
    it('should publish article', async () => {
      const entity = makeEntity();
      knowledgeService.publish.mockResolvedValue(entity);

      const result = await controller.publish(ARTICLE_ID, makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.publish).toHaveBeenCalledWith(ARTICLE_ID, WS_ID);
    });
  });

  describe('POST /knowledge/:id/reject', () => {
    it('should reject review', async () => {
      const entity = makeEntity();
      knowledgeService.rejectReview.mockResolvedValue(entity);

      const result = await controller.rejectReview(ARTICLE_ID, makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.rejectReview).toHaveBeenCalledWith(ARTICLE_ID, WS_ID);
    });
  });

  describe('POST /knowledge/:id/archive', () => {
    it('should archive article', async () => {
      const entity = makeEntity();
      knowledgeService.archive.mockResolvedValue(entity);

      const result = await controller.archive(ARTICLE_ID, makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.archive).toHaveBeenCalledWith(ARTICLE_ID, WS_ID);
    });
  });

  describe('POST /knowledge/:id/restore', () => {
    it('should restore from archive', async () => {
      const entity = makeEntity();
      knowledgeService.restoreFromArchive.mockResolvedValue(entity);

      const result = await controller.restoreFromArchive(ARTICLE_ID, makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.restoreFromArchive).toHaveBeenCalledWith(ARTICLE_ID, WS_ID);
    });
  });

  describe('GET /knowledge/:id/taxonomy', () => {
    it('should return taxonomy', async () => {
      const rows = [{ id: 't1', taxonomy_type: 'tag', taxonomy_id: 'tag-1' }];
      knowledgeService.getTaxonomy.mockResolvedValue(rows);

      const result = await controller.getTaxonomy(ARTICLE_ID, makeReq());

      expect(result.success).toBe(true);
      expect(result.data).toEqual(rows);
    });
  });

  describe('POST /knowledge/:id/taxonomy', () => {
    it('should add taxonomy', async () => {
      const dto = { taxonomyType: 'tag', taxonomyId: 'tag-1' };

      const result = await controller.addTaxonomy(ARTICLE_ID, dto as any, makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.addTaxonomy).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, dto);
    });
  });

  describe('DELETE /knowledge/:id/taxonomy/:taxonomyId', () => {
    it('should remove taxonomy', async () => {
      await controller.removeTaxonomy(ARTICLE_ID, 'taxonomy-rel-1', makeReq());

      expect(knowledgeService.removeTaxonomy).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, 'taxonomy-rel-1');
    });
  });

  describe('POST /knowledge/:id/view', () => {
    it('should record view', async () => {
      const result = await controller.recordView(ARTICLE_ID, makeReq());

      expect(result.success).toBe(true);
      expect(knowledgeService.recordView).toHaveBeenCalledWith(ARTICLE_ID, WS_ID);
    });
  });
});
