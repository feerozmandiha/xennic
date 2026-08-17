import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type {
  IKnowledgeContentRepository,
  KnowledgeTranslationRecord,
  SaveTranslationData,
  KnowledgeMediaRecord,
  CreateMediaData,
  UpdateMediaData,
  KnowledgeFormulaRecord,
  CreateFormulaData,
  UpdateFormulaData,
  KnowledgeExampleRecord,
  CreateExampleData,
  UpdateExampleData,
  CommentReactionRecord,
} from '../../domain/interfaces/knowledge-content.repository.interface.js';

/**
 * Persistence for the child collections of the Knowledge aggregate.
 *
 * Every row is reachable only through its `knowledge_id`; the application layer
 * resolves and authorises that root (including `workspace_id` isolation) before
 * delegating here, so these queries intentionally key on the knowledge id.
 */
@Injectable()
export class KnowledgeContentRepository implements IKnowledgeContentRepository {
  // ── Translations ───────────────────────────────────────────────────────────

  async findTranslations(knowledgeId: string): Promise<KnowledgeTranslationRecord[]> {
    const rows = await prisma.knowledge_translations.findMany({
      where: { knowledge_id: knowledgeId },
      orderBy: { language: 'asc' },
    });
    return rows.map((r) => this._toTranslation(r));
  }

  async findTranslationByLanguage(
    knowledgeId: string,
    language: string,
  ): Promise<KnowledgeTranslationRecord | null> {
    const row = await prisma.knowledge_translations.findUnique({
      where: { knowledge_id_language: { knowledge_id: knowledgeId, language } },
    });
    return row ? this._toTranslation(row) : null;
  }

  async saveTranslation(
    knowledgeId: string,
    data: SaveTranslationData,
  ): Promise<KnowledgeTranslationRecord> {
    const row = await prisma.knowledge_translations.upsert({
      where: { knowledge_id_language: { knowledge_id: knowledgeId, language: data.language } },
      update: {
        title: data.title,
        summary: data.summary ?? null,
        seo_title: data.seoTitle ?? null,
        seo_description: data.seoDescription ?? null,
        ...(data.content !== undefined ? { content: data.content as any } : {}),
      },
      create: {
        id: crypto.randomUUID(),
        knowledge_id: knowledgeId,
        language: data.language,
        title: data.title,
        summary: data.summary ?? null,
        seo_title: data.seoTitle ?? null,
        seo_description: data.seoDescription ?? null,
        content: (data.content ?? {}) as any,
      },
    });
    return this._toTranslation(row);
  }

  async deleteTranslation(knowledgeId: string, language: string): Promise<void> {
    await prisma.knowledge_translations.delete({
      where: { knowledge_id_language: { knowledge_id: knowledgeId, language } },
    });
  }

  // ── Media ──────────────────────────────────────────────────────────────────

  async findMedia(knowledgeId: string): Promise<KnowledgeMediaRecord[]> {
    const rows = await prisma.knowledge_media.findMany({
      where: { knowledge_id: knowledgeId },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
    });
    return rows.map((r) => this._toMedia(r));
  }

  async findMediaById(id: string): Promise<KnowledgeMediaRecord | null> {
    const row = await prisma.knowledge_media.findUnique({ where: { id } });
    return row ? this._toMedia(row) : null;
  }

  async createMedia(knowledgeId: string, data: CreateMediaData): Promise<KnowledgeMediaRecord> {
    const row = await prisma.knowledge_media.create({
      data: {
        id: crypto.randomUUID(),
        knowledge_id: knowledgeId,
        type: data.type,
        url: data.url,
        caption_fa: data.captionFa ?? null,
        caption_en: data.captionEn ?? null,
        alt_fa: data.altFa ?? null,
        alt_en: data.altEn ?? null,
        description: data.description ?? null,
        license: data.license ?? null,
        source: data.source ?? null,
        file_size: data.fileSize ?? null,
        mime_type: data.mimeType ?? null,
        sort_order: data.sortOrder ?? 0,
      },
    });
    return this._toMedia(row);
  }

  async updateMedia(id: string, data: UpdateMediaData): Promise<KnowledgeMediaRecord> {
    const row = await prisma.knowledge_media.update({
      where: { id },
      data: {
        ...(data.type !== undefined ? { type: data.type } : {}),
        ...(data.url !== undefined ? { url: data.url } : {}),
        ...(data.captionFa !== undefined ? { caption_fa: data.captionFa } : {}),
        ...(data.captionEn !== undefined ? { caption_en: data.captionEn } : {}),
        ...(data.altFa !== undefined ? { alt_fa: data.altFa } : {}),
        ...(data.altEn !== undefined ? { alt_en: data.altEn } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.license !== undefined ? { license: data.license } : {}),
        ...(data.source !== undefined ? { source: data.source } : {}),
        ...(data.fileSize !== undefined ? { file_size: data.fileSize } : {}),
        ...(data.mimeType !== undefined ? { mime_type: data.mimeType } : {}),
        ...(data.sortOrder !== undefined ? { sort_order: data.sortOrder } : {}),
      },
    });
    return this._toMedia(row);
  }

  async deleteMedia(id: string): Promise<void> {
    await prisma.knowledge_media.delete({ where: { id } });
  }

  // ── Formulas ───────────────────────────────────────────────────────────────

  async findFormulas(knowledgeId: string): Promise<KnowledgeFormulaRecord[]> {
    const rows = await prisma.knowledge_formulas.findMany({
      where: { knowledge_id: knowledgeId },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
    });
    return rows.map((r) => this._toFormula(r));
  }

  async findFormulaById(id: string): Promise<KnowledgeFormulaRecord | null> {
    const row = await prisma.knowledge_formulas.findUnique({ where: { id } });
    return row ? this._toFormula(row) : null;
  }

  async createFormula(
    knowledgeId: string,
    data: CreateFormulaData,
  ): Promise<KnowledgeFormulaRecord> {
    const row = await prisma.knowledge_formulas.create({
      data: {
        id: crypto.randomUUID(),
        knowledge_id: knowledgeId,
        latex: data.latex,
        mathml: data.mathml ?? null,
        description_fa: data.descriptionFa ?? null,
        description_en: data.descriptionEn ?? null,
        variables: (data.variables ?? []) as any,
        calculator_type: data.calculatorType ?? null,
        sort_order: data.sortOrder ?? 0,
      },
    });
    return this._toFormula(row);
  }

  async updateFormula(id: string, data: UpdateFormulaData): Promise<KnowledgeFormulaRecord> {
    const row = await prisma.knowledge_formulas.update({
      where: { id },
      data: {
        ...(data.latex !== undefined ? { latex: data.latex } : {}),
        ...(data.mathml !== undefined ? { mathml: data.mathml } : {}),
        ...(data.descriptionFa !== undefined ? { description_fa: data.descriptionFa } : {}),
        ...(data.descriptionEn !== undefined ? { description_en: data.descriptionEn } : {}),
        ...(data.variables !== undefined ? { variables: data.variables as any } : {}),
        ...(data.calculatorType !== undefined ? { calculator_type: data.calculatorType } : {}),
        ...(data.sortOrder !== undefined ? { sort_order: data.sortOrder } : {}),
      },
    });
    return this._toFormula(row);
  }

  async deleteFormula(id: string): Promise<void> {
    await prisma.knowledge_formulas.delete({ where: { id } });
  }

  // ── Examples ───────────────────────────────────────────────────────────────

  async findExamples(knowledgeId: string): Promise<KnowledgeExampleRecord[]> {
    const rows = await prisma.knowledge_examples.findMany({
      where: { knowledge_id: knowledgeId },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
    });
    return rows.map((r) => this._toExample(r));
  }

  async findExampleById(id: string): Promise<KnowledgeExampleRecord | null> {
    const row = await prisma.knowledge_examples.findUnique({ where: { id } });
    return row ? this._toExample(row) : null;
  }

  async createExample(
    knowledgeId: string,
    data: CreateExampleData,
  ): Promise<KnowledgeExampleRecord> {
    const row = await prisma.knowledge_examples.create({
      data: {
        id: crypto.randomUUID(),
        knowledge_id: knowledgeId,
        title_fa: data.titleFa,
        title_en: data.titleEn ?? null,
        difficulty: data.difficulty ?? 'basic',
        steps: (data.steps ?? []) as any,
        answer: (data.answer ?? undefined) as any,
        calculator_type: data.calculatorType ?? null,
        sort_order: data.sortOrder ?? 0,
      },
    });
    return this._toExample(row);
  }

  async updateExample(id: string, data: UpdateExampleData): Promise<KnowledgeExampleRecord> {
    const row = await prisma.knowledge_examples.update({
      where: { id },
      data: {
        ...(data.titleFa !== undefined ? { title_fa: data.titleFa } : {}),
        ...(data.titleEn !== undefined ? { title_en: data.titleEn } : {}),
        ...(data.difficulty !== undefined ? { difficulty: data.difficulty } : {}),
        ...(data.steps !== undefined ? { steps: data.steps as any } : {}),
        ...(data.answer !== undefined ? { answer: data.answer as any } : {}),
        ...(data.calculatorType !== undefined ? { calculator_type: data.calculatorType } : {}),
        ...(data.sortOrder !== undefined ? { sort_order: data.sortOrder } : {}),
      },
    });
    return this._toExample(row);
  }

  async deleteExample(id: string): Promise<void> {
    await prisma.knowledge_examples.delete({ where: { id } });
  }

  // ── Comment reactions ──────────────────────────────────────────────────────

  async findCommentReaction(commentId: string): Promise<CommentReactionRecord | null> {
    const row = await prisma.knowledge_comments.findUnique({ where: { id: commentId } });
    return row ? this._toReaction(row) : null;
  }

  async saveCommentReaction(
    commentId: string,
    likes: number,
    likedBy: string[],
  ): Promise<CommentReactionRecord> {
    const row = await prisma.knowledge_comments.update({
      where: { id: commentId },
      data: { likes, liked_by: likedBy as any },
    });
    return this._toReaction(row);
  }

  // ── Mappers ────────────────────────────────────────────────────────────────

  private _toTranslation(row: any): KnowledgeTranslationRecord {
    return {
      id: row.id,
      knowledgeId: row.knowledge_id,
      language: row.language,
      title: row.title,
      summary: row.summary ?? null,
      seoTitle: row.seo_title ?? null,
      seoDescription: row.seo_description ?? null,
      content: (row.content as Record<string, unknown>) ?? {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  private _toMedia(row: any): KnowledgeMediaRecord {
    return {
      id: row.id,
      knowledgeId: row.knowledge_id,
      type: row.type,
      url: row.url,
      captionFa: row.caption_fa ?? null,
      captionEn: row.caption_en ?? null,
      altFa: row.alt_fa ?? null,
      altEn: row.alt_en ?? null,
      description: row.description ?? null,
      license: row.license ?? null,
      source: row.source ?? null,
      fileSize: row.file_size ?? null,
      mimeType: row.mime_type ?? null,
      sortOrder: row.sort_order ?? 0,
      createdAt: row.created_at,
    };
  }

  private _toFormula(row: any): KnowledgeFormulaRecord {
    return {
      id: row.id,
      knowledgeId: row.knowledge_id,
      latex: row.latex,
      mathml: row.mathml ?? null,
      descriptionFa: row.description_fa ?? null,
      descriptionEn: row.description_en ?? null,
      variables: Array.isArray(row.variables) ? (row.variables as unknown[]) : [],
      calculatorType: row.calculator_type ?? null,
      sortOrder: row.sort_order ?? 0,
      createdAt: row.created_at,
    };
  }

  private _toExample(row: any): KnowledgeExampleRecord {
    return {
      id: row.id,
      knowledgeId: row.knowledge_id,
      titleFa: row.title_fa,
      titleEn: row.title_en ?? null,
      difficulty: row.difficulty,
      steps: Array.isArray(row.steps) ? (row.steps as unknown[]) : [],
      answer: (row.answer as Record<string, unknown>) ?? null,
      calculatorType: row.calculator_type ?? null,
      sortOrder: row.sort_order ?? 0,
      createdAt: row.created_at,
    };
  }

  private _toReaction(row: any): CommentReactionRecord {
    return {
      id: row.id,
      knowledgeId: row.knowledge_id,
      likes: row.likes ?? 0,
      likedBy: Array.isArray(row.liked_by) ? (row.liked_by as string[]) : [],
      deletedAt: row.deleted_at ?? null,
    };
  }
}
