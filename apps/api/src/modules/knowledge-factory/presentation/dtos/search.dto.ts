import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
  IsArray,
  IsNumber,
  Min as MinNumber,
  Max as MaxNumber,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class SearchQueryDto {
  @ApiProperty({ description: 'Search query text', minLength: 2 })
  @IsString()
  @MinLength(2)
  query!: string;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;

  @ApiPropertyOptional({ description: 'Filter by source types', isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  types?: string[];

  @ApiPropertyOptional({ description: 'Minimum score threshold (0-1)', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @MinNumber(0)
  @MaxNumber(1)
  minScore?: number;
}

export class CitationDto {
  @ApiProperty({ description: 'Name of the source document' })
  sourceDocumentName!: string;

  @ApiProperty({ description: 'Excerpt of the matching chunk text' })
  chunkTextExcerpt!: string;

  @ApiProperty({ description: 'Page reference if available', nullable: true })
  pageReference!: string | null;

  @ApiProperty({ description: 'Relevance score for this citation' })
  relevanceScore!: number;
}

export class SearchResultItemDto {
  @ApiProperty()
  chunkId!: string;

  @ApiProperty()
  documentId!: string;

  @ApiProperty()
  documentName!: string;

  @ApiProperty()
  excerpt!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty()
  confidence!: number;

  @ApiProperty()
  metadata!: Record<string, unknown>;

  @ApiProperty()
  sourceType!: string;

  @ApiProperty({ type: CitationDto })
  citation!: CitationDto;
}

export class SearchResponseDto {
  @ApiProperty({ type: [SearchResultItemDto] })
  results!: SearchResultItemDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  query!: string;

  @ApiProperty()
  took!: number;

  static fromDomain(data: {
    results: SearchResultItemDto[];
    total: number;
    query: string;
    took: number;
  }): SearchResponseDto {
    const dto = new SearchResponseDto();
    dto.results = data.results;
    dto.total = data.total;
    dto.query = data.query;
    dto.took = data.took;
    return dto;
  }
}
