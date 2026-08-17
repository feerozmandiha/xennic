import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsInt,
  IsArray,
  IsObject,
  IsUrl,
  Min,
  MinLength,
  MaxLength,
} from 'class-validator';
import { SUPPORTED_KNOWLEDGE_LOCALES } from '../../domain/value-objects/knowledge-locale.vo.js';
import type {
  KnowledgeTranslationRecord,
  KnowledgeMediaRecord,
  KnowledgeFormulaRecord,
  KnowledgeExampleRecord,
  CommentReactionRecord,
} from '../../domain/interfaces/knowledge-content.repository.interface.js';

// ─── Shared enums ────────────────────────────────────────────────────────────

export const KNOWLEDGE_MEDIA_TYPES = [
  'image',
  'pdf',
  'video',
  'cad',
  '3d',
  'gif',
  'svg',
  'audio',
  'archive',
] as const;

export const KNOWLEDGE_EXAMPLE_DIFFICULTIES = ['basic', 'intermediate', 'advanced'] as const;

// ─── Translations ────────────────────────────────────────────────────────────

export class UpsertTranslationDto {
  @ApiProperty({ enum: SUPPORTED_KNOWLEDGE_LOCALES, description: 'زبان ترجمه' })
  @IsEnum(SUPPORTED_KNOWLEDGE_LOCALES)
  language!: string;

  @ApiProperty({ description: 'عنوان ترجمه‌شده', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MinLength(1)
  @MaxLength(300)
  title!: string;

  @ApiPropertyOptional({ description: 'خلاصه', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  summary?: string;

  @ApiPropertyOptional({ description: 'عنوان سئو', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  seoTitle?: string;

  @ApiPropertyOptional({ description: 'توضیحات سئو', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  seoDescription?: string;

  @ApiPropertyOptional({ description: 'محتوای بلوکی ترجمه‌شده' })
  @IsOptional()
  @IsObject()
  content?: Record<string, unknown>;
}

export class TranslationResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() knowledgeId!: string;
  @ApiProperty() language!: string;
  @ApiProperty() title!: string;
  @ApiProperty({ nullable: true }) summary!: string | null;
  @ApiProperty({ nullable: true }) seoTitle!: string | null;
  @ApiProperty({ nullable: true }) seoDescription!: string | null;
  @ApiProperty() content!: Record<string, unknown>;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;

  static fromRecord(record: KnowledgeTranslationRecord): TranslationResponseDto {
    const dto = new TranslationResponseDto();
    dto.id = record.id;
    dto.knowledgeId = record.knowledgeId;
    dto.language = record.language;
    dto.title = record.title;
    dto.summary = record.summary;
    dto.seoTitle = record.seoTitle;
    dto.seoDescription = record.seoDescription;
    dto.content = record.content;
    dto.createdAt = record.createdAt;
    dto.updatedAt = record.updatedAt;
    return dto;
  }

  static fromRecords(records: KnowledgeTranslationRecord[]): TranslationResponseDto[] {
    return records.map((r) => TranslationResponseDto.fromRecord(r));
  }
}

// ─── Media ───────────────────────────────────────────────────────────────────

export class CreateMediaDto {
  @ApiProperty({ enum: KNOWLEDGE_MEDIA_TYPES, description: 'نوع رسانه' })
  @IsEnum(KNOWLEDGE_MEDIA_TYPES)
  type!: string;

  @ApiProperty({ example: 'https://cdn.xennic.io/media/arc-flash.png' })
  @IsString()
  @IsNotEmpty()
  @IsUrl({ require_tld: false })
  url!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  captionFa?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  captionEn?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altFa?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altEn?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'CC-BY-4.0', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  license?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  source?: string;

  @ApiPropertyOptional({ description: 'اندازه فایل به بایت', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ example: 'image/png', maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  mimeType?: string;

  @ApiPropertyOptional({ description: 'ترتیب نمایش', minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateMediaDto {
  @ApiPropertyOptional({ enum: KNOWLEDGE_MEDIA_TYPES })
  @IsOptional()
  @IsEnum(KNOWLEDGE_MEDIA_TYPES)
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUrl({ require_tld: false })
  url?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  captionFa?: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  captionEn?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altFa?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altEn?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  license?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  source?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  fileSize?: number;

  @ApiPropertyOptional({ maxLength: 150 })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  mimeType?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class MediaResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() knowledgeId!: string;
  @ApiProperty({ enum: KNOWLEDGE_MEDIA_TYPES }) type!: string;
  @ApiProperty() url!: string;
  @ApiProperty({ nullable: true }) captionFa!: string | null;
  @ApiProperty({ nullable: true }) captionEn!: string | null;
  @ApiProperty({ nullable: true }) altFa!: string | null;
  @ApiProperty({ nullable: true }) altEn!: string | null;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty({ nullable: true }) license!: string | null;
  @ApiProperty({ nullable: true }) source!: string | null;
  @ApiProperty({ nullable: true }) fileSize!: number | null;
  @ApiProperty({ nullable: true }) mimeType!: string | null;
  @ApiProperty() sortOrder!: number;
  @ApiProperty() createdAt!: Date;

  static fromRecord(record: KnowledgeMediaRecord): MediaResponseDto {
    const dto = new MediaResponseDto();
    dto.id = record.id;
    dto.knowledgeId = record.knowledgeId;
    dto.type = record.type;
    dto.url = record.url;
    dto.captionFa = record.captionFa;
    dto.captionEn = record.captionEn;
    dto.altFa = record.altFa;
    dto.altEn = record.altEn;
    dto.description = record.description;
    dto.license = record.license;
    dto.source = record.source;
    dto.fileSize = record.fileSize;
    dto.mimeType = record.mimeType;
    dto.sortOrder = record.sortOrder;
    dto.createdAt = record.createdAt;
    return dto;
  }

  static fromRecords(records: KnowledgeMediaRecord[]): MediaResponseDto[] {
    return records.map((r) => MediaResponseDto.fromRecord(r));
  }
}

// ─── Formulas ────────────────────────────────────────────────────────────────

export class CreateFormulaDto {
  @ApiProperty({ example: 'I = \\frac{P}{\\sqrt{3} \\cdot U \\cdot \\cos\\varphi}' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  latex!: string;

  @ApiPropertyOptional({ description: 'نمایش MathML', maxLength: 20000 })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  mathml?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionFa?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionEn?: string;

  @ApiPropertyOptional({
    description: 'متغیرهای فرمول',
    example: [{ symbol: 'P', unit: 'W', description: 'توان' }],
  })
  @IsOptional()
  @IsArray()
  variables?: unknown[];

  @ApiPropertyOptional({ example: 'CABLE-003', description: 'نوع محاسبه‌گر مرتبط' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  calculatorType?: string;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateFormulaDto {
  @ApiPropertyOptional({ maxLength: 5000 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  latex?: string;

  @ApiPropertyOptional({ maxLength: 20000 })
  @IsOptional()
  @IsString()
  @MaxLength(20000)
  mathml?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionFa?: string;

  @ApiPropertyOptional({ maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  descriptionEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  variables?: unknown[];

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  calculatorType?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class FormulaResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() knowledgeId!: string;
  @ApiProperty() latex!: string;
  @ApiProperty({ nullable: true }) mathml!: string | null;
  @ApiProperty({ nullable: true }) descriptionFa!: string | null;
  @ApiProperty({ nullable: true }) descriptionEn!: string | null;
  @ApiProperty({ type: [Object] }) variables!: unknown[];
  @ApiProperty({ nullable: true }) calculatorType!: string | null;
  @ApiProperty() sortOrder!: number;
  @ApiProperty() createdAt!: Date;

  static fromRecord(record: KnowledgeFormulaRecord): FormulaResponseDto {
    const dto = new FormulaResponseDto();
    dto.id = record.id;
    dto.knowledgeId = record.knowledgeId;
    dto.latex = record.latex;
    dto.mathml = record.mathml;
    dto.descriptionFa = record.descriptionFa;
    dto.descriptionEn = record.descriptionEn;
    dto.variables = record.variables;
    dto.calculatorType = record.calculatorType;
    dto.sortOrder = record.sortOrder;
    dto.createdAt = record.createdAt;
    return dto;
  }

  static fromRecords(records: KnowledgeFormulaRecord[]): FormulaResponseDto[] {
    return records.map((r) => FormulaResponseDto.fromRecord(r));
  }
}

// ─── Examples ────────────────────────────────────────────────────────────────

export class CreateExampleDto {
  @ApiProperty({ description: 'عنوان مثال (فارسی)', maxLength: 300 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  titleFa!: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  titleEn?: string;

  @ApiPropertyOptional({ enum: KNOWLEDGE_EXAMPLE_DIFFICULTIES, default: 'basic' })
  @IsOptional()
  @IsEnum(KNOWLEDGE_EXAMPLE_DIFFICULTIES)
  difficulty?: string;

  @ApiPropertyOptional({
    description: 'مراحل حل',
    example: [{ order: 1, text: 'محاسبه جریان نامی', formula: 'I = P / U' }],
  })
  @IsOptional()
  @IsArray()
  steps?: unknown[];

  @ApiPropertyOptional({ description: 'پاسخ نهایی', example: { value: 32, unit: 'A' } })
  @IsOptional()
  @IsObject()
  answer?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 'CABLE-003' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  calculatorType?: string;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class UpdateExampleDto {
  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(300)
  titleFa?: string;

  @ApiPropertyOptional({ maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  titleEn?: string;

  @ApiPropertyOptional({ enum: KNOWLEDGE_EXAMPLE_DIFFICULTIES })
  @IsOptional()
  @IsEnum(KNOWLEDGE_EXAMPLE_DIFFICULTIES)
  difficulty?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  steps?: unknown[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  answer?: Record<string, unknown>;

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  calculatorType?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}

export class ExampleResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() knowledgeId!: string;
  @ApiProperty() titleFa!: string;
  @ApiProperty({ nullable: true }) titleEn!: string | null;
  @ApiProperty({ enum: KNOWLEDGE_EXAMPLE_DIFFICULTIES }) difficulty!: string;
  @ApiProperty({ type: [Object] }) steps!: unknown[];
  @ApiProperty({ nullable: true }) answer!: Record<string, unknown> | null;
  @ApiProperty({ nullable: true }) calculatorType!: string | null;
  @ApiProperty() sortOrder!: number;
  @ApiProperty() createdAt!: Date;

  static fromRecord(record: KnowledgeExampleRecord): ExampleResponseDto {
    const dto = new ExampleResponseDto();
    dto.id = record.id;
    dto.knowledgeId = record.knowledgeId;
    dto.titleFa = record.titleFa;
    dto.titleEn = record.titleEn;
    dto.difficulty = record.difficulty;
    dto.steps = record.steps;
    dto.answer = record.answer;
    dto.calculatorType = record.calculatorType;
    dto.sortOrder = record.sortOrder;
    dto.createdAt = record.createdAt;
    return dto;
  }

  static fromRecords(records: KnowledgeExampleRecord[]): ExampleResponseDto[] {
    return records.map((r) => ExampleResponseDto.fromRecord(r));
  }
}

// ─── Comment reactions ───────────────────────────────────────────────────────

export class CommentLikeResponseDto {
  @ApiProperty() commentId!: string;
  @ApiProperty() likes!: number;
  @ApiProperty({ description: 'آیا کاربر جاری لایک کرده است' }) likedByMe!: boolean;

  static fromRecord(record: CommentReactionRecord, userId: string): CommentLikeResponseDto {
    const dto = new CommentLikeResponseDto();
    dto.commentId = record.id;
    dto.likes = record.likes;
    dto.likedByMe = record.likedBy.includes(userId);
    return dto;
  }
}

// ─── Localized article projection ────────────────────────────────────────────

export class LocalizedKnowledgeDto {
  @ApiProperty() id!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ description: 'زبان درخواست‌شده' }) requestedLocale!: string;
  @ApiProperty({ description: 'زبانی که واقعاً سرو شد' }) resolvedLocale!: string;
  @ApiProperty({ description: 'آیا از زبان جایگزین استفاده شد' }) isFallback!: boolean;
  @ApiProperty({ nullable: true }) title!: string | null;
  @ApiProperty({ nullable: true }) summary!: string | null;
  @ApiProperty({ nullable: true }) seoTitle!: string | null;
  @ApiProperty({ nullable: true }) seoDescription!: string | null;
  @ApiProperty() content!: Record<string, unknown>;
  @ApiProperty({ type: [String] }) availableLocales!: string[];
}
