import { ApiProperty } from '@nestjs/swagger';
import {
  IsString, IsNotEmpty, IsOptional, MinLength, MaxLength,
  IsEnum, IsDateString, IsUUID,
} from 'class-validator';
// ERROR FIX TS1272: type aliases used in decorated class fields must be `import type`
import {
  ProjectEntity,
  ProjectMember,
  ProjectNote,
  type ProjectStatus,
  type ProjectMemberRole,
} from '../../domain/entities/project.entity.js';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class CreateProjectDto {
  @ApiProperty({ example: 'Substation Upgrade 2026', description: 'Project name' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(150)
  name!: string;

  @ApiProperty({ example: 'Upgrade of 63kV substation', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ example: 'active', required: false, enum: ['active','completed','archived','cancelled'] })
  @IsOptional()
  @IsEnum(['active', 'completed', 'archived', 'cancelled'])
  status?: string;

  @ApiProperty({ example: '2026-07-01', required: false, description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ example: '2026-12-31', required: false, description: 'ISO date string' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class UpdateProjectDto {
  @ApiProperty({ example: 'Updated Project Name', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @ApiProperty({ example: 'Updated description', required: false, nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    enum: ['active', 'completed', 'archived', 'cancelled'],
    example: 'active',
    required: false,
  })
  @IsOptional()
  @IsEnum(['active', 'completed', 'archived', 'cancelled'])
  status?: ProjectStatus;

  @ApiProperty({ example: '2026-07-01', required: false, nullable: true })
  @IsOptional()
  @IsDateString()
  startDate?: string | null;

  @ApiProperty({ example: '2026-12-31', required: false, nullable: true })
  @IsOptional()
  @IsDateString()
  endDate?: string | null;
}

export class AddProjectMemberDto {
  @ApiProperty({ example: 'user-uuid', description: 'User UUID to add' })
  @IsUUID()
  userId!: string;

  @ApiProperty({
    enum: ['owner', 'admin', 'engineer', 'viewer'],
    example: 'engineer',
    description: 'Role within the project',
  })
  @IsEnum(['owner', 'admin', 'engineer', 'viewer'])
  role!: ProjectMemberRole;
}

export class AddProjectNoteDto {
  @ApiProperty({ example: 'Site survey completed successfully.', description: 'Note content' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(5000)
  content!: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class ProjectMemberResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() projectId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() role!: string;
  @ApiProperty() joinedAt!: Date;

  static fromEntity(m: ProjectMember): ProjectMemberResponseDto {
    const dto        = new ProjectMemberResponseDto();
    dto.id           = m.id;
    dto.projectId    = m.projectId;
    dto.userId       = m.userId;
    dto.role         = m.role;
    dto.joinedAt     = m.joinedAt;
    return dto;
  }
}

export class ProjectNoteResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() projectId!: string;
  @ApiProperty() content!: string;
  @ApiProperty() createdBy!: string;
  @ApiProperty() createdAt!: Date;

  static fromEntity(n: ProjectNote): ProjectNoteResponseDto {
    const dto      = new ProjectNoteResponseDto();
    dto.id         = n.id;
    dto.projectId  = n.projectId;
    dto.content    = n.content;
    dto.createdBy  = n.createdBy;
    dto.createdAt  = n.createdAt;
    return dto;
  }
}

export class ProjectResponseDto {
  @ApiProperty({ description: 'Project unique identifier (UUIDv7)' })
  id!: string;

  @ApiProperty({ description: 'Workspace ID (tenant isolation)' })
  workspaceId!: string;

  @ApiProperty() name!: string;

  @ApiProperty({ nullable: true }) description!: string | null;

  @ApiProperty({ enum: ['active', 'completed', 'archived', 'cancelled'] })
  status!: string;

  @ApiProperty({ nullable: true }) startDate!: Date | null;
  @ApiProperty({ nullable: true }) endDate!: Date | null;

  @ApiProperty() createdBy!: string;
  @ApiProperty({ nullable: true }) updatedBy!: string | null;

  @ApiProperty() createdAt!: Date;
  @ApiProperty() updatedAt!: Date;
  @ApiProperty() isDeleted!: boolean;

  static fromEntity(p: ProjectEntity): ProjectResponseDto {
    const dto        = new ProjectResponseDto();
    dto.id           = p.id;
    dto.workspaceId  = p.workspaceId;
    dto.name         = p.name;
    dto.description  = p.description;
    dto.status       = p.status;
    dto.startDate    = p.startDate;
    dto.endDate      = p.endDate;
    dto.createdBy    = p.createdBy;
    dto.updatedBy    = p.updatedBy;
    dto.createdAt    = p.createdAt;
    dto.updatedAt    = p.updatedAt;
    dto.isDeleted    = p.isDeleted();
    return dto;
  }
}
