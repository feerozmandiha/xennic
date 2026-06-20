import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { SearchResultEntity, SearchResultType } from '../../domain/entities/search-result.entity.js';

export class SearchResultDto {
  @ApiProperty({ enum: ['project', 'standard', 'conversation', 'article', 'file', 'notification'] })
  type!: SearchResultType;

  @ApiProperty()
  id!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  description!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  workspaceId!: string | null;

  @ApiProperty()
  createdAt!: string | null;

  static fromEntity(entity: SearchResultEntity): SearchResultDto {
    const dto = new SearchResultDto();
    dto.type = entity.type;
    dto.id = entity.id;
    dto.title = entity.title;
    dto.description = entity.description;
    dto.url = entity.url;
    dto.workspaceId = entity.workspaceId;
    dto.createdAt = entity.createdAt?.toISOString() ?? null;
    return dto;
  }
}

export class SearchResponseDto {
  @ApiProperty({ type: [SearchResultDto] })
  items!: SearchResultDto[];

  @ApiProperty()
  total!: number;
}

export class SearchQueryDto {
  @ApiProperty({ description: 'Search query (min 2 characters)' })
  q!: string;

  @ApiPropertyOptional({ description: 'Filter by type(s)', isArray: true })
  types?: SearchResultType[];

  @ApiPropertyOptional({ default: 1 })
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  limit?: number;
}
