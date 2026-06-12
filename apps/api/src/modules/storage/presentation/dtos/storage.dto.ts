import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import type { FileEntity } from '../../domain/entities/file.entity.js';

export class FileResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty({ enum: ['public','private','reports','documents','engineering','ai'] })
  bucket!: string;
  @ApiProperty() filename!: string;
  @ApiProperty() originalName!: string;
  @ApiProperty() extension!: string;
  @ApiProperty() mimeType!: string;
  @ApiProperty() size!: number;
  @ApiProperty() sizeHuman!: string;
  @ApiProperty({ nullable: true }) checksum!: string | null;
  @ApiProperty() uploadedBy!: string;
  @ApiProperty() createdAt!: Date;
  @ApiProperty({ nullable: true }) downloadUrl?: string;

  static fromEntity(f: FileEntity, downloadUrl?: string): FileResponseDto {
    const dto        = new FileResponseDto();
    dto.id           = f.id;
    dto.workspaceId  = f.workspaceId;
    dto.bucket       = f.bucket;
    dto.filename     = f.filename;
    dto.originalName = f.originalName;
    dto.extension    = f.extension;
    dto.mimeType     = f.mimeType;
    dto.size         = f.size;
    dto.sizeHuman    = f.sizeHuman;
    dto.checksum     = f.checksum;
    dto.uploadedBy   = f.uploadedBy;
    dto.createdAt    = f.createdAt;
    dto.downloadUrl  = downloadUrl;
    return dto;
  }
}

export class StorageStatsDto {
  @ApiProperty() totalFiles!: number;
  @ApiProperty() totalSizeBytes!: number;
  @ApiProperty() totalSizeHuman!: string;
}
