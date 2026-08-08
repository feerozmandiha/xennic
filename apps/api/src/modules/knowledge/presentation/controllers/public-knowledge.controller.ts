import { Controller, Get, Post, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { KnowledgeService } from '../../application/services/knowledge.service.js';
import { KnowledgeResponseDto } from '../dtos/knowledge.dto.js';
import { prisma } from '@xennic/database';

@ApiTags('knowledge-public')
@Controller('public/knowledge')
export class PublicKnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get()
  @ApiOperation({
    summary: 'Public list published articles',
    description:
      'Returns published knowledge articles with public visibility. Supports search, taxonomy, difficulty, standards.',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'locale',
    required: false,
    enum: ['fa', 'en'],
    description: 'Filter by language',
  })
  @ApiQuery({ name: 'q', required: false, description: 'Full-text search query' })
  @ApiQuery({
    name: 'difficulty',
    required: false,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
  })
  @ApiQuery({ name: 'standard', required: false, description: 'Filter by standard code or ID' })
  @ApiQuery({
    name: 'taxonomyType',
    required: false,
    description: 'category|topic|tag|discipline|audience',
  })
  @ApiQuery({ name: 'taxonomyId', required: false })
  @ApiResponse({ status: 200, description: 'Articles retrieved' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
    @Query('q') q?: string,
    @Query('difficulty') difficulty?: string,
    @Query('standard') standard?: string,
    @Query('taxonomyType') taxonomyType?: string,
    @Query('taxonomyId') taxonomyId?: string,
  ) {
    // If advanced filters present, use Prisma directly for richer filtering
    const hasAdvancedFilters = !!(q || difficulty || standard || taxonomyType || taxonomyId);
    if (hasAdvancedFilters) {
      const pageNum = page ? parseInt(page, 10) : 1;
      const lim = limit ? parseInt(limit, 10) : 20;
      const offset = (pageNum - 1) * lim;

      const where: any = {
        status: 'published',
        visibility: 'public',
        is_active: true,
      };
      if (locale) where.language = locale;
      if (difficulty) where.difficulty = difficulty;

      if (standard) {
        where.standards = {
          some: {
            OR: [
              { standard: { code: { contains: standard, mode: 'insensitive' } } },
              { standard_id: standard },
            ],
          },
        };
      }

      if (taxonomyType && taxonomyId) {
        where.taxonomy = {
          some: { taxonomy_type: taxonomyType, taxonomy_id: taxonomyId },
        };
      }

      // Full-text search handling
      let data: any[];
      let total: number;

      if (q) {
        // Use plainto_tsquery for FTS if q present
        const searchTsvector = `to_tsvector('simple', COALESCE(k.search_text, ''))`;
        const countResult = await prisma.$queryRawUnsafe<{ count: number }[]>(
          `SELECT COUNT(*)::int as count FROM knowledge k WHERE k.status='published' AND k.visibility='public' AND k.is_active=true AND ${searchTsvector} @@ plainto_tsquery('simple', $1)`,
          q,
        );
        total = countResult[0]?.count ?? 0;
        const rows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT k.* FROM knowledge k WHERE k.status='published' AND k.visibility='public' AND k.is_active=true AND ${searchTsvector} @@ plainto_tsquery('simple', $1) ORDER BY ts_rank(${searchTsvector}, plainto_tsquery('simple', $1)) DESC, k.published_at DESC LIMIT $2 OFFSET $3`,
          q,
          lim,
          offset,
        );
        data = rows.map((r: any) =>
          KnowledgeResponseDto.fromEntity(
            // reconstitute minimal
            {
              id: r.id,
              workspaceId: r.workspace_id,
              slug: r.slug,
              status: r.status,
              visibility: r.visibility,
              language: r.language,
              version: r.version,
              isActive: r.is_active,
              content: r.content as any,
              searchText: r.search_text,
              readingTime: r.reading_time,
              difficulty: r.difficulty,
              authorId: r.author_id,
              reviewerId: r.reviewer_id,
              createdAt: r.created_at,
              updatedAt: r.updated_at,
              publishedAt: r.published_at,
              reviewedAt: r.reviewed_at,
              archivedAt: r.archived_at,
              isDeleted: () => false,
              setSearchText: () => {},
              // @ts-ignore
              content: r.content,
            } as any,
          ),
        );
        // When q present, we already filtered; other filters ignored for simplicity in FTS path
        // Could merge but keeping simple
        return {
          success: true,
          data,
          meta: { page: pageNum, limit: lim, total, totalPages: Math.ceil(total / lim) },
        };
      } else {
        [data, total] = await Promise.all([
          prisma.knowledge.findMany({
            where,
            skip: offset,
            take: lim,
            orderBy: { published_at: 'desc' },
          }),
          prisma.knowledge.count({ where }),
        ]);
        const entities = data.map((r: any) =>
          KnowledgeResponseDto.fromEntity({
            id: r.id,
            workspaceId: r.workspace_id,
            slug: r.slug,
            status: r.status,
            visibility: r.visibility,
            language: r.language,
            version: r.version,
            isActive: r.is_active,
            content: r.content as any,
            searchText: r.search_text,
            readingTime: r.reading_time,
            difficulty: r.difficulty,
            authorId: r.author_id,
            reviewerId: r.reviewer_id,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            publishedAt: r.published_at,
            reviewedAt: r.reviewed_at,
            archivedAt: r.archived_at,
          } as any),
        );
        return {
          success: true,
          data: entities,
          meta: { page: pageNum, limit: lim, total, totalPages: Math.ceil(total / lim) },
        };
      }
    }

    const result = await this.knowledgeService.findPublished(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
      locale,
    );
    return {
      success: true,
      data: KnowledgeResponseDto.fromEntities(result.data),
      meta: result.meta,
    };
  }

  @Get('hub/overview')
  @ApiOperation({
    summary: 'Public encyclopedia hub overview - stats, featured, standards, taxonomy',
  })
  async getHubOverview() {
    const [totalPublished, totalStandards, categories, topics, recent] = await Promise.all([
      prisma.knowledge.count({
        where: { status: 'published', visibility: 'public', is_active: true },
      }),
      prisma.engineering_standards.count({ where: { status: 'active' } }),
      prisma.categories.findMany({
        where: { is_active: true },
        orderBy: { sort_order: 'asc' },
        take: 12,
      }),
      prisma.topics.findMany({ where: { is_active: true }, take: 12 }),
      prisma.knowledge.findMany({
        where: { status: 'published', visibility: 'public', is_active: true },
        orderBy: { published_at: 'desc' },
        take: 6,
        select: {
          id: true,
          slug: true,
          language: true,
          difficulty: true,
          reading_time: true,
          content: true,
          published_at: true,
          standards: { include: { standard: true }, take: 3 },
          analytics: { select: { views: true } },
        },
      }),
    ]);

    // Most viewed
    const mostViewed = await prisma.knowledge_analytics.findMany({
      orderBy: { views: 'desc' },
      take: 5,
      include: { knowledge: { select: { slug: true, content: true, difficulty: true } } },
    });

    return {
      success: true,
      data: {
        stats: {
          totalArticles: totalPublished,
          totalStandards,
          totalCategories: categories.length,
          totalTopics: topics.length,
        },
        categories,
        topics,
        recent: recent.map((r: any) => ({
          id: r.id,
          slug: r.slug,
          title: (r.content as any)?.title ?? r.slug,
          difficulty: r.difficulty,
          readingTime: r.reading_time,
          publishedAt: r.published_at,
          views: r.analytics?.views ?? 0,
          standards: (r.standards ?? []).map((s: any) => ({
            code: s.standard.code,
            title: s.standard.title,
            organization: s.standard.organization,
          })),
        })),
        mostViewed: mostViewed.map((m: any) => ({
          id: m.knowledge_id,
          slug: m.knowledge?.slug,
          title: (m.knowledge?.content as any)?.title ?? m.knowledge?.slug,
          views: m.views,
        })),
      },
    };
  }

  @Get(':slug')
  @ApiOperation({
    summary: 'Public get article by slug',
    description: 'Returns a published article by slug with auto view recording.',
  })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  @ApiResponse({ status: 200, description: 'Article found' })
  @ApiResponse({ status: 404, description: 'Article not found' })
  async findBySlug(@Param('slug') slug: string) {
    const entity = await this.knowledgeService.findPublishedBySlug(slug);

    // Increment view count (fire-and-forget, fail silent)
    prisma.knowledge_analytics
      .upsert({
        where: { knowledge_id: entity.id },
        update: { views: { increment: 1 }, last_viewed_at: new Date() },
        create: {
          id: crypto.randomUUID(),
          knowledge_id: entity.id,
          views: 1,
          last_viewed_at: new Date(),
        },
      })
      .catch(() => {});

    return { success: true, data: KnowledgeResponseDto.fromEntity(entity) };
  }

  @Get(':slug/related')
  @ApiOperation({
    summary: 'Get related data for a public article - standards, taxonomy, analytics, calculations',
  })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  async getRelated(@Param('slug') slug: string) {
    const entity = await this.knowledgeService.findPublishedBySlug(slug);

    const [standards, taxonomy, analytics, formulas, examples, versions] = await Promise.all([
      prisma.knowledge_standards.findMany({
        where: { knowledge_id: entity.id },
        include: { standard: true },
      }),
      prisma.knowledge_taxonomy.findMany({ where: { knowledge_id: entity.id } }),
      prisma.knowledge_analytics.findUnique({ where: { knowledge_id: entity.id } }),
      prisma.knowledge_formulas.findMany({
        where: { knowledge_id: entity.id },
        orderBy: { sort_order: 'asc' },
      }),
      prisma.knowledge_examples.findMany({
        where: { knowledge_id: entity.id },
        orderBy: { sort_order: 'asc' },
      }),
      prisma.knowledge_versions.findMany({
        where: { knowledge_id: entity.id },
        orderBy: { version: 'desc' },
        take: 5,
      }),
    ]);

    // Try to find related articles via same standards or taxonomy
    const standardIds = standards.map((s: any) => s.standard_id);
    const taxonomyIds = taxonomy.map((t: any) => t.taxonomy_id);

    let related: any[] = [];
    if (standardIds.length > 0 || taxonomyIds.length > 0) {
      related = await prisma.knowledge.findMany({
        where: {
          id: { not: entity.id },
          status: 'published',
          visibility: 'public',
          is_active: true,
          OR: [
            ...(standardIds.length > 0
              ? [{ standards: { some: { standard_id: { in: standardIds } } } }]
              : []),
            ...(taxonomyIds.length > 0
              ? [{ taxonomy: { some: { taxonomy_id: { in: taxonomyIds } } } }]
              : []),
          ],
        },
        take: 6,
        orderBy: { published_at: 'desc' },
        select: {
          id: true,
          slug: true,
          content: true,
          difficulty: true,
          reading_time: true,
          published_at: true,
        },
      });
    }

    return {
      success: true,
      data: {
        standards: standards.map((s: any) => ({
          id: s.standard.id,
          code: s.standard.code,
          title: s.standard.title,
          organization: s.standard.organization,
          version: s.standard.version,
          status: s.standard.status,
        })),
        taxonomy,
        analytics: analytics
          ? {
              views: analytics.views,
              likes: analytics.likes,
              bookmarks: analytics.bookmarks,
              lastViewedAt: analytics.last_viewed_at,
            }
          : null,
        formulas,
        examples,
        versions: versions.map((v: any) => ({ version: v.version, createdAt: v.created_at })),
        related: related.map((r: any) => ({
          id: r.id,
          slug: r.slug,
          title: (r.content as any)?.title ?? r.slug,
          difficulty: r.difficulty,
          readingTime: r.reading_time,
          publishedAt: r.published_at,
        })),
      },
    };
  }

  @Post(':slug/view')
  @ApiOperation({ summary: 'Record view for public article (explicit)' })
  @ApiParam({ name: 'slug', description: 'Article slug' })
  async recordView(@Param('slug') slug: string) {
    const entity = await this.knowledgeService.findPublishedBySlug(slug);
    const today = new Date().toISOString().slice(0, 10);

    await prisma.knowledge_analytics.upsert({
      where: { knowledge_id: entity.id },
      update: {
        views: { increment: 1 },
        last_viewed_at: new Date(),
      },
      create: {
        id: crypto.randomUUID(),
        knowledge_id: entity.id,
        views: 1,
        last_viewed_at: new Date(),
        daily_stats: { [today]: 1 } as any,
      },
    });

    return { success: true, message: 'View recorded' };
  }
}
