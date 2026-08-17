import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IKnowledgeContentRepository } from '../../domain/interfaces/knowledge-content.repository.interface.js';
import type {
  KnowledgeTranslationRecord,
  KnowledgeMediaRecord,
  KnowledgeFormulaRecord,
  KnowledgeExampleRecord,
  CommentReactionRecord,
  CreateMediaData,
  UpdateMediaData,
  CreateFormulaData,
  UpdateFormulaData,
  CreateExampleData,
  UpdateExampleData,
} from '../../domain/interfaces/knowledge-content.repository.interface.js';
import { KnowledgeLocale } from '../../domain/value-objects/knowledge-locale.vo.js';
import { KnowledgeService } from './knowledge.service.js';
import { extractKnowledgeText } from '../utils/extract-text.js';
import type {
  UpsertTranslationDto,
  CreateMediaDto,
  UpdateMediaDto,
  CreateFormulaDto,
  UpdateFormulaDto,
  CreateExampleDto,
  UpdateExampleDto,
} from '../../presentation/dtos/knowledge-content.dto.js';

export interface LocalizedKnowledgeView {
  id: string;
  slug: string;
  requestedLocale: string;
  resolvedLocale: string;
  isFallback: boolean;
  title: string | null;
  summary: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  content: Record<string, unknown>;
  availableLocales: string[];
}

/**
 * Manages the rich-content collections that hang off a knowledge article:
 * translations, media, formulas, worked examples and comment reactions.
 *
 * Every mutation first resolves the owning article through `KnowledgeService`,
 * which enforces workspace isolation and soft-delete semantics, and then checks
 * that the child row actually belongs to that article before touching it.
 */
@Injectable()
export class KnowledgeContentService {
  constructor(
    @Inject('IKnowledgeContentRepository')
    private readonly contentRepository: IKnowledgeContentRepository,
    private readonly knowledgeService: KnowledgeService,
  ) {}

  // ── Translations ───────────────────────────────────────────────────────────

  async listTranslations(id: string, workspaceId: string): Promise<KnowledgeTranslationRecord[]> {
    await this.knowledgeService.findOne(id, workspaceId);
    return this.contentRepository.findTranslations(id);
  }

  async getTranslation(
    id: string,
    workspaceId: string,
    language: string,
  ): Promise<KnowledgeTranslationRecord> {
    await this.knowledgeService.findOne(id, workspaceId);
    const locale = this._parseLocale(language);
    const record = await this.contentRepository.findTranslationByLanguage(id, locale.value);
    if (!record) {
      throw new NotFoundException(`Translation "${locale.value}" not found for this article`);
    }
    return record;
  }

  async upsertTranslation(
    id: string,
    workspaceId: string,
    dto: UpsertTranslationDto,
  ): Promise<KnowledgeTranslationRecord> {
    await this.knowledgeService.findOne(id, workspaceId);
    const locale = this._parseLocale(dto.language);

    return this.contentRepository.saveTranslation(id, {
      language: locale.value,
      title: dto.title,
      summary: dto.summary ?? null,
      seoTitle: dto.seoTitle ?? null,
      seoDescription: dto.seoDescription ?? null,
      content: dto.content,
    });
  }

  async deleteTranslation(id: string, workspaceId: string, language: string): Promise<void> {
    const entity = await this.knowledgeService.findOne(id, workspaceId);
    const locale = this._parseLocale(language);

    if (entity.language === locale.value) {
      throw new BadRequestException(
        `Cannot delete "${locale.value}" — it is the primary language of this article`,
      );
    }

    const existing = await this.contentRepository.findTranslationByLanguage(id, locale.value);
    if (!existing) {
      throw new NotFoundException(`Translation "${locale.value}" not found for this article`);
    }

    await this.contentRepository.deleteTranslation(id, locale.value);
  }

  /**
   * Resolves an article in the requested locale, falling back through
   * {@link KnowledgeLocale.fallbackChain} when the translation is missing.
   */
  async getLocalized(
    id: string,
    workspaceId: string,
    language?: string,
  ): Promise<LocalizedKnowledgeView> {
    const entity = await this.knowledgeService.findOne(id, workspaceId);
    const translations = await this.contentRepository.findTranslations(id);
    return this._buildLocalizedView(
      { id: entity.id, slug: entity.slug, language: entity.language, content: entity.content },
      translations,
      language,
    );
  }

  /** Public (unauthenticated) variant used by the published-article endpoints. */
  async getPublishedLocalizedBySlug(
    slug: string,
    language?: string,
  ): Promise<LocalizedKnowledgeView> {
    const entity = await this.knowledgeService.findPublishedBySlug(slug);
    const translations = await this.contentRepository.findTranslations(entity.id);
    return this._buildLocalizedView(
      { id: entity.id, slug: entity.slug, language: entity.language, content: entity.content },
      translations,
      language,
    );
  }

  // ── Media ──────────────────────────────────────────────────────────────────

  async listMedia(id: string, workspaceId: string): Promise<KnowledgeMediaRecord[]> {
    await this.knowledgeService.findOne(id, workspaceId);
    return this.contentRepository.findMedia(id);
  }

  async addMedia(
    id: string,
    workspaceId: string,
    dto: CreateMediaDto,
  ): Promise<KnowledgeMediaRecord> {
    await this.knowledgeService.findOne(id, workspaceId);
    return this.contentRepository.createMedia(id, dto as CreateMediaData);
  }

  async updateMedia(
    id: string,
    mediaId: string,
    workspaceId: string,
    dto: UpdateMediaDto,
  ): Promise<KnowledgeMediaRecord> {
    await this.knowledgeService.findOne(id, workspaceId);
    const existing = await this.contentRepository.findMediaById(mediaId);
    this._assertOwnedBy(existing, id, 'Media');
    return this.contentRepository.updateMedia(mediaId, dto as UpdateMediaData);
  }

  async removeMedia(id: string, mediaId: string, workspaceId: string): Promise<void> {
    await this.knowledgeService.findOne(id, workspaceId);
    const existing = await this.contentRepository.findMediaById(mediaId);
    this._assertOwnedBy(existing, id, 'Media');
    await this.contentRepository.deleteMedia(mediaId);
  }

  // ── Formulas ───────────────────────────────────────────────────────────────

  async listFormulas(id: string, workspaceId: string): Promise<KnowledgeFormulaRecord[]> {
    await this.knowledgeService.findOne(id, workspaceId);
    return this.contentRepository.findFormulas(id);
  }

  async addFormula(
    id: string,
    workspaceId: string,
    dto: CreateFormulaDto,
  ): Promise<KnowledgeFormulaRecord> {
    await this.knowledgeService.findOne(id, workspaceId);
    const created = await this.contentRepository.createFormula(id, dto as CreateFormulaData);
    await this._reindexSearchText(id, workspaceId);
    return created;
  }

  async updateFormula(
    id: string,
    formulaId: string,
    workspaceId: string,
    dto: UpdateFormulaDto,
  ): Promise<KnowledgeFormulaRecord> {
    await this.knowledgeService.findOne(id, workspaceId);
    const existing = await this.contentRepository.findFormulaById(formulaId);
    this._assertOwnedBy(existing, id, 'Formula');
    const updated = await this.contentRepository.updateFormula(formulaId, dto as UpdateFormulaData);
    await this._reindexSearchText(id, workspaceId);
    return updated;
  }

  async removeFormula(id: string, formulaId: string, workspaceId: string): Promise<void> {
    await this.knowledgeService.findOne(id, workspaceId);
    const existing = await this.contentRepository.findFormulaById(formulaId);
    this._assertOwnedBy(existing, id, 'Formula');
    await this.contentRepository.deleteFormula(formulaId);
    await this._reindexSearchText(id, workspaceId);
  }

  // ── Examples ───────────────────────────────────────────────────────────────

  async listExamples(id: string, workspaceId: string): Promise<KnowledgeExampleRecord[]> {
    await this.knowledgeService.findOne(id, workspaceId);
    return this.contentRepository.findExamples(id);
  }

  async addExample(
    id: string,
    workspaceId: string,
    dto: CreateExampleDto,
  ): Promise<KnowledgeExampleRecord> {
    await this.knowledgeService.findOne(id, workspaceId);
    const created = await this.contentRepository.createExample(id, dto as CreateExampleData);
    await this._reindexSearchText(id, workspaceId);
    return created;
  }

  async updateExample(
    id: string,
    exampleId: string,
    workspaceId: string,
    dto: UpdateExampleDto,
  ): Promise<KnowledgeExampleRecord> {
    await this.knowledgeService.findOne(id, workspaceId);
    const existing = await this.contentRepository.findExampleById(exampleId);
    this._assertOwnedBy(existing, id, 'Example');
    const updated = await this.contentRepository.updateExample(exampleId, dto as UpdateExampleData);
    await this._reindexSearchText(id, workspaceId);
    return updated;
  }

  async removeExample(id: string, exampleId: string, workspaceId: string): Promise<void> {
    await this.knowledgeService.findOne(id, workspaceId);
    const existing = await this.contentRepository.findExampleById(exampleId);
    this._assertOwnedBy(existing, id, 'Example');
    await this.contentRepository.deleteExample(exampleId);
    await this._reindexSearchText(id, workspaceId);
  }

  // ── Comment reactions ──────────────────────────────────────────────────────

  /** Idempotent like — liking twice keeps the count at one per user. */
  async likeComment(
    id: string,
    commentId: string,
    workspaceId: string,
    userId: string,
  ): Promise<CommentReactionRecord> {
    const reaction = await this._loadComment(id, commentId, workspaceId);
    if (reaction.likedBy.includes(userId)) return reaction;

    const likedBy = [...reaction.likedBy, userId];
    return this.contentRepository.saveCommentReaction(commentId, likedBy.length, likedBy);
  }

  /** Idempotent unlike — removing a like that was never given is a no-op. */
  async unlikeComment(
    id: string,
    commentId: string,
    workspaceId: string,
    userId: string,
  ): Promise<CommentReactionRecord> {
    const reaction = await this._loadComment(id, commentId, workspaceId);
    if (!reaction.likedBy.includes(userId)) return reaction;

    const likedBy = reaction.likedBy.filter((u) => u !== userId);
    return this.contentRepository.saveCommentReaction(commentId, likedBy.length, likedBy);
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private _parseLocale(language: string): KnowledgeLocale {
    try {
      return KnowledgeLocale.create(language);
    } catch (error) {
      throw new BadRequestException((error as Error).message);
    }
  }

  private _assertOwnedBy(
    record: { knowledgeId: string } | null,
    knowledgeId: string,
    label: string,
  ): void {
    if (!record || record.knowledgeId !== knowledgeId) {
      throw new NotFoundException(`${label} not found for this article`);
    }
  }

  private async _loadComment(
    id: string,
    commentId: string,
    workspaceId: string,
  ): Promise<CommentReactionRecord> {
    await this.knowledgeService.findOne(id, workspaceId);
    const reaction = await this.contentRepository.findCommentReaction(commentId);
    if (!reaction || reaction.knowledgeId !== id || reaction.deletedAt) {
      throw new NotFoundException('Comment not found');
    }
    return reaction;
  }

  private _buildLocalizedView(
    root: { id: string; slug: string; language: string; content: Record<string, unknown> },
    translations: KnowledgeTranslationRecord[],
    requested?: string,
  ): LocalizedKnowledgeView {
    const locale = KnowledgeLocale.createOrDefault(requested);
    const byLanguage = new Map(translations.map((t) => [t.language, t]));

    // The root row itself counts as an available locale.
    const availableLocales = [
      ...new Set([root.language, ...translations.map((t) => t.language)]),
    ].sort();

    for (const candidate of locale.fallbackChain()) {
      const translation = byLanguage.get(candidate);
      if (translation) {
        return {
          id: root.id,
          slug: root.slug,
          requestedLocale: locale.value,
          resolvedLocale: candidate,
          isFallback: candidate !== locale.value,
          title: translation.title,
          summary: translation.summary,
          seoTitle: translation.seoTitle,
          seoDescription: translation.seoDescription,
          content: translation.content,
          availableLocales,
        };
      }

      if (candidate === root.language) {
        return this._rootView(root, locale.value, candidate, availableLocales);
      }
    }

    // Nothing in the chain matched — serve the canonical root content.
    return this._rootView(root, locale.value, root.language, availableLocales);
  }

  private _rootView(
    root: { id: string; slug: string; content: Record<string, unknown> },
    requestedLocale: string,
    resolvedLocale: string,
    availableLocales: string[],
  ): LocalizedKnowledgeView {
    const title = typeof root.content.title === 'string' ? root.content.title : null;
    const summary = typeof root.content.summary === 'string' ? root.content.summary : null;
    return {
      id: root.id,
      slug: root.slug,
      requestedLocale,
      resolvedLocale,
      isFallback: resolvedLocale !== requestedLocale,
      title,
      summary,
      seoTitle: null,
      seoDescription: null,
      content: root.content,
      availableLocales,
    };
  }

  /**
   * Formulas and examples are searchable content, so the article's `search_text`
   * is rebuilt whenever they change: base content text + every LaTeX expression
   * and example title currently attached to the article.
   */
  private async _reindexSearchText(id: string, workspaceId: string): Promise<void> {
    const entity = await this.knowledgeService.findOne(id, workspaceId);
    const [formulas, examples] = await Promise.all([
      this.contentRepository.findFormulas(id),
      this.contentRepository.findExamples(id),
    ]);

    const parts = [
      extractKnowledgeText(entity.content),
      ...formulas.flatMap((f) => [f.latex, f.descriptionFa ?? '', f.descriptionEn ?? '']),
      ...examples.flatMap((e) => [e.titleFa, e.titleEn ?? '']),
    ];

    const searchText = parts.join(' ').replace(/\s+/g, ' ').trim();
    await this.knowledgeService.updateSearchText(id, workspaceId, searchText || null);
  }
}
