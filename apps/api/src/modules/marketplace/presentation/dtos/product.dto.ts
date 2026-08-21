import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SUPPORTED_PRODUCT_LOCALES } from '../../domain/value-objects/product-translation.vo.js';
import { SUPPORTED_IMAGE_MIME_TYPES } from '../../domain/value-objects/product-image.vo.js';
import { MAX_PRODUCT_IMAGES } from '../../domain/value-objects/product-gallery.vo.js';

/** ورودی افزودن یک تصویر به آلبوم محصول. */
export class CreateProductImageDto {
  @ApiPropertyOptional({
    description: 'شناسهٔ تصویر موجود — هنگام جایگزینی آلبوم برای حفظ همان ردیف ارسال می‌شود',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  id?: string;

  @ApiProperty({
    example: '/api/v1/storage/files/6f1c…/download',
    description: 'آدرس مطلق http(s) یا مسیر نسبی از ریشه',
  })
  @IsString()
  @MaxLength(2048)
  url!: string;

  @ApiPropertyOptional({ example: 'کابل مسی ۳۵ روی قرقره', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altFa?: string;

  @ApiPropertyOptional({ example: 'Copper cable on a drum', maxLength: 300 })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  altEn?: string;

  @ApiPropertyOptional({ description: 'تصویر شاخص محصول', default: false })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ enum: SUPPORTED_IMAGE_MIME_TYPES })
  @IsOptional()
  @IsIn(SUPPORTED_IMAGE_MIME_TYPES as unknown as string[])
  mimeType?: string;

  @ApiPropertyOptional({ description: 'اندازه فایل به بایت', minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  fileSize?: number;
}

/** ویرایش یک تصویر موجود — همهٔ فیلدها اختیاری‌اند. */
export class UpdateProductImageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  url?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  sortOrder?: number;

  @ApiPropertyOptional({ enum: SUPPORTED_IMAGE_MIME_TYPES })
  @IsOptional()
  @IsIn(SUPPORTED_IMAGE_MIME_TYPES as unknown as string[])
  mimeType?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  fileSize?: number;
}

/** چیدمان مجدد آلبوم — فهرست باید شامل همهٔ تصاویر فعلی باشد. */
export class ReorderProductImagesDto {
  @ApiProperty({ type: [String], description: 'شناسهٔ تصاویر به ترتیب دلخواه؛ اولی شاخص می‌شود' })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(MAX_PRODUCT_IMAGES)
  @IsString({ each: true })
  imageIds!: string[];
}

/** Body of `PUT /products/:id/translations/:locale` — locale comes from the path. */
export class UpsertProductTranslationDto {
  @ApiProperty({ example: 'کابل مسی ۳۵ میلی‌متر مربع' })
  @IsString()
  @MaxLength(200)
  title!: string;

  @ApiPropertyOptional({ example: 'کابل مسی تک‌رشته با عایق XLPE' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  description?: string;
}

/** Inline translation entry used by product create/update payloads. */
export class ProductTranslationDto extends UpsertProductTranslationDto {
  @ApiProperty({ enum: SUPPORTED_PRODUCT_LOCALES, example: 'fa' })
  @IsString()
  @IsIn(SUPPORTED_PRODUCT_LOCALES as unknown as string[])
  locale!: string;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  vendorId!: string;

  @ApiProperty({ example: 'digital' })
  @IsString()
  type!: string;

  @ApiPropertyOptional({ example: 'cable' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: { cable_size_mm2: 35, current_rating_a: 150, voltage_rating_v: 1000 },
  })
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional({ example: 'TRF-1000-3P' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 4900000 })
  @IsNumber()
  @Type(() => Number)
  price!: number;

  @ApiPropertyOptional({ default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    type: [ProductTranslationDto],
    description: 'ترجمه‌های محصول (fa / en) — حداکثر یک ورودی برای هر زبان',
    example: [
      { locale: 'fa', title: 'کابل مسی ۳۵', description: 'عایق XLPE' },
      { locale: 'en', title: 'Copper cable 35mm²', description: 'XLPE insulated' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(SUPPORTED_PRODUCT_LOCALES.length)
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations?: ProductTranslationDto[];

  @ApiPropertyOptional({
    type: [CreateProductImageDto],
    description: `آلبوم تصاویر محصول — حداکثر ${MAX_PRODUCT_IMAGES} تصویر`,
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PRODUCT_IMAGES)
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  specifications?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'archived'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived'] as const)
  status?: 'active' | 'inactive' | 'archived';

  @ApiPropertyOptional({
    type: [ProductTranslationDto],
    description: 'در صورت ارسال، کل مجموعه ترجمه‌ها جایگزین می‌شود',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(SUPPORTED_PRODUCT_LOCALES.length)
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations?: ProductTranslationDto[];

  @ApiPropertyOptional({
    type: [CreateProductImageDto],
    description: 'در صورت ارسال، کل آلبوم تصاویر جایگزین می‌شود',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(MAX_PRODUCT_IMAGES)
  @ValidateNested({ each: true })
  @Type(() => CreateProductImageDto)
  images?: CreateProductImageDto[];
}

export class ProductSearchQueryDto {
  @ApiPropertyOptional({ enum: SUPPORTED_PRODUCT_LOCALES, default: 'fa' })
  @IsOptional()
  @IsIn(SUPPORTED_PRODUCT_LOCALES as unknown as string[])
  locale?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  vendorId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'archived'] })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'archived'] as const)
  status?: 'active' | 'inactive' | 'archived';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  limit?: string;
}

export class SuggestProductsDto {
  @ApiProperty({ example: 'CABLE-001' })
  @IsString()
  calculationType!: string;

  @ApiProperty({ example: { recommended_cable_size: 35, corrected_ampacity: 150 } })
  @IsObject()
  resultParams!: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  limit?: string;
}
