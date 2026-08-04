import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import type { FileVersionEntity } from '../../domain/entities/file-version.entity.js';

export class FileVersionResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() fileId!: string;
  @ApiProperty() version!: number;
  @ApiProperty({ description: 'Object key inside MinIO (without workspace prefix)' })
  path!: string;
  @ApiProperty() size!: number;
  @ApiProperty() sizeHuman!: string;
  @ApiProperty() mimeType!: string;
  @ApiProperty() originalName!: string;
  @ApiProperty({ nullable: true }) checksum!: string | null;
  @ApiProperty({ nullable: true }) changeReason!: string | null;
  @ApiProperty({ nullable: true }) createdBy!: string | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() isInitialVersion!: boolean;
  @ApiProperty() isLatest!: boolean;
  @ApiPropertyOptional({
    description: 'Presigned download URL (only on detail endpoints)',
  })
  downloadUrl?: string;

  static fromEntity(
    v: FileVersionEntity,
    options?: { isLatest?: boolean; downloadUrl?: string },
  ): FileVersionResponseDto {
    const dto = new FileVersionResponseDto();
    dto.id = v.id;
    dto.fileId = v.fileId;
    dto.version = v.version;
    dto.path = v.path;
    dto.size = v.size;
    dto.sizeHuman = v.sizeHuman;
    dto.mimeType = v.mimeType;
    dto.originalName = v.originalName;
    dto.checksum = v.checksum;
    dto.changeReason = v.changeReason;
    dto.createdBy = v.createdBy;
    dto.createdAt = v.createdAt;
    dto.isInitialVersion = v.isInitialVersion;
    dto.isLatest = options?.isLatest ?? false;
    dto.downloadUrl = options?.downloadUrl;
    return dto;
  }
}
