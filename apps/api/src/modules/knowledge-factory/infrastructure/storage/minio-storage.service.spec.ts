import { Test, TestingModule } from '@nestjs/testing';
import { KfStorageAdapter } from './minio-storage.service.js';
import { MinioService } from '../../../storage/infrastructure/minio/minio.service.js';

describe('KfStorageAdapter', () => {
  let adapter: KfStorageAdapter;
  let minioService: jest.Mocked<MinioService>;

  const bucket = 'knowledge-factory';
  const testBuffer = Buffer.from('test content');
  const testPath = 'workspaces/ws-123/uuid-test.pdf';
  const testContentType = 'application/pdf';
  const testDownloadBuffer = Buffer.from('downloaded content');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KfStorageAdapter,
        {
          provide: MinioService,
          useValue: {
            uploadBuffer: jest.fn().mockResolvedValue(testPath),
            getObject: jest.fn().mockResolvedValue(testDownloadBuffer),
            deleteObject: jest.fn().mockResolvedValue(undefined),
            ensureBucket: jest.fn(),
            ensureAllBuckets: jest.fn(),
            getPresignedUrl: jest.fn(),
            health: jest.fn(),
          },
        },
      ],
    }).compile();

    adapter = module.get<KfStorageAdapter>(KfStorageAdapter);
    minioService = module.get(MinioService) as jest.Mocked<MinioService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should delegate to minioService.uploadBuffer with knowledge-factory bucket', async () => {
      const result = await adapter.upload(testBuffer, testPath, testContentType);

      expect(minioService.uploadBuffer).toHaveBeenCalledWith(
        bucket,
        testPath,
        testBuffer,
        testContentType,
        testBuffer.length,
      );
      expect(result).toBe(testPath);
    });

    it('should propagate errors from minioService.uploadBuffer', async () => {
      const error = new Error('Upload failed');
      minioService.uploadBuffer.mockRejectedValue(error);

      await expect(adapter.upload(testBuffer, testPath, testContentType)).rejects.toThrow(error);
    });
  });

  describe('download', () => {
    it('should delegate to minioService.getObject with knowledge-factory bucket', async () => {
      const result = await adapter.download(testPath);

      expect(minioService.getObject).toHaveBeenCalledWith(bucket, testPath);
      expect(result).toBe(testDownloadBuffer);
    });

    it('should propagate errors from minioService.getObject', async () => {
      const error = new Error('Download failed');
      minioService.getObject.mockRejectedValue(error);

      await expect(adapter.download(testPath)).rejects.toThrow(error);
    });
  });

  describe('delete', () => {
    it('should delegate to minioService.deleteObject with knowledge-factory bucket', async () => {
      await adapter.delete(testPath);

      expect(minioService.deleteObject).toHaveBeenCalledWith(bucket, testPath);
    });

    it('should propagate errors from minioService.deleteObject', async () => {
      const error = new Error('Delete failed');
      minioService.deleteObject.mockRejectedValue(error);

      await expect(adapter.delete(testPath)).rejects.toThrow(error);
    });
  });

  describe('exists', () => {
    it('should return true when getObject succeeds', async () => {
      const result = await adapter.exists(testPath);

      expect(minioService.getObject).toHaveBeenCalledWith(bucket, testPath);
      expect(result).toBe(true);
    });

    it('should return false when getObject throws', async () => {
      minioService.getObject.mockRejectedValue(new Error('Not found'));

      const result = await adapter.exists(testPath);

      expect(result).toBe(false);
    });
  });

  describe('bucket isolation', () => {
    it('should always use knowledge-factory bucket for upload', async () => {
      await adapter.upload(testBuffer, testPath, testContentType);

      expect(minioService.uploadBuffer).toHaveBeenCalledWith(
        'knowledge-factory',
        expect.any(String),
        expect.any(Buffer),
        expect.any(String),
        expect.any(Number),
      );
    });

    it('should always use knowledge-factory bucket for download', async () => {
      await adapter.download(testPath);

      expect(minioService.getObject).toHaveBeenCalledWith('knowledge-factory', expect.any(String));
    });
  });
});
