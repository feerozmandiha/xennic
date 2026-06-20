import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsOptional, MaxLength, MinLength } from 'class-validator';
import type { FeatureFlagEntity } from '../../domain/entities/feature-flag.entity.js';

export class CreateFeatureFlagDto {
  @ApiProperty({ description: 'Unique name (alphanumeric, underscores allowed)', example: 'ai_advanced_chat' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Human-readable description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'Enable immediately', default: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiPropertyOptional({ description: 'Scope to a plan ID (null = global)' })
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiPropertyOptional({ description: 'Scope to a workspace ID (overrides plan scope)' })
  @IsOptional()
  @IsString()
  workspaceId?: string;
}

export class UpdateFeatureFlagDto {
  @ApiPropertyOptional({ description: 'Updated description' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ description: 'New plan scope (null = remove plan scope)' })
  @IsOptional()
  planId?: string | null;

  @ApiPropertyOptional({ description: 'New workspace scope (null = remove workspace scope)' })
  @IsOptional()
  workspaceId?: string | null;
}

export class ToggleFeatureFlagDto {
  @ApiProperty({ description: 'New enabled state' })
  @IsBoolean()
  enabled!: boolean;
}

export class FeatureFlagResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) description!: string | null;
  @ApiProperty() enabled!: boolean;
  @ApiProperty({ nullable: true }) planId!: string | null;
  @ApiProperty({ nullable: true }) workspaceId!: string | null;
  @ApiProperty() scope!: string;
  @ApiProperty() createdAt!: Date;

  static fromEntity(f: FeatureFlagEntity): FeatureFlagResponseDto {
    const dto = new FeatureFlagResponseDto();
    dto.id = f.id;
    dto.name = f.name;
    dto.description = f.description;
    dto.enabled = f.enabled;
    dto.planId = f.planId;
    dto.workspaceId = f.workspaceId;
    dto.scope = f.scope;
    dto.createdAt = f.createdAt;
    return dto;
  }
}
