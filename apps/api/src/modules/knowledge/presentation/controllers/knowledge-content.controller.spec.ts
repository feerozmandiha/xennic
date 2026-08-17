jest.mock('@xennic/database', () => ({ prisma: {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { KnowledgeContentController } from './knowledge-content.controller.js';
import { KnowledgeContentService } from '../../application/services/knowledge-content.service.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';

const WS_ID = 'ws-123';
const USER_ID = 'user-456';
const ARTICLE_ID = 'article-789';

function makeReq(): any {
  return { workspaceId: WS_ID, user: { userId: USER_ID } };
}

const translation = {
  id: 'tr-en',
  knowledgeId: ARTICLE_ID,
  language: 'en',
  title: 'Arc flash',
  summary: 'Summary',
  seoTitle: null,
  seoDescription: null,
  content: { body: 'x' },
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
};

const media = {
  id: 'media-1',
  knowledgeId: ARTICLE_ID,
  type: 'image',
  url: 'https://cdn.example.com/a.png',
  captionFa: null,
  captionEn: null,
  altFa: null,
  altEn: null,
  description: null,
  license: null,
  source: null,
  fileSize: null,
  mimeType: null,
  sortOrder: 0,
  createdAt: new Date('2026-01-01'),
};

const formula = {
  id: 'formula-1',
  knowledgeId: ARTICLE_ID,
  latex: 'I = P / U',
  mathml: null,
  descriptionFa: null,
  descriptionEn: null,
  variables: [],
  calculatorType: 'CABLE-003',
  sortOrder: 0,
  createdAt: new Date('2026-01-01'),
};

const example = {
  id: 'example-1',
  knowledgeId: ARTICLE_ID,
  titleFa: 'مثال',
  titleEn: null,
  difficulty: 'basic',
  steps: [],
  answer: null,
  calculatorType: null,
  sortOrder: 0,
  createdAt: new Date('2026-01-01'),
};

describe('KnowledgeContentController', () => {
  let controller: KnowledgeContentController;
  let service: jest.Mocked<KnowledgeContentService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KnowledgeContentController],
      providers: [
        {
          provide: KnowledgeContentService,
          useValue: {
            listTranslations: jest.fn(),
            getTranslation: jest.fn(),
            upsertTranslation: jest.fn(),
            deleteTranslation: jest.fn(),
            getLocalized: jest.fn(),
            listMedia: jest.fn(),
            addMedia: jest.fn(),
            updateMedia: jest.fn(),
            removeMedia: jest.fn(),
            listFormulas: jest.fn(),
            addFormula: jest.fn(),
            updateFormula: jest.fn(),
            removeFormula: jest.fn(),
            listExamples: jest.fn(),
            addExample: jest.fn(),
            updateExample: jest.fn(),
            removeExample: jest.fn(),
            likeComment: jest.fn(),
            unlikeComment: jest.fn(),
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

    controller = module.get(KnowledgeContentController);
    service = module.get(KnowledgeContentService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── Translations ───────────────────────────────────────────────────────────

  describe('GET /knowledge/:id/translations', () => {
    it('returns the translation list', async () => {
      service.listTranslations.mockResolvedValue([translation]);

      const result = await controller.listTranslations(ARTICLE_ID, makeReq());

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.language).toBe('en');
      expect(service.listTranslations).toHaveBeenCalledWith(ARTICLE_ID, WS_ID);
    });
  });

  describe('GET /knowledge/:id/translations/:language', () => {
    it('returns one translation', async () => {
      service.getTranslation.mockResolvedValue(translation);

      const result = await controller.getTranslation(ARTICLE_ID, 'en', makeReq());

      expect(result.data.title).toBe('Arc flash');
      expect(service.getTranslation).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, 'en');
    });
  });

  describe('PUT /knowledge/:id/translations', () => {
    it('upserts a translation', async () => {
      service.upsertTranslation.mockResolvedValue(translation);
      const dto = { language: 'en', title: 'Arc flash' };

      const result = await controller.upsertTranslation(ARTICLE_ID, dto as any, makeReq());

      expect(result.success).toBe(true);
      expect(service.upsertTranslation).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, dto);
    });
  });

  describe('DELETE /knowledge/:id/translations/:language', () => {
    it('deletes a translation', async () => {
      service.deleteTranslation.mockResolvedValue(undefined);

      await controller.deleteTranslation(ARTICLE_ID, 'en', makeReq());

      expect(service.deleteTranslation).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, 'en');
    });
  });

  describe('GET /knowledge/:id/localized', () => {
    it('passes the requested locale through', async () => {
      service.getLocalized.mockResolvedValue({
        id: ARTICLE_ID,
        slug: 'test-article',
        requestedLocale: 'en',
        resolvedLocale: 'fa',
        isFallback: true,
        title: 'عنوان',
        summary: null,
        seoTitle: null,
        seoDescription: null,
        content: {},
        availableLocales: ['fa'],
      });

      const result = await controller.getLocalized(ARTICLE_ID, makeReq(), 'en');

      expect(result.data.isFallback).toBe(true);
      expect(service.getLocalized).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, 'en');
    });
  });

  // ── Media ──────────────────────────────────────────────────────────────────

  describe('media endpoints', () => {
    it('lists media', async () => {
      service.listMedia.mockResolvedValue([media]);

      const result = await controller.listMedia(ARTICLE_ID, makeReq());

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.url).toBe('https://cdn.example.com/a.png');
    });

    it('attaches media', async () => {
      service.addMedia.mockResolvedValue(media);
      const dto = { type: 'image', url: 'https://cdn.example.com/a.png' };

      const result = await controller.addMedia(ARTICLE_ID, dto as any, makeReq());

      expect(result.success).toBe(true);
      expect(service.addMedia).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, dto);
    });

    it('updates media', async () => {
      service.updateMedia.mockResolvedValue(media);
      const dto = { captionFa: 'شرح' };

      await controller.updateMedia(ARTICLE_ID, 'media-1', dto as any, makeReq());

      expect(service.updateMedia).toHaveBeenCalledWith(ARTICLE_ID, 'media-1', WS_ID, dto);
    });

    it('detaches media', async () => {
      service.removeMedia.mockResolvedValue(undefined);

      await controller.removeMedia(ARTICLE_ID, 'media-1', makeReq());

      expect(service.removeMedia).toHaveBeenCalledWith(ARTICLE_ID, 'media-1', WS_ID);
    });
  });

  // ── Formulas ───────────────────────────────────────────────────────────────

  describe('formula endpoints', () => {
    it('lists formulas', async () => {
      service.listFormulas.mockResolvedValue([formula]);

      const result = await controller.listFormulas(ARTICLE_ID, makeReq());

      expect(result.data[0]?.calculatorType).toBe('CABLE-003');
    });

    it('adds a formula', async () => {
      service.addFormula.mockResolvedValue(formula);
      const dto = { latex: 'I = P / U' };

      const result = await controller.addFormula(ARTICLE_ID, dto as any, makeReq());

      expect(result.data.latex).toBe('I = P / U');
      expect(service.addFormula).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, dto);
    });

    it('updates a formula', async () => {
      service.updateFormula.mockResolvedValue(formula);

      await controller.updateFormula(ARTICLE_ID, 'formula-1', { latex: 'x' } as any, makeReq());

      expect(service.updateFormula).toHaveBeenCalledWith(ARTICLE_ID, 'formula-1', WS_ID, {
        latex: 'x',
      });
    });

    it('deletes a formula', async () => {
      service.removeFormula.mockResolvedValue(undefined);

      await controller.removeFormula(ARTICLE_ID, 'formula-1', makeReq());

      expect(service.removeFormula).toHaveBeenCalledWith(ARTICLE_ID, 'formula-1', WS_ID);
    });
  });

  // ── Examples ───────────────────────────────────────────────────────────────

  describe('example endpoints', () => {
    it('lists examples', async () => {
      service.listExamples.mockResolvedValue([example]);

      const result = await controller.listExamples(ARTICLE_ID, makeReq());

      expect(result.data[0]?.titleFa).toBe('مثال');
    });

    it('adds an example', async () => {
      service.addExample.mockResolvedValue(example);
      const dto = { titleFa: 'مثال' };

      const result = await controller.addExample(ARTICLE_ID, dto as any, makeReq());

      expect(result.success).toBe(true);
      expect(service.addExample).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, dto);
    });

    it('updates an example', async () => {
      service.updateExample.mockResolvedValue(example);

      await controller.updateExample(ARTICLE_ID, 'example-1', { titleFa: 'y' } as any, makeReq());

      expect(service.updateExample).toHaveBeenCalledWith(ARTICLE_ID, 'example-1', WS_ID, {
        titleFa: 'y',
      });
    });

    it('deletes an example', async () => {
      service.removeExample.mockResolvedValue(undefined);

      await controller.removeExample(ARTICLE_ID, 'example-1', makeReq());

      expect(service.removeExample).toHaveBeenCalledWith(ARTICLE_ID, 'example-1', WS_ID);
    });
  });

  // ── Comment reactions ──────────────────────────────────────────────────────

  describe('comment likes', () => {
    it('likes a comment and reports likedByMe', async () => {
      service.likeComment.mockResolvedValue({
        id: 'comment-1',
        knowledgeId: ARTICLE_ID,
        likes: 1,
        likedBy: [USER_ID],
        deletedAt: null,
      });

      const result = await controller.likeComment(ARTICLE_ID, 'comment-1', makeReq());

      expect(result.data.likes).toBe(1);
      expect(result.data.likedByMe).toBe(true);
      expect(service.likeComment).toHaveBeenCalledWith(ARTICLE_ID, 'comment-1', WS_ID, USER_ID);
    });

    it('unlikes a comment and reports likedByMe false', async () => {
      service.unlikeComment.mockResolvedValue({
        id: 'comment-1',
        knowledgeId: ARTICLE_ID,
        likes: 0,
        likedBy: [],
        deletedAt: null,
      });

      const result = await controller.unlikeComment(ARTICLE_ID, 'comment-1', makeReq());

      expect(result.data.likes).toBe(0);
      expect(result.data.likedByMe).toBe(false);
    });
  });
});
