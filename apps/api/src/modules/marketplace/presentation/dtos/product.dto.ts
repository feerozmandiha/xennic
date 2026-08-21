import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SUPPORTED_PRODUCT_LOCALES } from '../../domain/value-objects/product-translation.vo.js';

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
