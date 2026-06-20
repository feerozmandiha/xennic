import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsDateString, MaxLength, MinLength } from 'class-validator';
import type { ApiKeyEntity } from '../../domain/entities/api-key.entity.js';

export class CreateApiKeyDto {
  @ApiProperty({ description: 'Name for the API key', example: 'Production CI/CD' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ description: 'Expiration date (ISO 8601)', example: '2027-06-20T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class ApiKeyResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty() name!: string;
  @ApiProperty() maskedKey!: string;
  @ApiProperty({ enum: ['active', 'revoked', 'expired'] }) status!: string;
  @ApiProperty({ nullable: true }) lastUsedAt!: Date | null;
  @ApiProperty({ nullable: true }) expiresAt!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ nullable: true }) rawKey?: string;

  static fromEntity(k: ApiKeyEntity, rawKey?: string): ApiKeyResponseDto {
    const dto = new ApiKeyResponseDto();
    dto.id = k.id;
    dto.workspaceId = k.workspaceId;
    dto.name = k.name;
    dto.maskedKey = k.maskedKey;
    dto.status = k.status;
    dto.lastUsedAt = k.lastUsedAt;
    dto.expiresAt = k.expiresAt;
    dto.createdAt = k.createdAt;
    dto.isActive = k.isActive();
    dto.rawKey = rawKey;
    return dto;
  }
}

export class ValidateApiKeyResponseDto {
  @ApiProperty() valid!: boolean;
  @ApiProperty({ nullable: true }) workspaceId?: string;
  @ApiProperty({ nullable: true }) keyName?: string;
}
