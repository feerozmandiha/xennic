import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsIn, MinLength } from 'class-validator';
import { StandardEntity } from '../../domain/entities/standard.entity.js';

export class CreateStandardDto {
  @ApiProperty({ example: 'IEC-60909-0', description: 'Standard code (unique)' })
  @IsString() @MinLength(1)
  code!: string;

  @ApiProperty({ example: 'Short-circuit currents in three-phase AC systems', description: 'Standard title' })
  @IsString() @MinLength(1)
  title!: string;

  @ApiProperty({ example: 'IEC', description: 'Standards organization' })
  @IsString() @MinLength(1)
  organization!: string;

  @ApiProperty({ example: '2016', description: 'Standard version/year' })
  @IsString() @MinLength(1)
  version!: string;

  @ApiPropertyOptional({ example: '2020-01-15', description: 'Publication date' })
  @IsOptional()
  publishedAt?: string;

  @ApiPropertyOptional({ example: 'active', enum: ['active', 'draft', 'superseded'] })
  @IsOptional() @IsIn(['active', 'draft', 'superseded'])
  status?: string;
}

export class UpdateStandardDto {
  @ApiPropertyOptional({ example: 'IEC-60909-0' })
  @IsOptional() @IsString() @MinLength(1)
  code?: string;

  @ApiPropertyOptional({ example: 'Short-circuit currents in three-phase AC systems' })
  @IsOptional() @IsString() @MinLength(1)
  title?: string;

  @ApiPropertyOptional({ example: 'IEC' })
  @IsOptional() @IsString() @MinLength(1)
  organization?: string;

  @ApiPropertyOptional({ example: '2016' })
  @IsOptional() @IsString() @MinLength(1)
  version?: string;

  @ApiPropertyOptional()
  @IsOptional()
  publishedAt?: string;

  @ApiPropertyOptional({ enum: ['active', 'draft', 'superseded'] })
  @IsOptional() @IsIn(['active', 'draft', 'superseded'])
  status?: string;
}

export class StandardSearchQueryDto {
  @ApiPropertyOptional({ description: 'Search query for code or title' })
  @IsOptional() @IsString()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by organization' })
  @IsOptional() @IsString()
  organization?: string;

  @ApiPropertyOptional({ enum: ['active', 'draft', 'superseded'] })
  @IsOptional() @IsIn(['active', 'draft', 'superseded'])
  status?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional() @IsString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional() @IsString()
  limit?: string;
}

export class StandardResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() code!: string;
  @ApiProperty() title!: string;
  @ApiProperty() organization!: string;
  @ApiProperty() version!: string;
  @ApiProperty({ nullable: true }) publishedAt!: string | null;
  @ApiProperty() status!: string;

  static fromEntity(entity: StandardEntity): StandardResponseDto {
    return {
      id: entity.id,
      code: entity.code,
      title: entity.title,
      organization: entity.organization,
      version: entity.version,
      publishedAt: entity.publishedAt?.toISOString() ?? null,
      status: entity.status,
    };
  }

  static fromEntities(entities: StandardEntity[]): StandardResponseDto[] {
    return entities.map(e => StandardResponseDto.fromEntity(e));
  }
}

export class LinkStandardDto {
  @ApiProperty({ description: 'Standard ID to link' })
  @IsString() @MinLength(1)
  standardId!: string;
}
