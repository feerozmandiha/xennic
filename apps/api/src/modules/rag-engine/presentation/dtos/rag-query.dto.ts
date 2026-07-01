import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
  Min,
  Max,
  MinLength,
} from 'class-validator';

export class RagQueryDto {
  @ApiProperty({ description: 'Engineering question' })
  @IsString()
  @MinLength(3)
  question!: string;

  @ApiPropertyOptional({ description: 'Filter by knowledge tiers' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tiers?: string[];

  @ApiPropertyOptional({ description: 'Filter by languages' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ description: 'Filter by category IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  categoryIds?: string[];

  @ApiPropertyOptional({ description: 'Filter by ontology entity IDs' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ontologyEntityIds?: string[];

  @ApiPropertyOptional({ description: 'Filter by version status' })
  @IsOptional()
  @IsString()
  versionStatus?: string;

  @ApiPropertyOptional({ description: 'Minimum authority score (0-1)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  minAuthorityScore?: number;

  @ApiPropertyOptional({ description: 'Max tokens for context', default: 4000 })
  @IsOptional()
  @IsNumber()
  @Min(256)
  @Max(32000)
  maxTokens?: number;

  @ApiPropertyOptional({ description: 'Top K results', default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  topK?: number;

  @ApiPropertyOptional({ description: 'Include evidence chain in response', default: false })
  @IsOptional()
  @IsBoolean()
  includeEvidenceChain?: boolean;
}

export class CitationDto {
  @ApiProperty()
  statement!: string;

  @ApiProperty()
  evidence!: {
    documentXid: string;
    documentTitle: string;
    version: number;
    section?: string;
    page?: number;
    chunkId?: string;
    paragraph?: number;
  };

  @ApiProperty()
  confidence!: number;

  @ApiProperty()
  authorityScore!: number;

  @ApiProperty()
  sourceTier!: string;

  @ApiProperty()
  citationChain!: string[];
}

export class RagResponseDto {
  @ApiProperty()
  success!: boolean;

  @ApiProperty()
  data!: {
    answer: string;
    citations: CitationDto[];
    confidence: { overall: number; factors: Record<string, number> };
    evidenceChain?: unknown;
    metrics: Record<string, number>;
    traceId: string;
  };

  static fromDomain(domain: any) {
    return {
      success: true,
      data: {
        answer: domain.answer,
        citations: domain.citations,
        confidence: domain.confidence,
        evidenceChain: domain.evidenceChain,
        metrics: domain.metrics,
        traceId: domain.traceId,
      },
    };
  }
}

export class RagErrorDto {
  @ApiProperty({ default: false })
  success!: boolean;

  @ApiProperty()
  error!: { message: string; code?: string; details?: unknown };
}
