import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

const CONTAINS_NON_WHITESPACE = /\S/;
const CONTAINS_LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;

export class GraphSearchQueryDto {
  @ApiProperty({ maxLength: 500 })
  @IsString()
  @Matches(CONTAINS_NON_WHITESPACE)
  @Matches(CONTAINS_LETTER_OR_NUMBER)
  @MaxLength(500)
  query!: string;
}

export class NeighborQueryDto {
  @ApiPropertyOptional({ enum: ['in', 'out', 'both'], default: 'both' })
  @IsOptional()
  @IsIn(['in', 'out', 'both'])
  direction?: 'in' | 'out' | 'both';

  @ApiPropertyOptional({ maxLength: 100 })
  @IsOptional()
  @IsString()
  @Matches(CONTAINS_NON_WHITESPACE)
  @MaxLength(100)
  edgeType?: string;
}

export class SubgraphQueryDto {
  @ApiProperty({ description: 'Comma-separated graph node IDs', maxLength: 4000 })
  @IsString()
  @Matches(CONTAINS_NON_WHITESPACE)
  @MaxLength(4000)
  nodeIds!: string;
}
