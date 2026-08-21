import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import type {
  CmsBlock,
  CmsBlockStyle,
  CmsDocument,
} from '../../domain/entities/cms-content.entity.js';

export class CmsBlockStyleDto implements CmsBlockStyle {
  @ApiPropertyOptional() @IsOptional() @IsString() backgroundColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() textColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() gradient?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() backgroundImage?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() backgroundOverlay?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() hoverBackgroundColor?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() hoverTextColor?: string;
  @ApiPropertyOptional({ enum: ['none', 'sm', 'md', 'lg', 'xl'] })
  @IsOptional()
  @IsString()
  hoverShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  hoverScale?: boolean;

  @ApiPropertyOptional({ enum: ['none', 'sm', 'md', 'lg', 'xl'] })
  @IsOptional()
  @IsString()
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  @ApiPropertyOptional({ enum: ['none', 'sm', 'md', 'lg'] })
  @IsOptional()
  @IsString()
  paddingX?: 'none' | 'sm' | 'md' | 'lg';

  @ApiPropertyOptional({ enum: ['none', 'sm', 'md', 'lg'] })
  @IsOptional()
  @IsString()
  marginY?: 'none' | 'sm' | 'md' | 'lg';

  @ApiPropertyOptional({ enum: ['start', 'center', 'end'] })
  @IsOptional()
  @IsString()
  align?: 'start' | 'center' | 'end';

  @ApiPropertyOptional({ enum: ['right', 'center', 'left'] })
  @IsOptional()
  @IsString()
  textAlign?: 'right' | 'center' | 'left';

  @ApiPropertyOptional({ enum: ['sm', 'md', 'lg', 'xl', 'full'] })
  @IsOptional()
  @IsString()
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';

  @ApiPropertyOptional({ enum: ['none', 'sm', 'md', 'lg', 'xl', 'full'] })
  @IsOptional()
  @IsString()
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

  @ApiPropertyOptional({ enum: ['none', 'sm', 'md', 'lg', 'xl'] })
  @IsOptional()
  @IsString()
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  border?: boolean;

  @ApiPropertyOptional() @IsOptional() @IsString() borderColor?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() className?: string;

  @ApiPropertyOptional({
    enum: ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'],
  })
  @IsOptional()
  @IsString()
  textSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';

  @ApiPropertyOptional({ enum: ['normal', 'medium', 'semibold', 'bold', 'extrabold'] })
  @IsOptional()
  @IsString()
  fontWeight?: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

export class CmsBlockDto implements CmsBlock {
  @ApiProperty({ description: 'نوع بلوک (هیرو/ویژگی/قیمت/متن/تصویر/... )' })
  @IsString()
  @MinLength(1)
  @MaxLength(64)
  type!: string;

  @ApiProperty({ description: 'شناسه‌ی پایدار بلوک' })
  @IsString()
  @MinLength(1)
  @MaxLength(128)
  id!: string;

  @ApiProperty({ description: 'پراپس‌های بلوک', type: Object })
  @IsObject()
  props!: Record<string, unknown>;

  @ApiPropertyOptional({ type: CmsBlockStyleDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CmsBlockStyleDto)
  style?: CmsBlockStyleDto;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  hidden?: boolean;

  @ApiPropertyOptional({ type: [CmsBlockDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsBlockDto)
  children?: CmsBlockDto[];
}

export class CmsDocumentDto implements CmsDocument {
  @ApiProperty({ enum: ['xennic-cms/v1', 'xennic-cms/v2'] })
  @IsIn(['xennic-cms/v1', 'xennic-cms/v2'])
  schema!: 'xennic-cms/v1' | 'xennic-cms/v2';

  @ApiPropertyOptional({ type: Object })
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;

  @ApiProperty({ type: [CmsBlockDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsBlockDto)
  blocks!: CmsBlockDto[];
}

export class UpsertCmsContentDto {
  @ApiProperty({ example: 'landing/hero' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  slot!: string;

  @ApiProperty({ example: 'fa' })
  @IsString()
  @MinLength(2)
  @MaxLength(8)
  locale!: string;

  @ApiProperty({ type: CmsDocumentDto })
  @ValidateNested()
  @Type(() => CmsDocumentDto)
  document!: CmsDocumentDto;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}

export class PatchCmsContentDto {
  @ApiProperty({ type: CmsDocumentDto })
  @ValidateNested()
  @Type(() => CmsDocumentDto)
  document!: CmsDocumentDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  publish?: boolean;
}

export class CmsContentResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() slot!: string;
  @ApiProperty() locale!: string;
  @ApiProperty() version!: number;
  @ApiProperty() published!: boolean;
  @ApiPropertyOptional({ nullable: true }) publishedAt!: Date | null;
  @ApiPropertyOptional({ nullable: true }) updatedBy!: string | null;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty({ type: CmsDocumentDto })
  document!: CmsDocumentDto;

  static from(entity: import('../../domain/entities/cms-content.entity.js').CmsContentEntity) {
    const dto = new CmsContentResponseDto();
    dto.id = entity.id;
    dto.slot = entity.slot;
    dto.locale = entity.locale;
    dto.version = entity.version;
    dto.published = entity.isPublished;
    dto.publishedAt = entity.publishedAt;
    dto.updatedBy = entity.updatedBy;
    dto.updatedAt = entity.updatedAt;
    dto.document = entity.document;
    return dto;
  }
}

export class CmsMediaUploadDto {
  @ApiPropertyOptional({ description: 'slot اختیاری برای دسته‌بندی رسانه (مثلاً landing)' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  slot?: string;
}

export class CmsMediaResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() url!: string;
  @ApiProperty() mimeType!: string;
  @ApiProperty() size!: number;
  @ApiProperty() originalName!: string;

  static from(data: {
    id: string;
    url: string;
    mimeType: string;
    size: number;
    originalName: string;
  }): CmsMediaResponseDto {
    const dto = new CmsMediaResponseDto();
    Object.assign(dto, data);
    return dto;
  }
}

export class CmsPublishParamsDto {
  @IsUUID() @IsOptional() id?: string;
}
