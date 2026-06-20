import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IKnowledgeRepository } from '../../domain/interfaces/knowledge.repository.interface.js';
import { KnowledgeEntity } from '../../domain/entities/knowledge.entity.js';
import { extractKnowledgeText } from '../utils/extract-text.js';
import type { CreateKnowledgeDto, UpdateKnowledgeDto, KnowledgeSearchQueryDto, AddTaxonomyDto, CreateCommentDto, UpdateCommentDto } from '../../presentation/dtos/knowledge.dto.js';
import { KnowledgeVersionDto, CommentResponseDto, CreateWorkflowCommentDto, WorkflowResponseDto, KnowledgeAnalyticsDto, KnowledgeDashboardStatsDto, RelatedCalculationDto } from '../../presentation/dtos/knowledge.dto.js';

export interface PaginatedKnowledge {
  data: KnowledgeEntity[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

@Injectable()
export class KnowledgeService {
  private readonly logger = new Logger(KnowledgeService.name);

  constructor(
    @Inject('IKnowledgeRepository')
    private readonly knowledgeRepository: IKnowledgeRepository,
  ) {}

  // ── findAll ─────────────────────────────────────────────────────────────────

  async findAll(
    workspaceId: string,
    page = 1,
    limit = 20,
    status?: string,
  ): Promise<PaginatedKnowledge> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.knowledgeRepository.findAll(workspaceId, offset, limit, status),
      this.knowledgeRepository.count(workspaceId, status),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── findPublished (public, no workspace) ────────────────────────────────────

  async findPublished(
    page = 1,
    limit = 20,
    locale?: string,
  ): Promise<PaginatedKnowledge> {
    const offset = (page - 1) * limit;
    const where: any = {
      status: 'published',
      visibility: 'public',
      is_active: true,
    };
    if (locale) where.language = locale;

    const [data, total] = await Promise.all([
      prisma.knowledge.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { published_at: 'desc' },
      }),
      prisma.knowledge.count({ where }),
    ]);

    return {
      data: data.map((r) =>
        KnowledgeEntity.reconstitute({
          id: r.id,
          workspaceId: r.workspace_id,
          slug: r.slug,
          status: r.status,
          visibility: r.visibility,
          language: r.language,
          version: r.version,
          isActive: r.is_active,
          content: (r.content as Record<string, unknown>) ?? {},
          searchText: r.search_text ?? null,
          readingTime: r.reading_time ?? null,
          difficulty: r.difficulty ?? null,
          authorId: r.author_id ?? null,
          reviewerId: r.reviewer_id ?? null,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          publishedAt: r.published_at ?? null,
          reviewedAt: r.reviewed_at ?? null,
          archivedAt: r.archived_at ?? null,
        }),
      ),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findPublishedBySlug(slug: string): Promise<KnowledgeEntity> {
    const row = await prisma.knowledge.findFirst({
      where: { slug, status: 'published', visibility: 'public', is_active: true },
    });
    if (!row) throw new NotFoundException('Article not found');
    return KnowledgeEntity.reconstitute({
      id: row.id,
      workspaceId: row.workspace_id,
      slug: row.slug,
      status: row.status,
      visibility: row.visibility,
      language: row.language,
      version: row.version,
      isActive: row.is_active,
      content: (row.content as Record<string, unknown>) ?? {},
      searchText: row.search_text ?? null,
      readingTime: row.reading_time ?? null,
      difficulty: row.difficulty ?? null,
      authorId: row.author_id ?? null,
      reviewerId: row.reviewer_id ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      publishedAt: row.published_at ?? null,
      reviewedAt: row.reviewed_at ?? null,
      archivedAt: row.archived_at ?? null,
    });
  }

  // ── findOne ─────────────────────────────────────────────────────────────────

  async findOne(id: string, workspaceId: string): Promise<KnowledgeEntity> {
    const entity = await this.knowledgeRepository.findById(id);
    if (!entity || entity.isDeleted()) {
      throw new NotFoundException(`Knowledge article with ID "${id}" not found`);
    }
    if (entity.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied to this knowledge article');
    }
    return entity;
  }

  // ── findBySlug ──────────────────────────────────────────────────────────────

  async findBySlug(workspaceId: string, slug: string): Promise<KnowledgeEntity> {
    const entity = await this.knowledgeRepository.findBySlug(workspaceId, slug);
    if (!entity || entity.isDeleted()) {
      throw new NotFoundException(`Knowledge article with slug "${slug}" not found`);
    }
    return entity;
  }

  // ── create ──────────────────────────────────────────────────────────────────

  async create(
    dto: CreateKnowledgeDto,
    workspaceId: string,
    userId: string,
  ): Promise<KnowledgeEntity> {
    const entity = KnowledgeEntity.create({
      workspaceId,
      slug: dto.slug,
      content: dto.content,
      language: dto.language,
      visibility: dto.visibility,
      difficulty: dto.difficulty,
      authorId: userId,
    });

    if (dto.content) {
      entity.setSearchText(extractKnowledgeText(dto.content));
    }

    await this.knowledgeRepository.save(entity);

    if (dto.taxonomy?.length) {
      await this._saveTaxonomy(entity.id, dto.taxonomy);
    }

    return entity;
  }

  // ── update ──────────────────────────────────────────────────────────────────

  async update(
    id: string,
    workspaceId: string,
    dto: UpdateKnowledgeDto,
  ): Promise<KnowledgeEntity> {
    const entity = await this.findOne(id, workspaceId);
    entity.update({
      slug: dto.slug,
      content: dto.content,
      visibility: dto.visibility,
      difficulty: dto.difficulty,
      readingTime: dto.readingTime,
    });

    if (dto.content) {
      entity.setSearchText(extractKnowledgeText(dto.content));
    }

    await this.knowledgeRepository.save(entity);
    return entity;
  }

  // ── requestReview ───────────────────────────────────────────────────────────

  async requestReview(
    id: string,
    workspaceId: string,
    reviewerId: string,
  ): Promise<KnowledgeEntity> {
    const entity = await this.findOne(id, workspaceId);
    entity.requestReview(reviewerId);
    await this.knowledgeRepository.save(entity);
    return entity;
  }

  // ── publish ─────────────────────────────────────────────────────────────────

  async publish(id: string, workspaceId: string): Promise<KnowledgeEntity> {
    const entity = await this.findOne(id, workspaceId);
    entity.publish();

    // Snapshot current content as a version record
    await this._createVersionSnapshot(entity);

    await this.knowledgeRepository.save(entity);
    return entity;
  }

  // ── rejectReview ────────────────────────────────────────────────────────────

  async rejectReview(id: string, workspaceId: string): Promise<KnowledgeEntity> {
    const entity = await this.findOne(id, workspaceId);
    entity.rejectReview();
    await this.knowledgeRepository.save(entity);
    return entity;
  }

  // ── archive ─────────────────────────────────────────────────────────────────

  async archive(id: string, workspaceId: string): Promise<KnowledgeEntity> {
    const entity = await this.findOne(id, workspaceId);
    entity.archive();
    await this.knowledgeRepository.save(entity);
    return entity;
  }

  // ── restoreFromArchive ──────────────────────────────────────────────────────

  async restoreFromArchive(id: string, workspaceId: string): Promise<KnowledgeEntity> {
    const entity = await this.findOne(id, workspaceId);
    entity.restoreFromArchive();
    await this.knowledgeRepository.save(entity);
    return entity;
  }

  // ── softDelete ──────────────────────────────────────────────────────────────

  async remove(id: string, workspaceId: string): Promise<void> {
    const entity = await this.findOne(id, workspaceId);
    entity.softDelete();
    await this.knowledgeRepository.save(entity);
  }

  // ── search ──────────────────────────────────────────────────────────────────

  async search(
    workspaceId: string,
    query: KnowledgeSearchQueryDto,
  ): Promise<PaginatedKnowledge> {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit ? parseInt(query.limit, 10) : 20;
    const offset = (page - 1) * limit;

    const { data, total } = await this.knowledgeRepository.search(workspaceId, {
      query: query.q,
      status: query.status,
      visibility: query.visibility,
      language: query.language,
      difficulty: query.difficulty,
      taxonomyType: query.taxonomyType,
      taxonomyId: query.taxonomyId,
      offset,
      limit,
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Taxonomy Management ─────────────────────────────────────────────────────

  async addTaxonomy(
    id: string,
    workspaceId: string,
    dto: AddTaxonomyDto,
  ): Promise<void> {
    await this.findOne(id, workspaceId);

    const existing = await prisma.knowledge_taxonomy.findFirst({
      where: {
        knowledge_id: id,
        taxonomy_type: dto.taxonomyType,
        taxonomy_id: dto.taxonomyId,
      },
    });
    if (existing) {
      throw new ConflictException('Taxonomy assignment already exists');
    }

    await prisma.knowledge_taxonomy.create({
      data: {
        id: crypto.randomUUID(),
        knowledge_id: id,
        taxonomy_type: dto.taxonomyType,
        taxonomy_id: dto.taxonomyId,
      },
    });
  }

  async removeTaxonomy(
    id: string,
    workspaceId: string,
    taxonomyId: string,
  ): Promise<void> {
    await this.findOne(id, workspaceId);

    const row = await prisma.knowledge_taxonomy.findFirst({
      where: { knowledge_id: id, id: taxonomyId },
    });
    if (!row) throw new NotFoundException('Taxonomy assignment not found');

    await prisma.knowledge_taxonomy.delete({ where: { id: taxonomyId } });
  }

  async getTaxonomy(id: string, workspaceId: string): Promise<any[]> {
    await this.findOne(id, workspaceId);
    return prisma.knowledge_taxonomy.findMany({
      where: { knowledge_id: id },
    });
  }

  // ── Engineering Integration ─────────────────────────────────────────────────

  async findByCalculatorType(
    calculatorType: string,
    workspaceId: string,
  ): Promise<KnowledgeEntity[]> {
    const rows = await prisma.knowledge.findMany({
      where: {
        workspace_id: workspaceId,
        is_active: true,
        OR: [
          { formulas: { some: { calculator_type: calculatorType } } },
          { examples: { some: { calculator_type: calculatorType } } },
        ],
      },
    });
    return rows.map((r: any) => {
      const entity = KnowledgeEntity.reconstitute({
        id: r.id,
        workspaceId: r.workspace_id,
        slug: r.slug,
        status: r.status,
        visibility: r.visibility,
        language: r.language,
        version: r.version,
        isActive: r.is_active,
        content: typeof r.content === 'object' ? r.content : {},
        searchText: r.search_text ?? null,
        readingTime: r.reading_time ?? null,
        difficulty: r.difficulty ?? null,
        authorId: r.author_id ?? null,
        reviewerId: r.reviewer_id ?? null,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
        publishedAt: r.published_at ?? null,
        reviewedAt: r.reviewed_at ?? null,
        archivedAt: r.archived_at ?? null,
      });
      return entity;
    });
  }

  async getRelatedCalculations(
    id: string,
    workspaceId: string,
  ): Promise<RelatedCalculationDto[]> {
    const entity = await this.findOne(id, workspaceId);

    // Collect all calculator types referenced by formulas and examples
    const [formulas, examples] = await Promise.all([
      prisma.knowledge_formulas.findMany({
        where: { knowledge_id: entity.id, calculator_type: { not: null } },
        select: { calculator_type: true },
      }),
      prisma.knowledge_examples.findMany({
        where: { knowledge_id: entity.id, calculator_type: { not: null } },
        select: { calculator_type: true },
      }),
    ]);

    const calculatorTypes = [
      ...new Set([
        ...formulas.map((f: any) => f.calculator_type),
        ...examples.map((e: any) => e.calculator_type),
      ]),
    ].filter(Boolean) as string[];

    if (calculatorTypes.length === 0) return [];

    const rows = await prisma.calculations.findMany({
      where: {
        workspace_id: workspaceId,
        type: { in: calculatorTypes },
      },
      orderBy: { created_at: 'desc' },
      take: 20,
    });

    return rows.map((r: any) => RelatedCalculationDto.fromRow(r));
  }

  // ── Analytics ───────────────────────────────────────────────────────────────

  async recordView(id: string, workspaceId: string): Promise<void> {
    await this.findOne(id, workspaceId);
    const today = new Date().toISOString().slice(0, 10);
    const existing = await prisma.knowledge_analytics.findUnique({
      where: { knowledge_id: id },
    });
    const dailyStats = (existing?.daily_stats as Record<string, number>) ?? {};
    dailyStats[today] = (dailyStats[today] ?? 0) + 1;

    await prisma.knowledge_analytics.upsert({
      where: { knowledge_id: id },
      update: {
        views: { increment: 1 },
        last_viewed_at: new Date(),
        daily_stats: dailyStats as any,
      },
      create: {
        id: crypto.randomUUID(),
        knowledge_id: id,
        views: 1,
        last_viewed_at: new Date(),
        daily_stats: dailyStats as any,
      },
    });
  }

  async getAnalytics(id: string, workspaceId: string): Promise<KnowledgeAnalyticsDto | null> {
    await this.findOne(id, workspaceId);
    const row = await prisma.knowledge_analytics.findUnique({
      where: { knowledge_id: id },
    });
    if (!row) return null;
    return KnowledgeAnalyticsDto.fromPrisma(row);
  }

  async getDashboardAnalytics(
    workspaceId: string,
  ): Promise<KnowledgeDashboardStatsDto> {
    const where = { workspace_id: workspaceId, deleted_at: null as Date | null };

    const [articles, analyticsRows] = await Promise.all([
      prisma.knowledge.findMany({ where, select: { id: true, slug: true, status: true } }),
      prisma.knowledge_analytics.findMany({
        include: { knowledge: { select: { slug: true, status: true, workspace_id: true } } },
      }),
    ]);

    const wsAnalytics = analyticsRows.filter(a => a.knowledge?.workspace_id === workspaceId);

    const totalArticles = articles.length;
    const totalViews = wsAnalytics.reduce((sum, a) => sum + a.views, 0);
    const publishedArticles = articles.filter(a => a.status === 'published').length;
    const draftArticles = articles.filter(a => a.status === 'draft').length;

    const mostViewed = wsAnalytics
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
      .map(a => ({ id: a.knowledge_id, slug: a.knowledge?.slug ?? 'unknown', views: a.views }));

    const viewsByStatus: Record<string, number> = {};
    for (const a of articles) {
      const analytic = wsAnalytics.find(an => an.knowledge_id === a.id);
      viewsByStatus[a.status] = (viewsByStatus[a.status] ?? 0) + (analytic?.views ?? 0);
    }

    return KnowledgeDashboardStatsDto.fromData({
      totalArticles, totalViews, publishedArticles, draftArticles, mostViewed, viewsByStatus,
    });
  }

  // ── Version Management ─────────────────────────────────────────────────────

  async getVersions(id: string, workspaceId: string): Promise<KnowledgeVersionDto[]> {
    await this.findOne(id, workspaceId);
    const rows = await prisma.knowledge_versions.findMany({
      where: { knowledge_id: id },
      orderBy: { version: 'desc' },
    });
    return rows.map(r => KnowledgeVersionDto.fromPrisma(r));
  }

  async getVersion(
    id: string,
    versionId: string,
    workspaceId: string,
  ): Promise<KnowledgeVersionDto> {
    await this.findOne(id, workspaceId);
    const row = await prisma.knowledge_versions.findUnique({
      where: { id: versionId, knowledge_id: id },
    });
    if (!row) throw new NotFoundException('Version not found');
    return KnowledgeVersionDto.fromPrisma(row);
  }

  async restoreVersion(
    id: string,
    versionId: string,
    workspaceId: string,
    userId: string,
  ): Promise<KnowledgeEntity> {
    const entity = await this.findOne(id, workspaceId);
    const version = await this.getVersion(id, versionId, workspaceId);

    entity.update({ content: version.snapshot as any });

    if (version.snapshot) {
      entity.setSearchText(extractKnowledgeText(version.snapshot as any));
    }

    await this._createVersionSnapshot(entity);

    await this.knowledgeRepository.save(entity);
    return entity;
  }

  // ── Comments ───────────────────────────────────────────────────────────────

  async getComments(id: string, workspaceId: string): Promise<CommentResponseDto[]> {
    await this.findOne(id, workspaceId);
    const rows = await prisma.knowledge_comments.findMany({
      where: { knowledge_id: id, deleted_at: null, parent_id: null },
      include: {
        _count: { select: { replies: true } },
        replies: { where: { deleted_at: null }, orderBy: { created_at: 'asc' as const } },
      },
      orderBy: { created_at: 'desc' },
    });
    return rows.flatMap(c => [
      CommentResponseDto.fromPrisma(c),
      ...c.replies.map((r: any) => CommentResponseDto.fromPrisma(r)),
    ]);
  }

  async createComment(
    id: string,
    workspaceId: string,
    userId: string,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.findOne(id, workspaceId);
    const row = await prisma.knowledge_comments.create({
      data: {
        id: crypto.randomUUID(),
        knowledge_id: id,
        user_id: userId,
        parent_id: dto.parentId ?? null,
        content: dto.content,
      },
    });
    return CommentResponseDto.fromPrisma(row);
  }

  async updateComment(
    id: string,
    commentId: string,
    workspaceId: string,
    userId: string,
    dto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    await this.findOne(id, workspaceId);
    const existing = await prisma.knowledge_comments.findUnique({
      where: { id: commentId },
    });
    if (!existing || existing.deleted_at) {
      throw new NotFoundException('Comment not found');
    }
    if (existing.user_id !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }
    const row = await prisma.knowledge_comments.update({
      where: { id: commentId },
      data: { content: dto.content, is_edited: true },
    });
    return CommentResponseDto.fromPrisma(row);
  }

  async deleteComment(
    id: string,
    commentId: string,
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    await this.findOne(id, workspaceId);
    const existing = await prisma.knowledge_comments.findUnique({
      where: { id: commentId },
    });
    if (!existing || existing.deleted_at) {
      throw new NotFoundException('Comment not found');
    }
    if (existing.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }
    await prisma.knowledge_comments.update({
      where: { id: commentId },
      data: { deleted_at: new Date() },
    });
  }

  // ── Workflow ───────────────────────────────────────────────────────────────

  async getWorkflow(id: string, workspaceId: string): Promise<WorkflowResponseDto | null> {
    await this.findOne(id, workspaceId);
    const row = await prisma.knowledge_workflows.findUnique({
      where: { knowledge_id: id },
      include: { history: { orderBy: { created_at: 'desc' } } },
    });
    if (!row) return null;
    return WorkflowResponseDto.fromPrisma(row);
  }

  async submitWorkflow(
    id: string,
    workspaceId: string,
    userId: string,
    dto: CreateWorkflowCommentDto,
  ): Promise<WorkflowResponseDto> {
    await this.findOne(id, workspaceId);
    const existing = await prisma.knowledge_workflows.findUnique({
      where: { knowledge_id: id },
    });
    if (!existing) {
      const row = await prisma.knowledge_workflows.create({
        data: {
          id: crypto.randomUUID(),
          knowledge_id: id,
          current_status: 'review',
          assigned_to: userId,
          submitted_at: new Date(),
        },
      });
      await prisma.knowledge_workflow_history.create({
        data: {
          id: crypto.randomUUID(),
          workflow_id: row.id,
          status: 'review',
          comment: dto.comment,
          user_id: userId,
        },
      });
      const full = await prisma.knowledge_workflows.findUnique({
        where: { id: row.id },
        include: { history: { orderBy: { created_at: 'desc' } } },
      });
      return WorkflowResponseDto.fromPrisma(full!);
    }
    // Update existing workflow
    const updated = await prisma.knowledge_workflows.update({
      where: { id: existing.id },
      data: { current_status: 'review', submitted_at: new Date(), assigned_to: userId },
    });
    await prisma.knowledge_workflow_history.create({
      data: {
        id: crypto.randomUUID(),
        workflow_id: updated.id,
        status: 'review',
        comment: dto.comment,
        user_id: userId,
      },
    });
    const full = await prisma.knowledge_workflows.findUnique({
      where: { id: updated.id },
      include: { history: { orderBy: { created_at: 'desc' } } },
    });
    return WorkflowResponseDto.fromPrisma(full!);
  }

  async approveWorkflow(
    id: string,
    workspaceId: string,
    userId: string,
    dto: CreateWorkflowCommentDto,
  ): Promise<WorkflowResponseDto> {
    await this.findOne(id, workspaceId);
    const existing = await prisma.knowledge_workflows.findUnique({
      where: { knowledge_id: id },
    });
    if (!existing) throw new NotFoundException('No workflow found for this article');
    const updated = await prisma.knowledge_workflows.update({
      where: { id: existing.id },
      data: {
        current_status: 'published',
        reviewer_id: userId,
        review_comment: dto.comment,
        reviewed_at: new Date(),
      },
    });
    await prisma.knowledge_workflow_history.create({
      data: {
        id: crypto.randomUUID(),
        workflow_id: updated.id,
        status: 'published',
        comment: dto.comment,
        user_id: userId,
      },
    });
    const full = await prisma.knowledge_workflows.findUnique({
      where: { id: updated.id },
      include: { history: { orderBy: { created_at: 'desc' } } },
    });
    return WorkflowResponseDto.fromPrisma(full!);
  }

  async rejectWorkflow(
    id: string,
    workspaceId: string,
    userId: string,
    dto: CreateWorkflowCommentDto,
  ): Promise<WorkflowResponseDto> {
    await this.findOne(id, workspaceId);
    const existing = await prisma.knowledge_workflows.findUnique({
      where: { knowledge_id: id },
    });
    if (!existing) throw new NotFoundException('No workflow found for this article');
    const updated = await prisma.knowledge_workflows.update({
      where: { id: existing.id },
      data: {
        current_status: 'draft',
        reviewer_id: userId,
        review_comment: dto.comment,
        reviewed_at: new Date(),
      },
    });
    await prisma.knowledge_workflow_history.create({
      data: {
        id: crypto.randomUUID(),
        workflow_id: updated.id,
        status: 'draft',
        comment: dto.comment,
        user_id: userId,
      },
    });
    const full = await prisma.knowledge_workflows.findUnique({
      where: { id: updated.id },
      include: { history: { orderBy: { created_at: 'desc' } } },
    });
    return WorkflowResponseDto.fromPrisma(full!);
  }

  // ── Private ─────────────────────────────────────────────────────────────────

  private async _saveTaxonomy(
    knowledgeId: string,
    items: AddTaxonomyDto[],
  ): Promise<void> {
    await prisma.knowledge_taxonomy.createMany({
      data: items.map((item) => ({
        id: crypto.randomUUID(),
        knowledge_id: knowledgeId,
        taxonomy_type: item.taxonomyType,
        taxonomy_id: item.taxonomyId,
      })),
    });
  }

  private async _createVersionSnapshot(
    entity: KnowledgeEntity,
    snapshot?: Record<string, unknown>,
    comment?: string,
  ): Promise<void> {
    await prisma.knowledge_versions.create({
      data: {
        id: crypto.randomUUID(),
        knowledge_id: entity.id,
        version: entity.version,
        snapshot: (snapshot ?? entity.content) as any,
        comment,
        created_by: entity.authorId,
      },
    });
  }
}
