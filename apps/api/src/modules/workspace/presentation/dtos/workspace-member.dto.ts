import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { WorkspaceMemberEntity, type WorkspaceMemberRole } from '../../domain/entities/workspace-member.entity.js';
import { WorkspaceInvitationEntity } from '../../domain/entities/workspace-invitation.entity.js';

const ROLES = ['OWNER', 'ADMIN', 'EDITOR', 'KNOWLEDGE_WRITER', 'REVIEWER', 'ENGINEER', 'CONSULTANT', 'MEMBER', 'VIEWER'] as const;

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class AddMemberDto {
  @ApiProperty({ example: 'user-uuid', description: 'UUID of the user to add' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ enum: ROLES, example: 'ENGINEER' })
  @IsEnum(ROLES)
  role!: WorkspaceMemberRole;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: ['ADMIN', 'ENGINEER', 'CONSULTANT', 'MEMBER', 'VIEWER'], example: 'ADMIN' })
  @IsEnum(['ADMIN', 'ENGINEER', 'CONSULTANT', 'MEMBER', 'VIEWER'])
  role!: WorkspaceMemberRole;
}

export class InviteMemberDto {
  @ApiProperty({ example: 'engineer@company.com', description: 'Email address to invite' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ enum: ['ADMIN', 'ENGINEER', 'CONSULTANT', 'MEMBER', 'VIEWER'], example: 'ENGINEER' })
  @IsEnum(['ADMIN', 'ENGINEER', 'CONSULTANT', 'MEMBER', 'VIEWER'])
  role!: WorkspaceMemberRole;
}

export class AcceptInvitationDto {
  @ApiProperty({ description: 'Invitation token received via email' })
  @IsNotEmpty()
  token!: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class WorkspaceMemberResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty() userId!: string;
  @ApiProperty({ enum: ROLES }) role!: string;
  @ApiProperty() joinedAt!: Date;

  static fromEntity(m: WorkspaceMemberEntity): WorkspaceMemberResponseDto {
    const dto      = new WorkspaceMemberResponseDto();
    dto.id         = m.id;
    dto.workspaceId = m.workspaceId;
    dto.userId     = m.userId;
    dto.role       = m.role;
    dto.joinedAt   = m.joinedAt;
    return dto;
  }
}

export class WorkspaceInvitationResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty() email!: string;
  @ApiProperty({ enum: ROLES }) role!: string;
  @ApiProperty() invitedBy!: string;
  @ApiProperty() status!: string;
  @ApiProperty() expiresAt!: Date;
  @ApiProperty() createdAt!: Date;

  static fromEntity(inv: WorkspaceInvitationEntity): WorkspaceInvitationResponseDto {
    const dto        = new WorkspaceInvitationResponseDto();
    dto.id           = inv.id;
    dto.workspaceId  = inv.workspaceId;
    dto.email        = inv.email;
    dto.role         = inv.role;
    dto.invitedBy    = inv.invitedBy;
    dto.status       = inv.status;
    dto.expiresAt    = inv.expiresAt;
    dto.createdAt    = inv.createdAt;
    return dto;
  }
}
