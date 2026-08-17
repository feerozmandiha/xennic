// `@xennic/database` is an ESM package that jest cannot transform; the real
// KnowledgeService is only used here as a DI token and is always mocked.
jest.mock('@xennic/database', () => ({ prisma: {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { KnowledgeContentService } from './knowledge-content.service.js';
import { KnowledgeService } from './knowledge.service.js';
import { KnowledgeEntity } from '../../domain/entities/knowledge.entity.js';
import type {
  IKnowledgeContentRepository,
  KnowledgeTranslationRecord,
  KnowledgeMediaRecord,
  KnowledgeFormulaRecord,
  KnowledgeExampleRecord,
  CommentReactionRecord,
} from '../../domain/interfaces/knowledge-content.repository.interface.js';

const WS_ID = 'ws-123';
const OTHER_WS_ID = 'ws-999';
const USER_ID = 'user-456';
const OTHER_USER_ID = 'user-789';
const ARTICLE_ID = 'article-789';
const COMMENT_ID = 'comment-1';

function makeEntity(overrides?: { language?: string; content?: Record<string, unknown> }) {
  const entity = KnowledgeEntity.create({
    workspaceId: WS_ID,
    slug: 'test-article',
    language: overrides?.language ?? 'fa',
    content: overrides?.content ?? { title: 'عنوان اصلی' },
    authorId: USER_ID,
  });
  Object.defineProperty(entity, 'id', { value: ARTICLE_ID });
  return entity;
}

function makeTranslation(
  overrides: Partial<KnowledgeTranslationRecord> & { language: string },
): KnowledgeTranslationRecord {
  return {
    id: `tr-${overrides.language}`,
    knowledgeId: ARTICLE_ID,
    language: overrides.language,
    title: overrides.title ?? `title-${overrides.language}`,
    summary: overrides.summary ?? null,
    seoTitle: overrides.seoTitle ?? null,
    seoDescription: overrides.seoDescription ?? null,
    content: overrides.content ?? { body: overrides.language },
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };
}

function makeMedia(overrides?: Partial<KnowledgeMediaRecord>): KnowledgeMediaRecord {
  return {
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
    ...overrides,
  };
}

function makeFormula(overrides?: Partial<KnowledgeFormulaRecord>): KnowledgeFormulaRecord {
  return {
    id: 'formula-1',
    knowledgeId: ARTICLE_ID,
    latex: 'I = P / U',
    mathml: null,
    descriptionFa: null,
    descriptionEn: null,
    variables: [],
    calculatorType: null,
    sortOrder: 0,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function makeExample(overrides?: Partial<KnowledgeExampleRecord>): KnowledgeExampleRecord {
  return {
    id: 'example-1',
    knowledgeId: ARTICLE_ID,
    titleFa: 'مثال یک',
    titleEn: null,
    difficulty: 'basic',
    steps: [],
    answer: null,
    calculatorType: null,
    sortOrder: 0,
    createdAt: new Date('2026-01-01'),
    ...overrides,
  };
}

function makeReaction(overrides?: Partial<CommentReactionRecord>): CommentReactionRecord {
  return {
    id: COMMENT_ID,
    knowledgeId: ARTICLE_ID,
    likes: 0,
    likedBy: [],
    deletedAt: null,
    ...overrides,
  };
}

describe('KnowledgeContentService', () => {
  let service: KnowledgeContentService;
  let repo: jest.Mocked<IKnowledgeContentRepository>;
  let knowledgeService: jest.Mocked<
    Pick<KnowledgeService, 'findOne' | 'findPublishedBySlug' | 'updateSearchText'>
  >;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KnowledgeContentService,
        {
          provide: 'IKnowledgeContentRepository',
          useValue: {
            findTranslations: jest.fn(),
            findTranslationByLanguage: jest.fn(),
            saveTranslation: jest.fn(),
            deleteTranslation: jest.fn(),
            findMedia: jest.fn(),
            findMediaById: jest.fn(),
            createMedia: jest.fn(),
            updateMedia: jest.fn(),
            deleteMedia: jest.fn(),
            findFormulas: jest.fn(),
            findFormulaById: jest.fn(),
            createFormula: jest.fn(),
            updateFormula: jest.fn(),
            deleteFormula: jest.fn(),
            findExamples: jest.fn(),
            findExampleById: jest.fn(),
            createExample: jest.fn(),
            updateExample: jest.fn(),
            deleteExample: jest.fn(),
            findCommentReaction: jest.fn(),
            saveCommentReaction: jest.fn(),
          },
        },
        {
          provide: KnowledgeService,
          useValue: {
            findOne: jest.fn(),
            findPublishedBySlug: jest.fn(),
            updateSearchText: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(KnowledgeContentService);
    repo = module.get('IKnowledgeContentRepository');
    knowledgeService = module.get(KnowledgeService);

    knowledgeService.findOne.mockResolvedValue(makeEntity());
    repo.findFormulas.mockResolvedValue([]);
    repo.findExamples.mockResolvedValue([]);
  });

  afterEach(() => jest.clearAllMocks());

  // ── Translations ───────────────────────────────────────────────────────────

  describe('listTranslations', () => {
    it('returns the stored translations', async () => {
      const rows = [makeTranslation({ language: 'en' })];
      repo.findTranslations.mockResolvedValue(rows);

      await expect(service.listTranslations(ARTICLE_ID, WS_ID)).resolves.toBe(rows);
      expect(repo.findTranslations).toHaveBeenCalledWith(ARTICLE_ID);
    });

    it('enforces workspace ownership through KnowledgeService', async () => {
      knowledgeService.findOne.mockRejectedValue(new NotFoundException());

      await expect(service.listTranslations(ARTICLE_ID, OTHER_WS_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.findTranslations).not.toHaveBeenCalled();
    });
  });

  describe('getTranslation', () => {
    it('returns the requested translation', async () => {
      const row = makeTranslation({ language: 'en' });
      repo.findTranslationByLanguage.mockResolvedValue(row);

      await expect(service.getTranslation(ARTICLE_ID, WS_ID, 'en')).resolves.toBe(row);
    });

    it('normalises the locale before lookup', async () => {
      repo.findTranslationByLanguage.mockResolvedValue(makeTranslation({ language: 'en' }));

      await service.getTranslation(ARTICLE_ID, WS_ID, 'EN-US');

      expect(repo.findTranslationByLanguage).toHaveBeenCalledWith(ARTICLE_ID, 'en');
    });

    it('throws NotFound when the translation is absent', async () => {
      repo.findTranslationByLanguage.mockResolvedValue(null);

      await expect(service.getTranslation(ARTICLE_ID, WS_ID, 'en')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects an unsupported locale with BadRequest', async () => {
      await expect(service.getTranslation(ARTICLE_ID, WS_ID, 'de')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('upsertTranslation', () => {
    it('saves the normalised locale and payload', async () => {
      const saved = makeTranslation({ language: 'en' });
      repo.saveTranslation.mockResolvedValue(saved);

      const result = await service.upsertTranslation(ARTICLE_ID, WS_ID, {
        language: 'en',
        title: 'Arc flash',
        summary: 'A summary',
        content: { body: 'x' },
      });

      expect(result).toBe(saved);
      expect(repo.saveTranslation).toHaveBeenCalledWith(ARTICLE_ID, {
        language: 'en',
        title: 'Arc flash',
        summary: 'A summary',
        seoTitle: null,
        seoDescription: null,
        content: { body: 'x' },
      });
    });

    it('normalises optional fields to null', async () => {
      repo.saveTranslation.mockResolvedValue(makeTranslation({ language: 'en' }));

      await service.upsertTranslation(ARTICLE_ID, WS_ID, { language: 'en', title: 'T' });

      expect(repo.saveTranslation).toHaveBeenCalledWith(
        ARTICLE_ID,
        expect.objectContaining({ summary: null, seoTitle: null, seoDescription: null }),
      );
    });

    it('rejects an unsupported locale', async () => {
      await expect(
        service.upsertTranslation(ARTICLE_ID, WS_ID, { language: 'de', title: 'T' }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.saveTranslation).not.toHaveBeenCalled();
    });
  });

  describe('deleteTranslation', () => {
    it('deletes a secondary translation', async () => {
      repo.findTranslationByLanguage.mockResolvedValue(makeTranslation({ language: 'en' }));

      await service.deleteTranslation(ARTICLE_ID, WS_ID, 'en');

      expect(repo.deleteTranslation).toHaveBeenCalledWith(ARTICLE_ID, 'en');
    });

    it('refuses to delete the primary language of the article', async () => {
      knowledgeService.findOne.mockResolvedValue(makeEntity({ language: 'fa' }));

      await expect(service.deleteTranslation(ARTICLE_ID, WS_ID, 'fa')).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.deleteTranslation).not.toHaveBeenCalled();
    });

    it('throws NotFound when the translation does not exist', async () => {
      repo.findTranslationByLanguage.mockResolvedValue(null);

      await expect(service.deleteTranslation(ARTICLE_ID, WS_ID, 'en')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.deleteTranslation).not.toHaveBeenCalled();
    });
  });

  // ── Localization ───────────────────────────────────────────────────────────

  describe('getLocalized', () => {
    it('serves the exact requested translation', async () => {
      repo.findTranslations.mockResolvedValue([
        makeTranslation({ language: 'en', title: 'English title' }),
      ]);

      const view = await service.getLocalized(ARTICLE_ID, WS_ID, 'en');

      expect(view.resolvedLocale).toBe('en');
      expect(view.isFallback).toBe(false);
      expect(view.title).toBe('English title');
    });

    it('falls back to the root content when the translation is missing', async () => {
      knowledgeService.findOne.mockResolvedValue(
        makeEntity({ language: 'fa', content: { title: 'عنوان اصلی' } }),
      );
      repo.findTranslations.mockResolvedValue([]);

      const view = await service.getLocalized(ARTICLE_ID, WS_ID, 'en');

      expect(view.requestedLocale).toBe('en');
      expect(view.resolvedLocale).toBe('fa');
      expect(view.isFallback).toBe(true);
      expect(view.title).toBe('عنوان اصلی');
    });

    it('defaults to the default locale when none is requested', async () => {
      repo.findTranslations.mockResolvedValue([]);

      const view = await service.getLocalized(ARTICLE_ID, WS_ID);

      expect(view.requestedLocale).toBe('fa');
      expect(view.isFallback).toBe(false);
    });

    it('treats an unsupported locale as the default rather than failing', async () => {
      repo.findTranslations.mockResolvedValue([]);

      const view = await service.getLocalized(ARTICLE_ID, WS_ID, 'de');

      expect(view.requestedLocale).toBe('fa');
    });

    it('reports the root language plus translations as available locales', async () => {
      knowledgeService.findOne.mockResolvedValue(makeEntity({ language: 'fa' }));
      repo.findTranslations.mockResolvedValue([makeTranslation({ language: 'en' })]);

      const view = await service.getLocalized(ARTICLE_ID, WS_ID, 'fa');

      expect(view.availableLocales).toEqual(['en', 'fa']);
    });

    it('does not duplicate the root language in available locales', async () => {
      knowledgeService.findOne.mockResolvedValue(makeEntity({ language: 'fa' }));
      repo.findTranslations.mockResolvedValue([
        makeTranslation({ language: 'fa' }),
        makeTranslation({ language: 'en' }),
      ]);

      const view = await service.getLocalized(ARTICLE_ID, WS_ID, 'fa');

      expect(view.availableLocales).toEqual(['en', 'fa']);
    });

    it('prefers a stored translation over the root row for the root language', async () => {
      knowledgeService.findOne.mockResolvedValue(
        makeEntity({ language: 'fa', content: { title: 'root' } }),
      );
      repo.findTranslations.mockResolvedValue([
        makeTranslation({ language: 'fa', title: 'translated' }),
      ]);

      const view = await service.getLocalized(ARTICLE_ID, WS_ID, 'fa');

      expect(view.title).toBe('translated');
    });

    it('exposes SEO fields from the translation', async () => {
      repo.findTranslations.mockResolvedValue([
        makeTranslation({ language: 'en', seoTitle: 'SEO', seoDescription: 'Desc' }),
      ]);

      const view = await service.getLocalized(ARTICLE_ID, WS_ID, 'en');

      expect(view.seoTitle).toBe('SEO');
      expect(view.seoDescription).toBe('Desc');
    });

    it('returns a null title when the root content has none', async () => {
      knowledgeService.findOne.mockResolvedValue(makeEntity({ language: 'fa', content: {} }));
      repo.findTranslations.mockResolvedValue([]);

      const view = await service.getLocalized(ARTICLE_ID, WS_ID, 'fa');

      expect(view.title).toBeNull();
    });
  });

  describe('getPublishedLocalizedBySlug', () => {
    it('resolves a published article without a workspace', async () => {
      knowledgeService.findPublishedBySlug.mockResolvedValue(makeEntity({ language: 'fa' }));
      repo.findTranslations.mockResolvedValue([
        makeTranslation({ language: 'en', title: 'Public EN' }),
      ]);

      const view = await service.getPublishedLocalizedBySlug('test-article', 'en');

      expect(knowledgeService.findPublishedBySlug).toHaveBeenCalledWith('test-article');
      expect(view.title).toBe('Public EN');
      expect(knowledgeService.findOne).not.toHaveBeenCalled();
    });
  });

  // ── Media ──────────────────────────────────────────────────────────────────

  describe('media', () => {
    it('lists media for the article', async () => {
      const rows = [makeMedia()];
      repo.findMedia.mockResolvedValue(rows);

      await expect(service.listMedia(ARTICLE_ID, WS_ID)).resolves.toBe(rows);
    });

    it('attaches new media', async () => {
      const created = makeMedia();
      repo.createMedia.mockResolvedValue(created);

      const result = await service.addMedia(ARTICLE_ID, WS_ID, {
        type: 'image',
        url: 'https://cdn.example.com/a.png',
      });

      expect(result).toBe(created);
      expect(repo.createMedia).toHaveBeenCalledWith(ARTICLE_ID, {
        type: 'image',
        url: 'https://cdn.example.com/a.png',
      });
    });

    it('updates media that belongs to the article', async () => {
      repo.findMediaById.mockResolvedValue(makeMedia());
      const updated = makeMedia({ captionFa: 'شرح' });
      repo.updateMedia.mockResolvedValue(updated);

      const result = await service.updateMedia(ARTICLE_ID, 'media-1', WS_ID, {
        captionFa: 'شرح',
      });

      expect(result).toBe(updated);
    });

    it('rejects media belonging to another article', async () => {
      repo.findMediaById.mockResolvedValue(makeMedia({ knowledgeId: 'other-article' }));

      await expect(
        service.updateMedia(ARTICLE_ID, 'media-1', WS_ID, { captionFa: 'x' }),
      ).rejects.toThrow(NotFoundException);
      expect(repo.updateMedia).not.toHaveBeenCalled();
    });

    it('throws NotFound when the media does not exist', async () => {
      repo.findMediaById.mockResolvedValue(null);

      await expect(service.removeMedia(ARTICLE_ID, 'missing', WS_ID)).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.deleteMedia).not.toHaveBeenCalled();
    });

    it('detaches media', async () => {
      repo.findMediaById.mockResolvedValue(makeMedia());

      await service.removeMedia(ARTICLE_ID, 'media-1', WS_ID);

      expect(repo.deleteMedia).toHaveBeenCalledWith('media-1');
    });
  });

  // ── Formulas ───────────────────────────────────────────────────────────────

  describe('formulas', () => {
    it('lists formulas', async () => {
      const rows = [makeFormula()];
      repo.findFormulas.mockResolvedValue(rows);

      await expect(service.listFormulas(ARTICLE_ID, WS_ID)).resolves.toBe(rows);
    });

    it('adds a formula and reindexes search text', async () => {
      repo.createFormula.mockResolvedValue(makeFormula());
      repo.findFormulas.mockResolvedValue([makeFormula({ latex: 'I = P / U' })]);

      await service.addFormula(ARTICLE_ID, WS_ID, { latex: 'I = P / U' });

      expect(knowledgeService.updateSearchText).toHaveBeenCalledWith(
        ARTICLE_ID,
        WS_ID,
        expect.stringContaining('I = P / U'),
      );
    });

    it('includes the article title in the reindexed search text', async () => {
      knowledgeService.findOne.mockResolvedValue(
        makeEntity({ content: { title: 'قوس الکتریکی' } }),
      );
      repo.createFormula.mockResolvedValue(makeFormula());
      repo.findFormulas.mockResolvedValue([makeFormula()]);

      await service.addFormula(ARTICLE_ID, WS_ID, { latex: 'I = P / U' });

      expect(knowledgeService.updateSearchText).toHaveBeenCalledWith(
        ARTICLE_ID,
        WS_ID,
        expect.stringContaining('قوس الکتریکی'),
      );
    });

    it('rejects a formula from another article', async () => {
      repo.findFormulaById.mockResolvedValue(makeFormula({ knowledgeId: 'other' }));

      await expect(
        service.updateFormula(ARTICLE_ID, 'formula-1', WS_ID, { latex: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('reindexes after deleting a formula', async () => {
      repo.findFormulaById.mockResolvedValue(makeFormula());

      await service.removeFormula(ARTICLE_ID, 'formula-1', WS_ID);

      expect(repo.deleteFormula).toHaveBeenCalledWith('formula-1');
      expect(knowledgeService.updateSearchText).toHaveBeenCalled();
    });
  });

  // ── Examples ───────────────────────────────────────────────────────────────

  describe('examples', () => {
    it('adds an example and indexes its title', async () => {
      repo.createExample.mockResolvedValue(makeExample());
      repo.findExamples.mockResolvedValue([makeExample({ titleFa: 'محاسبه جریان' })]);

      await service.addExample(ARTICLE_ID, WS_ID, { titleFa: 'محاسبه جریان' });

      expect(knowledgeService.updateSearchText).toHaveBeenCalledWith(
        ARTICLE_ID,
        WS_ID,
        expect.stringContaining('محاسبه جریان'),
      );
    });

    it('rejects an example from another article', async () => {
      repo.findExampleById.mockResolvedValue(makeExample({ knowledgeId: 'other' }));

      await expect(
        service.updateExample(ARTICLE_ID, 'example-1', WS_ID, { titleFa: 'x' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('deletes an example that belongs to the article', async () => {
      repo.findExampleById.mockResolvedValue(makeExample());

      await service.removeExample(ARTICLE_ID, 'example-1', WS_ID);

      expect(repo.deleteExample).toHaveBeenCalledWith('example-1');
    });

    it('writes null search text when nothing indexable remains', async () => {
      knowledgeService.findOne.mockResolvedValue(makeEntity({ content: {} }));
      repo.findExampleById.mockResolvedValue(makeExample());
      repo.findFormulas.mockResolvedValue([]);
      repo.findExamples.mockResolvedValue([]);

      await service.removeExample(ARTICLE_ID, 'example-1', WS_ID);

      expect(knowledgeService.updateSearchText).toHaveBeenCalledWith(ARTICLE_ID, WS_ID, null);
    });
  });

  // ── Comment reactions ──────────────────────────────────────────────────────

  describe('likeComment', () => {
    it('adds the user to likedBy and bumps the count', async () => {
      repo.findCommentReaction.mockResolvedValue(makeReaction());
      repo.saveCommentReaction.mockResolvedValue(makeReaction({ likes: 1, likedBy: [USER_ID] }));

      const result = await service.likeComment(ARTICLE_ID, COMMENT_ID, WS_ID, USER_ID);

      expect(repo.saveCommentReaction).toHaveBeenCalledWith(COMMENT_ID, 1, [USER_ID]);
      expect(result.likes).toBe(1);
    });

    it('is idempotent for a repeated like', async () => {
      const existing = makeReaction({ likes: 1, likedBy: [USER_ID] });
      repo.findCommentReaction.mockResolvedValue(existing);

      const result = await service.likeComment(ARTICLE_ID, COMMENT_ID, WS_ID, USER_ID);

      expect(result).toBe(existing);
      expect(repo.saveCommentReaction).not.toHaveBeenCalled();
    });

    it('keeps likes from other users', async () => {
      repo.findCommentReaction.mockResolvedValue(
        makeReaction({ likes: 1, likedBy: [OTHER_USER_ID] }),
      );
      repo.saveCommentReaction.mockResolvedValue(makeReaction());

      await service.likeComment(ARTICLE_ID, COMMENT_ID, WS_ID, USER_ID);

      expect(repo.saveCommentReaction).toHaveBeenCalledWith(COMMENT_ID, 2, [
        OTHER_USER_ID,
        USER_ID,
      ]);
    });

    it('rejects a comment from another article', async () => {
      repo.findCommentReaction.mockResolvedValue(makeReaction({ knowledgeId: 'other' }));

      await expect(service.likeComment(ARTICLE_ID, COMMENT_ID, WS_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects a soft-deleted comment', async () => {
      repo.findCommentReaction.mockResolvedValue(makeReaction({ deletedAt: new Date() }));

      await expect(service.likeComment(ARTICLE_ID, COMMENT_ID, WS_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects a missing comment', async () => {
      repo.findCommentReaction.mockResolvedValue(null);

      await expect(service.likeComment(ARTICLE_ID, COMMENT_ID, WS_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('unlikeComment', () => {
    it('removes the user from likedBy', async () => {
      repo.findCommentReaction.mockResolvedValue(
        makeReaction({ likes: 2, likedBy: [USER_ID, OTHER_USER_ID] }),
      );
      repo.saveCommentReaction.mockResolvedValue(makeReaction());

      await service.unlikeComment(ARTICLE_ID, COMMENT_ID, WS_ID, USER_ID);

      expect(repo.saveCommentReaction).toHaveBeenCalledWith(COMMENT_ID, 1, [OTHER_USER_ID]);
    });

    it('is idempotent when the user never liked the comment', async () => {
      const existing = makeReaction({ likes: 1, likedBy: [OTHER_USER_ID] });
      repo.findCommentReaction.mockResolvedValue(existing);

      const result = await service.unlikeComment(ARTICLE_ID, COMMENT_ID, WS_ID, USER_ID);

      expect(result).toBe(existing);
      expect(repo.saveCommentReaction).not.toHaveBeenCalled();
    });
  });
});
