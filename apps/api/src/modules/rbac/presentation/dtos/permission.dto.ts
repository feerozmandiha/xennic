import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';
import { PermissionEntity } from '../../domain/entities/permission.entity.js';

// ─── Request DTOs ────────────────────────────────────────────────────────────

export class CreatePermissionDto {
  @ApiProperty({ example: 'Read Users', description: 'Permission display name' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    example: 'users.read',
    description: 'Unique permission slug in format: domain.action',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]+\.[a-z_]+$/, {
    message: 'Slug must be in format: domain.action (e.g. users.read)',
  })
  slug!: string;

  @ApiProperty({
    example: 'identity',
    description:
      'Domain name: identity | workspace | projects | engineering | ai | marketplace | storage | api | admin',
  })
  @IsString()
  @IsNotEmpty()
  domain!: string;

  @ApiProperty({ example: 'Can read user information', description: 'Permission description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

// ─── Response DTO ─────────────────────────────────────────────────────────────

export class PermissionResponseDto {
  @ApiProperty({ description: 'Permission unique identifier (UUIDv7)' })
  id!: string;

  @ApiProperty({ description: 'Permission display name' })
  name!: string;

  @ApiProperty({ description: 'Unique permission slug (domain.action)' })
  slug!: string;

  @ApiProperty({ description: 'Permission description', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Domain name' })
  domain!: string;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  static fromEntity(permission: PermissionEntity): PermissionResponseDto {
    const dto = new PermissionResponseDto();
    dto.id          = permission.id;
    dto.name        = permission.name;
    dto.slug        = permission.slug;
    dto.description = permission.description;
    dto.domain      = permission.domain;
    dto.createdAt   = permission.createdAt;
    return dto;
  }
}
