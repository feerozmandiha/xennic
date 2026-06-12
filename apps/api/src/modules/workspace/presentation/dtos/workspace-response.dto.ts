import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceEntity } from '../../domain/entities/workspace.entity.js';

export class WorkspaceResponseDto {
  @ApiProperty({ description: 'Workspace unique identifier (UUIDv7)', example: '464e54bb-5e81-426f-ab75-39226f6f8980' })
  id: string;

  @ApiProperty({ description: 'Unique workspace code (auto-generated)', example: 'ENGINEERING_WORKSPACE1_7LGG' })
  code: string;

  @ApiProperty({ description: 'Workspace display name', example: 'Engineering Workspace' })
  name: string;

  @ApiProperty({ description: 'ID of user who created the workspace', example: 'user-123' })
  createdBy: string;

  @ApiProperty({ description: 'ID of last user who updated the workspace', nullable: true, example: 'user-456' })
  updatedBy: string | null;

  @ApiProperty({ description: 'Creation timestamp', example: '2026-06-03T02:59:44.524Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp', example: '2026-06-03T02:59:44.524Z' })
  updatedAt: Date;

  @ApiProperty({ description: 'Soft delete status', example: false })
  isDeleted: boolean;

  constructor(workspace: WorkspaceEntity) {
    this.id = workspace.id;
    this.code = workspace.code;
    this.name = workspace.name;
    this.createdBy = workspace.createdBy;
    this.updatedBy = workspace.updatedBy;
    this.createdAt = workspace.createdAt;
    this.updatedAt = workspace.updatedAt;
    this.isDeleted = workspace.isDeleted();
  }

  static fromEntity(workspace: WorkspaceEntity): WorkspaceResponseDto {
    return new WorkspaceResponseDto(workspace);
  }

  static fromEntities(workspaces: WorkspaceEntity[]): WorkspaceResponseDto[] {
    return workspaces.map((workspace) => new WorkspaceResponseDto(workspace));
  }
}