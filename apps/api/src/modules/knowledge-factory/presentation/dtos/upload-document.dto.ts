import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { type DocumentStatus } from '../../domain/value-objects/document-status.vo.js';

export class UploadDocumentDto {
  @ApiProperty({ description: 'Raw file to upload' })
  @IsString()
  @IsNotEmpty()
  file!: string;

  @ApiPropertyOptional({ description: 'Optional metadata overrides' })
  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class UpdateDocumentStatusDto {
  @ApiProperty({
    enum: [
      'uploaded',
      'classified',
      'parsing',
      'extracted',
      'chunking',
      'embedding',
      'publishing',
      'published',
      'failed',
    ],
  })
  @IsEnum([
    'uploaded',
    'classified',
    'parsing',
    'extracted',
    'chunking',
    'embedding',
    'publishing',
    'published',
    'failed',
  ])
  status!: DocumentStatus;
}

export class ClassifyDocumentDto {
  @ApiProperty({
    enum: [
      'general',
      'power',
      'cable',
      'transformer',
      'protection',
      'lighting',
      'earthing',
      'solar',
      'power_quality',
    ],
  })
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  standard?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  equipmentType?: string;

  @ApiPropertyOptional({ minimum: 0, maximum: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  confidence?: number;
}

export class PipelineTriggerDto {
  @ApiProperty({ enum: ['classify', 'parse', 'chunk', 'embed', 'publish'] })
  @IsString()
  @IsNotEmpty()
  stage!: string;
}

export class DocumentQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  documentType?: string;
}

export class SearchQueryDto {
  @ApiPropertyOptional({ minLength: 2 })
  @IsOptional()
  @IsString()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ minimum: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, default: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  domain?: string;
}

export class SearchResultDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  filename!: string;

  @ApiProperty()
  originalName!: string;

  @ApiProperty()
  documentType!: string;

  @ApiProperty()
  status!: DocumentStatus;

  @ApiPropertyOptional()
  snippet?: string;

  @ApiPropertyOptional()
  score?: number;
}
