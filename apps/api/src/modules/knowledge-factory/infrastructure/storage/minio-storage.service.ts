import { Injectable } from '@nestjs/common';
import type { IStorageService } from '../../domain/interfaces/storage-service.interface.js';
import { MinioService } from '../../../storage/infrastructure/minio/minio.service.js';

@Injectable()
export class KfStorageAdapter implements IStorageService {
  private readonly bucket = 'knowledge-factory';

  constructor(private readonly minioService: MinioService) {}

  async upload(buffer: Buffer, path: string, contentType: string): Promise<string> {
    await this.minioService.uploadBuffer(this.bucket, path, buffer, contentType, buffer.length);
    return path;
  }

  async download(path: string): Promise<Buffer> {
    return this.minioService.getObject(this.bucket, path);
  }

  async delete(path: string): Promise<void> {
    await this.minioService.deleteObject(this.bucket, path);
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.minioService.getObject(this.bucket, path);
      return true;
    } catch {
      return false;
    }
  }
}
