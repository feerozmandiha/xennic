import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

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

  @ApiPropertyOptional({ example: { cable_size_mm2: 35, current_rating_a: 150, voltage_rating_v: 1000 } })
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
}

export class ProductSearchQueryDto {
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

export class ProductTranslationDto {
  @ApiProperty()
  @IsString()
  locale!: string;

  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
