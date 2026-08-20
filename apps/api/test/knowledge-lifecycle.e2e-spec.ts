import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../src/modules/rbac/infrastructure/guards/workspace.guard.js';
import { PermissionsGuard } from '../src/modules/rbac/infrastructure/guards/permissions.guard.js';
import { PlanEntitlementService } from '../src/modules/billing/application/services/plan-entitlement.service.js';
import { KnowledgeController } from '../src/modules/knowledge/presentation/controllers/knowledge.controller.js';
import { KnowledgeService } from '../src/modules/knowledge/application/services/knowledge.service.js';
import { IKnowledgeRepository } from '../src/modules/knowledge/domain/interfaces/knowledge.repository.interface.js';
import { KnowledgeEntity } from '../src/modules/knowledge/domain/entities/knowledge.entity.js';

jest.mock('@xennic/database', () => {
  const mockPrisma = {
    knowledge: {
      findMany: jest.fn().mockResolvedValue([]),
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation((args) => Promise.resolve({ id: crypto.randomUUID(), ...args.data })),
      update: jest.fn().mockImplementation((args) => Promise.resolve({ id: args.where.id })),
      delete: jest.fn().mockResolvedValue({}),
      count: jest.fn().mockResolvedValue(0),
    },
    knowledge_taxonomy: {
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      create: jest
        .fn()
        .mockImplementation((args) => Promise.resolve({ id: crypto.randomUUID(), ...args.data })),
      delete: jest.fn().mockResolvedValue({}),
    },
    knowledge_analytics: {
      findUnique: jest.fn().mockResolvedValue(null),
      upsert: jest
        .fn()
        .mockImplementation((args) => Promise.resolve({ id: crypto.randomUUID(), ...args.create })),
      findMany: jest.fn().mockResolvedValue([]),
    },
    knowledge_formulas: { findMany: jest.fn().mockResolvedValue([]) },
    knowledge_examples: { findMany: jest.fn().mockResolvedValue([]) },
    knowledge_versions: {
      findMany: jest.fn().mockResolvedValue([]),
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation((args) => Promise.resolve({ id: crypto.randomUUID(), ...args.data })),
    },
    comments: { findMany: jest.fn().mockResolvedValue([]) },
    workflow_entries: {
      findMany: jest.fn().mockResolvedValue([]),
      create: jest
        .fn()
        .mockImplementation((args) => Promise.resolve({ id: crypto.randomUUID(), ...args.data })),
    },
    calculations: { findMany: jest.fn().mockResolvedValue([]) },
    $queryRaw: jest.fn().mockResolvedValue([]),
    $executeRaw: jest.fn().mockResolvedValue([]),
  };
  return { prisma: mockPrisma };
});

function makeEntity(overrides: Partial<any> = {}): KnowledgeEntity {
  return KnowledgeEntity.reconstitute({
    id: overrides.id ?? crypto.randomUUID(),
    workspaceId: overrides.workspaceId ?? 'ws-1',
    slug: overrides.slug ?? 'test-article',
    status: overrides.status ?? 'draft',
    visibility: 'workspace',
    language: 'fa',
    version: 1,
    isActive: true,
    content: { blocks: [{ text: 'test' }] },
    searchText: 'test',
    readingTime: 1,
    difficulty: 'beginner',
    authorId: 'user-1',
    reviewerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: null,
    reviewedAt: null,
    archivedAt: null,
  });
}

let entityStore: Map<string, KnowledgeEntity> = new Map();

const mockKnowledgeRepository: IKnowledgeRepository = {
  save: jest.fn().mockImplementation(async (entity: KnowledgeEntity) => {
    entityStore.set(entity.id, entity);
    return entity;
  }),
  findById: jest.fn().mockImplementation(async (id: string) => {
    return entityStore.get(id) ?? null;
  }),
  findBySlug: jest.fn().mockImplementation(async (workspaceId: string, slug: string) => {
    for (const entity of entityStore.values()) {
      if (entity.slug === slug) return entity;
    }
    return makeEntity({ slug });
  }),
  findAll: jest.fn().mockResolvedValue([]),
  count: jest.fn().mockResolvedValue(0),
  search: jest.fn().mockResolvedValue({ data: [], total: 0 }),
  delete: jest.fn().mockResolvedValue(undefined),
};

describe('Knowledge Lifecycle (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgeController],
      providers: [
        KnowledgeService,
        { provide: 'IKnowledgeRepository', useValue: mockKnowledgeRepository },
        {
          provide: PlanEntitlementService,
          useValue: { getWorkspaceKnowledgeTier: jest.fn().mockResolvedValue('enterprise') },
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: 'user-1', planSlug: 'enterprise' };
          return true;
        },
      })
      .overrideGuard(WorkspaceGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.workspaceId = 'ws-1';
          return true;
        },
      })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    entityStore.clear();
    const entity = makeEntity({ id: 'test-article-id', status: 'review' });
    entityStore.set('test-article-id', entity);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a knowledge article', async () => {
    const res = await request(app.getHttpServer())
      .post('/knowledge')
      .set('x-workspace-id', 'ws-1')
      .send({
        slug: 'ohm-law-basics',
        content: { blocks: [{ text: "Ohm's law: V = IR" }] },
        language: 'en',
        visibility: 'workspace',
        difficulty: 'beginner',
      })
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.slug).toBe('ohm-law-basics');
  });

  it('should list knowledge articles', async () => {
    const res = await request(app.getHttpServer())
      .get('/knowledge')
      .query({ page: 1, limit: 20 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should get a knowledge article by slug', async () => {
    const res = await request(app.getHttpServer()).get('/knowledge/slug/test-article').expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.slug).toBe('test-article');
  });

  it('should update a knowledge article', async () => {
    const res = await request(app.getHttpServer())
      .patch('/knowledge/test-article-id')
      .send({ slug: 'updated-slug', content: { blocks: [{ text: 'updated' }] } })
      .expect(200);

    expect(res.body.success).toBe(true);
  });

  it('should publish a knowledge article', async () => {
    const res = await request(app.getHttpServer())
      .post('/knowledge/test-article-id/publish')
      .expect(201);

    expect(res.body.success).toBe(true);
  });

  it('should soft-delete a knowledge article', async () => {
    await request(app.getHttpServer()).delete('/knowledge/test-article-id').expect(204);
  });

  it('should search knowledge articles', async () => {
    const res = await request(app.getHttpServer())
      .get('/knowledge/search')
      .query({ q: 'ohms law', page: 1, limit: 20 })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should return 404 for non-existent article', async () => {
    const res = await request(app.getHttpServer()).get('/knowledge/non-existent-id').expect(404);

    expect(res.body.error || res.body.success === false).toBeTruthy();
  });
});
