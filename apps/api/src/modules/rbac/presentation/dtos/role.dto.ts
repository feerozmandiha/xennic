import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, MinLength, Matches, IsArray, IsUUID } from 'class-validator';
import { RoleEntity } from '../../domain/entities/role.entity.js';

// ─── Request DTOs ────────────────────────────────────────────────────────────

export class CreateRoleDto {
  @ApiProperty({ example: 'Engineer', description: 'Role display name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  name!: string;

  @ApiProperty({ example: 'ENGINEER', description: 'Unique role slug (UPPERCASE_UNDERSCORE)' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[A-Z_]+$/, { message: 'Slug must contain only uppercase letters and underscores' })
  slug!: string;

  @ApiProperty({ example: 'Can perform engineering calculations', description: 'Role description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateRoleDto {
  @ApiProperty({ example: 'Senior Engineer', description: 'Role display name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({ example: 'Advanced engineering access', description: 'Role description', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class AssignPermissionsDto {
  @ApiProperty({
    example: ['uuid-1', 'uuid-2'],
    description: 'Array of permission UUIDs to assign to the role',
    type: [String],
  })
  @IsArray()
  @IsUUID('all', { each: true })
  permissionIds!: string[];
}

// ─── Response DTO ─────────────────────────────────────────────────────────────

export class RoleResponseDto {
  @ApiProperty({ description: 'Role unique identifier (UUIDv7)' })
  id!: string;

  @ApiProperty({ description: 'Role display name' })
  name!: string;

  @ApiProperty({ description: 'Unique role slug' })
  slug!: string;

  @ApiProperty({ description: 'Role description', nullable: true })
  description!: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt!: Date;

  static fromEntity(role: RoleEntity): RoleResponseDto {
    const dto = new RoleResponseDto();
    dto.id          = role.id;
    dto.name        = role.name;
    dto.slug        = role.slug;
    dto.description = role.description;
    dto.createdAt   = role.createdAt;
    dto.updatedAt   = role.updatedAt;
    return dto;
  }
}
