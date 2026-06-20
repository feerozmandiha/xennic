import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, IsEnum, IsUUID, IsObject,
  MinLength, MaxLength, IsInt, Min, IsArray,
} from 'class-validator';
import { KnowledgeEntity, type KnowledgeStatus, type KnowledgeVisibility, type KnowledgeDifficulty } from '../../domain/entities/knowledge.entity.js';

// ─── Enums for Swagger ─────────────────────────────────────────────────────────

export const KNOWLEDGE_STATUSES = ['draft', 'review', 'published', 'archived'] as const;
export const KNOWLEDGE_VISIBILITIES = ['public', 'private', 'workspace'] as const;
export const KNOWLEDGE_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'] as const;
export const TAXONOMY_TYPES = ['category', 'topic', 'tag', 'discipline', 'audience'] as const;

// ─── Request DTOs ──────────────────────────────────────────────────────────────

export class CreateKnowledgeDto {
  @ApiProperty({ example: 'understanding-arc-flash', description: 'URL-friendly slug (auto-generated if omitted)' })
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
