import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';
import type { ProjectFile } from '../../domain/entities/project-file.entity.js';

export class AttachFileDto {
  @ApiProperty({ example: 'file-uuid', description: 'File UUID to attach' })
  @IsUUID()
  fileId!: string;
}

export class ProjectFileResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() projectId!: string;
  @ApiProperty() fileId!: string;
  @ApiProperty() addedBy!: string;
  @ApiProperty() createdAt!: Date;

  static fromEntity(pf: ProjectFile): ProjectFileResponseDto {
    const dto = new ProjectFileResponseDto();
    dto.id = pf.id;
    dto.projectId = pf.projectId;
    dto.fileId = pf.fileId;
    dto.addedBy = pf.addedBy;
    dto.createdAt = pf.createdAt;
    return dto;
  }
}
