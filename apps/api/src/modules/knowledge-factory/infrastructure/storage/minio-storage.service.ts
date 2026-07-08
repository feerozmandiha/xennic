import { Injectable } from '@nestjs/common';

@Injectable()
export class MinioStorageService {
  private readonly bucket: string;

  constructor(private readonly storageService: { upload(bucket: string, path: string, buffer: Buffer, contentType: string): Promise<string>; download(bucket: string, path: string): Promise<Buffer>; delete(bucket: string, path: string): Promise<void>; exists(bucket: string, path: string): Promise<boolean> }, private readonly configService: { get<T>(key: string, defaultValue?: T): T }) {
    this.bucket = this.configService.get<string>('MINIO_BUCKET', 'knowledge-factory');
  }

  async upload(buffer: Buffer, path: string, contentType: string): Promise<string> {
    await this.storageService.upload(this.bucket, path, buffer, contentType);
    return path;
  }

  async download(path: string): Promise<Buffer> {
    return this.storageService.download(this.bucket, path);
  }

  async delete(path: string): Promise<void> {
    await this.storageService.delete(this.bucket, path);
  }

  async exists(path: string): Promise<boolean> {
    return this.storageService.exists(this.bucket, path);
  }
}
