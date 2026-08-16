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
import { Type } from 'class-transformer';
import type { CmsBlock, CmsDocument } from '../../domain/entities/cms-content.entity.js';

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

  @ApiPropertyOptional({ type: [CmsBlockDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsBlockDto)
  children?: CmsBlockDto[];
}

export class CmsDocumentDto implements CmsDocument {
  @ApiProperty({ enum: ['xennic-cms/v1'] })
  @IsIn(['xennic-cms/v1'])
  schema!: 'xennic-cms/v1';

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
