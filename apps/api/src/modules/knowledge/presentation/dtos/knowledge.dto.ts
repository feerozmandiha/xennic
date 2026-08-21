import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsUUID,
  IsObject,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import {
  KnowledgeEntity,
  type KnowledgeStatus,
  type KnowledgeVisibility,
  type KnowledgeDifficulty,
} from '../../domain/entities/knowledge.entity.js';

// ─── Enums for Swagger ─────────────────────────────────────────────────────────

export const KNOWLEDGE_STATUSES = ['draft', 'review', 'published', 'archived'] as const;
export const KNOWLEDGE_VISIBILITIES = ['public', 'private', 'workspace'] as const;
export const KNOWLEDGE_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export const KNOWLEDGE_ACCESS_TIERS = ['free', 'basic', 'pro', 'enterprise'] as const;
export const TAXONOMY_TYPES = ['category', 'topic', 'tag', 'discipline', 'audience'] as const;

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export class CreateKnowledgeDto {
  @ApiProperty({
    example: 'understanding-arc-flash',
    description: 'URL-friendly slug (auto-generated if omitted)',
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional({ description: 'Block-based content as JSON object' })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'fa', default: 'fa' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ enum: KNOWLEDGE_VISIBILITIES, default: 'public' })
  @IsOptional()
  @IsEnum(KNOWLEDGE_VISIBILITIES)
  visibility?: KnowledgeVisibility;

  @ApiPropertyOptional({ enum: KNOWLEDGE_DIFFICULTIES })
  @IsOptional()
  @IsEnum(KNOWLEDGE_DIFFICULTIES)
  difficulty?: KnowledgeDifficulty;

  @ApiPropertyOptional({
    enum: KNOWLEDGE_ACCESS_TIERS,
    default: 'free',
    description: 'Access tier: free (public), basic (logged-in), pro, enterprise',
  })
  @IsOptional()
  @IsEnum(KNOWLEDGE_ACCESS_TIERS)
  accessTier?: 'free' | 'basic' | 'pro' | 'enterprise';

  @ApiPropertyOptional({ description: 'Taxonomy assignments' })
  @IsOptional()
  @IsArray()
  taxonomy?: CreateTaxonomyDto[];
}

export class CreateTaxonomyDto {
  @ApiProperty({ enum: TAXONOMY_TYPES })
  @IsEnum(TAXONOMY_TYPES)
  taxonomyType!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  taxonomyId!: string;
}

export class UpdateKnowledgeDto {
  @ApiPropertyOptional({ minLength: 2, maxLength: 200 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;

  @ApiPropertyOptional({ enum: KNOWLEDGE_VISIBILITIES })
  @IsOptional()
  @IsEnum(KNOWLEDGE_VISIBILITIES)
  visibility?: KnowledgeVisibility;

  @ApiPropertyOptional({ enum: KNOWLEDGE_DIFFICULTIES })
  @IsOptional()
  @IsEnum(KNOWLEDGE_DIFFICULTIES)
  difficulty?: KnowledgeDifficulty;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  readingTime?: number | null;

  @ApiPropertyOptional({ enum: KNOWLEDGE_ACCESS_TIERS })
  @IsOptional()
  @IsEnum(KNOWLEDGE_ACCESS_TIERS)
  accessTier?: 'free' | 'basic' | 'pro' | 'enterprise';
}

export class KnowledgeSearchQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ enum: KNOWLEDGE_STATUSES })
  @IsOptional()
  @IsEnum(KNOWLEDGE_STATUSES)
  status?: KnowledgeStatus;

  @ApiPropertyOptional({ enum: KNOWLEDGE_VISIBILITIES })
  @IsOptional()
  @IsEnum(KNOWLEDGE_VISIBILITIES)
  visibility?: KnowledgeVisibility;

  @ApiPropertyOptional({ enum: KNOWLEDGE_DIFFICULTIES })
  @IsOptional()
  @IsEnum(KNOWLEDGE_DIFFICULTIES)
  difficulty?: KnowledgeDifficulty;

  @ApiPropertyOptional({ example: 'fa' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({ enum: TAXONOMY_TYPES })
  @IsOptional()
  @IsString()
  taxonomyType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  taxonomyId?: string;

  @ApiPropertyOptional({ type: Number, example: 1 })
  @IsOptional()
  page?: string;

  @ApiPropertyOptional({ type: Number, example: 20 })
  @IsOptional()
  limit?: string;
}

export class AssignReviewerDto {
  @ApiProperty()
  @IsUUID()
  reviewerId!: string;
}

// ─── Admin console DTOs ─────────────────────────────────────────────────────

export const KNOWLEDGE_ADMIN_STATUS_FILTERS = ['all', ...KNOWLEDGE_STATUSES] as const;
export const KNOWLEDGE_ADMIN_TIER_FILTERS = ['all', ...KNOWLEDGE_ACCESS_TIERS] as const;

export class AdminKnowledgeQueryDto {
  @ApiPropertyOptional({ description: 'Free text search over title and slug' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: KNOWLEDGE_ADMIN_STATUS_FILTERS, default: 'all' })
  @IsOptional()
  @IsEnum(KNOWLEDGE_ADMIN_STATUS_FILTERS)
  status?: (typeof KNOWLEDGE_ADMIN_STATUS_FILTERS)[number];

  @ApiPropertyOptional({ enum: KNOWLEDGE_ADMIN_TIER_FILTERS, default: 'all' })
  @IsOptional()
  @IsEnum(KNOWLEDGE_ADMIN_TIER_FILTERS)
  accessTier?: (typeof KNOWLEDGE_ADMIN_TIER_FILTERS)[number];

  @ApiPropertyOptional({ example: 'fa', description: 'Language code, or "all"' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ type: Number, default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: Number, default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class AdminKnowledgeItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ nullable: true }) title!: string | null;
  @ApiProperty({ enum: KNOWLEDGE_STATUSES }) status!: string;
  @ApiProperty({ enum: KNOWLEDGE_ACCESS_TIERS }) accessTier!: string;
  @ApiProperty() language!: string;
  @ApiProperty() version!: number;
  @ApiProperty({ enum: KNOWLEDGE_VISIBILITIES }) visibility!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty({ nullable: true }) workspaceName!: string | null;
  @ApiProperty({ nullable: true }) authorId!: string | null;
  @ApiProperty({ nullable: true }) authorName!: string | null;
  @ApiProperty() views!: number;
  @ApiProperty({ nullable: true }) publishedAt!: Date | null;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty() createdAt!: Date;

  static fromRow(row: {
    entity: KnowledgeEntity;
    title: string | null;
    workspaceName: string | null;
    authorName: string | null;
    views: number;
  }): AdminKnowledgeItemDto {
    const dto = new AdminKnowledgeItemDto();
    const e = row.entity;
    dto.id = e.id;
    dto.slug = e.slug;
    dto.title = row.title;
    dto.status = e.status;
    dto.accessTier = e.accessTier ?? 'free';
    dto.language = e.language;
    dto.version = e.version;
    dto.visibility = e.visibility;
    dto.workspaceId = e.workspaceId;
    dto.workspaceName = row.workspaceName;
    dto.authorId = e.authorId;
    dto.authorName = row.authorName;
    dto.views = row.views;
    dto.publishedAt = e.publishedAt;
    dto.updatedAt = e.updatedAt;
    dto.createdAt = e.createdAt;
    return dto;
  }
}

export class AdminKnowledgeRecentItemDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ nullable: true }) title!: string | null;
  @ApiProperty({ enum: KNOWLEDGE_STATUSES }) status!: string;
  @ApiProperty({ enum: KNOWLEDGE_ACCESS_TIERS }) accessTier!: string;
  @ApiProperty({ nullable: true }) publishedAt!: Date | null;
  @ApiProperty() updatedAt!: Date;
}

export class AdminKnowledgeStatsDto {
  @ApiProperty() totalArticles!: number;
  @ApiProperty() totalViews!: number;
  @ApiProperty({ description: 'Article count keyed by status' })
  byStatus!: Record<string, number>;
  @ApiProperty({ description: 'Article count keyed by access tier' })
  byTier!: Record<string, number>;
  @ApiProperty({ type: [AdminKnowledgeRecentItemDto] })
  recentArticles!: AdminKnowledgeRecentItemDto[];

  static fromData(data: {
    totalArticles: number;
    totalViews: number;
    byStatus: Record<string, number>;
    byTier: Record<string, number>;
    recentArticles: AdminKnowledgeRecentItemDto[];
  }): AdminKnowledgeStatsDto {
    const dto = new AdminKnowledgeStatsDto();
    dto.totalArticles = data.totalArticles;
    dto.totalViews = data.totalViews;
    dto.byStatus = data.byStatus;
    dto.byTier = data.byTier;
    dto.recentArticles = data.recentArticles;
    return dto;
  }
}

// ─── Version DTO ─────────────────────────────────────────────────────────────

export class KnowledgeVersionDto {
  @ApiProperty() id!: string;
  @ApiProperty() knowledgeId!: string;
  @ApiProperty() version!: number;
  @ApiProperty() snapshot!: Record<string, unknown>;
  @ApiPropertyOptional() comment?: string;
  @ApiPropertyOptional() createdBy?: string;
  @ApiProperty() createdAt!: Date;

  static fromPrisma(row: any): KnowledgeVersionDto {
    const dto = new KnowledgeVersionDto();
    dto.id = row.id;
    dto.knowledgeId = row.knowledge_id;
    dto.version = row.version;
    dto.snapshot = row.snapshot as Record<string, unknown>;
    dto.comment = row.comment ?? undefined;
    dto.createdBy = row.created_by ?? undefined;
    dto.createdAt = row.created_at;
    return dto;
  }
}

// ─── Comment DTOs ───────────────────────────────────────────────────────────

export class CreateCommentDto {
  @ApiProperty({ description: 'متن نظر' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;

  @ApiPropertyOptional({ description: 'شناسه نظر والد (برای پاسخ)' })
  @IsOptional()
  @IsUUID()
  parentId?: string;
}

export class UpdateCommentDto {
  @ApiProperty({ description: 'متن ویرایش‌شده نظر' })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(5000)
  content!: string;
}

export class CommentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() knowledgeId!: string;
  @ApiProperty() userId!: string;
  @ApiPropertyOptional() parentId?: string;
  @ApiProperty() content!: string;
  @ApiProperty() likes!: number;
  @ApiProperty() isEdited!: boolean;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiPropertyOptional({ description: 'تعداد ریپلای‌ها' }) replyCount?: number;

  static fromPrisma(row: any): CommentResponseDto {
    const dto = new CommentResponseDto();
    dto.id = row.id;
    dto.knowledgeId = row.knowledge_id;
    dto.userId = row.user_id;
    dto.parentId = row.parent_id ?? undefined;
    dto.content = row.content;
    dto.likes = row.likes;
    dto.isEdited = row.is_edited;
    dto.createdAt = row.created_at;
    dto.updatedAt = row.updated_at;
    dto.replyCount = row._count?.replies ?? undefined;
    return dto;
  }
}

// ─── Workflow DTOs ─────────────────────────────────────────────────────────

export class CreateWorkflowCommentDto {
  @ApiProperty({ description: 'متن توضیح مرحله' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  comment!: string;
}

export class WorkflowHistoryDto {
  @ApiProperty() id!: string;
  @ApiProperty() workflowId!: string;
  @ApiProperty() status!: string;
  @ApiPropertyOptional() comment?: string;
  @ApiProperty() userId!: string;
  @ApiProperty() createdAt!: Date;

  static fromPrisma(row: any): WorkflowHistoryDto {
    const dto = new WorkflowHistoryDto();
    dto.id = row.id;
    dto.workflowId = row.workflow_id;
    dto.status = row.status;
    dto.comment = row.comment ?? undefined;
    dto.userId = row.user_id;
    dto.createdAt = row.created_at;
    return dto;
  }
}

export class WorkflowResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() knowledgeId!: string;
  @ApiProperty() currentStatus!: string;
  @ApiPropertyOptional() assignedTo?: string;
  @ApiPropertyOptional() reviewerId?: string;
  @ApiPropertyOptional() reviewComment?: string;
  @ApiPropertyOptional() reviewedAt?: Date;
  @ApiPropertyOptional() submittedAt?: Date;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty({ type: [WorkflowHistoryDto] }) history!: WorkflowHistoryDto[];

  static fromPrisma(row: any, history?: any[]): WorkflowResponseDto {
    const dto = new WorkflowResponseDto();
    dto.id = row.id;
    dto.knowledgeId = row.knowledge_id;
    dto.currentStatus = row.current_status;
    dto.assignedTo = row.assigned_to ?? undefined;
    dto.reviewerId = row.reviewer_id ?? undefined;
    dto.reviewComment = row.review_comment ?? undefined;
    dto.reviewedAt = row.reviewed_at ?? undefined;
    dto.submittedAt = row.submitted_at ?? undefined;
    dto.createdAt = row.created_at;
    dto.updatedAt = row.updated_at;
    dto.history = (history ?? row.history ?? []).map((h: any) => WorkflowHistoryDto.fromPrisma(h));
    return dto;
  }
}

// ─── Analytics DTOs ─────────────────────────────────────────────────────────

export class KnowledgeAnalyticsDto {
  @ApiProperty() views!: number;
  @ApiProperty() uniqueViews!: number;
  @ApiProperty() likes!: number;
  @ApiProperty() bookmarks!: number;
  @ApiProperty() shares!: number;
  @ApiProperty() downloads!: number;
  @ApiPropertyOptional() avgReadingTime?: number;
  @ApiPropertyOptional() lastViewedAt?: Date;
  @ApiProperty() dailyStats!: Record<string, unknown>;

  static fromPrisma(row: any): KnowledgeAnalyticsDto {
    const dto = new KnowledgeAnalyticsDto();
    dto.views = row.views ?? 0;
    dto.uniqueViews = row.unique_views ?? 0;
    dto.likes = row.likes ?? 0;
    dto.bookmarks = row.bookmarks ?? 0;
    dto.shares = row.shares ?? 0;
    dto.downloads = row.downloads ?? 0;
    dto.avgReadingTime = row.avg_reading_time ?? undefined;
    dto.lastViewedAt = row.last_viewed_at ?? undefined;
    dto.dailyStats = (row.daily_stats ?? {}) as Record<string, unknown>;
    return dto;
  }
}

export class KnowledgeDashboardStatsDto {
  @ApiProperty() totalArticles!: number;
  @ApiProperty() totalViews!: number;
  @ApiProperty() publishedArticles!: number;
  @ApiProperty() draftArticles!: number;
  @ApiProperty() mostViewed!: { id: string; slug: string; views: number }[];
  @ApiProperty() viewsByStatus!: Record<string, number>;

  static fromData(data: {
    totalArticles: number;
    totalViews: number;
    publishedArticles: number;
    draftArticles: number;
    mostViewed: any[];
    viewsByStatus: Record<string, number>;
  }): KnowledgeDashboardStatsDto {
    const dto = new KnowledgeDashboardStatsDto();
    dto.totalArticles = data.totalArticles;
    dto.totalViews = data.totalViews;
    dto.publishedArticles = data.publishedArticles;
    dto.draftArticles = data.draftArticles;
    dto.mostViewed = data.mostViewed;
    dto.viewsByStatus = data.viewsByStatus;
    return dto;
  }
}

// ─── Engineering Integration DTOs ──────────────────────────────────────────

export class RelatedCalculationDto {
  @ApiProperty() id!: string;
  @ApiProperty() type!: string;
  @ApiProperty() version!: string;
  @ApiProperty() inputs!: Record<string, unknown>;
  @ApiProperty() results!: Record<string, unknown>;
  @ApiProperty() engineVersion!: string;
  @ApiProperty() standardVersion!: string;
  @ApiProperty() createdAt!: Date;

  static fromRow(row: any): RelatedCalculationDto {
    const dto = new RelatedCalculationDto();
    dto.id = row.id;
    dto.type = row.type;
    dto.version = row.version;
    dto.inputs = row.inputs as Record<string, unknown>;
    dto.results = row.results as Record<string, unknown>;
    dto.engineVersion = row.engine_version;
    dto.standardVersion = row.standard_version;
    dto.createdAt = row.created_at;
    return dto;
  }
}

export class AddTaxonomyDto {
  @ApiProperty({ enum: TAXONOMY_TYPES })
  @IsEnum(TAXONOMY_TYPES)
  taxonomyType!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  taxonomyId!: string;
}

// ─── Response DTOs ─────────────────────────────────────────────────────────────

export class KnowledgeResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ enum: KNOWLEDGE_STATUSES }) status!: string;
  @ApiProperty({ enum: KNOWLEDGE_VISIBILITIES }) visibility!: string;
  @ApiProperty() language!: string;
  @ApiProperty() version!: number;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() content!: Record<string, unknown>;
  @ApiProperty({ nullable: true }) readingTime!: number | null;
  @ApiProperty({ nullable: true, enum: KNOWLEDGE_DIFFICULTIES }) difficulty!: string | null;
  @ApiProperty({ enum: KNOWLEDGE_ACCESS_TIERS, default: 'free' }) accessTier!: string;
  @ApiProperty({ nullable: true }) authorId!: string | null;
  @ApiProperty({ nullable: true }) reviewerId!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty({ nullable: true }) publishedAt!: Date | null;
  @ApiProperty({ nullable: true }) reviewedAt!: Date | null;
  @ApiProperty({ nullable: true }) archivedAt!: Date | null;

  static fromEntity(e: KnowledgeEntity): KnowledgeResponseDto {
    const dto = new KnowledgeResponseDto();
    dto.id = e.id;
    dto.workspaceId = e.workspaceId;
    dto.slug = e.slug;
    dto.status = e.status;
    dto.visibility = e.visibility;
    dto.language = e.language;
    dto.version = e.version;
    dto.isActive = e.isActive;
    dto.content = e.content;
    dto.readingTime = e.readingTime;
    dto.difficulty = e.difficulty;
    dto.accessTier = (e as any).accessTier ?? 'free';
    dto.authorId = e.authorId;
    dto.reviewerId = e.reviewerId;
    dto.createdAt = e.createdAt;
    dto.updatedAt = e.updatedAt;
    dto.publishedAt = e.publishedAt;
    dto.reviewedAt = e.reviewedAt;
    dto.archivedAt = e.archivedAt;
    return dto;
  }

  static fromEntities(entities: KnowledgeEntity[]): KnowledgeResponseDto[] {
    return entities.map((e) => KnowledgeResponseDto.fromEntity(e));
  }
}
