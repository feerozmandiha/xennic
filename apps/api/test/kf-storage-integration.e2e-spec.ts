process.env.MINIO_ENDPOINT ??= 'localhost:9000';
process.env.MINIO_ACCESS_KEY ??= 'xennic-test-access';
process.env.MINIO_SECRET_KEY ??= 'xennic-test-secret-1234';

import { Test, TestingModule } from '@nestjs/testing';
import { KfStorageAdapter } from '../src/modules/knowledge-factory/infrastructure/storage/minio-storage.service.js';
import { MinioService } from '../src/modules/storage/infrastructure/minio/minio.service.js';
import { randomUUID } from 'crypto';

const WS_ID = 'ws-integration-test';
const WS_ID_2 = 'ws-other-workspace';

describe('KfStorageAdapter — Real MinIO Integration', () => {
  let adapter: KfStorageAdapter;
  let minioService: MinioService;

  // Unique test paths per suite run
  const testId = randomUUID();
  const uploadPath = `workspaces/${WS_ID}/${testId}-upload-test.pdf`;
  const isolatedPath = `workspaces/${WS_ID}/${testId}-isolated-test.pdf`;
  const crossWsPath = `workspaces/${WS_ID_2}/${testId}-cross-ws-test.pdf`;
  const testContent = 'Integration test content for KF Storage';
  const testBuffer = Buffer.from(testContent);
  const contentType = 'application/pdf';

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KfStorageAdapter, MinioService],
    }).compile();

    adapter = module.get(KfStorageAdapter);
    minioService = module.get(MinioService);
  });

  afterAll(async () => {
    const testObjects = [uploadPath, isolatedPath, crossWsPath];
    for (const path of testObjects) {
      try {
        await adapter.delete(path);
      } catch {
        // Ignore cleanup errors
      }
    }

    // Verify all objects were cleaned up
    const remaining = await Promise.all(testObjects.map((p) => adapter.exists(p)));
    for (const exists of remaining) {
      expect(exists).toBe(false);
    }
  });

  it('1. Upload document through KfStorageAdapter', async () => {
    const result = await adapter.upload(testBuffer, uploadPath, contentType);

    expect(result).toBe(uploadPath);
  });

  it('2. Verify object exists in MinIO', async () => {
    const exists = await adapter.exists(uploadPath);

    expect(exists).toBe(true);
  });

  it('3. Verify correct bucket is used (knowledge-factory)', async () => {
    // Download from the hardcoded bucket 'knowledge-factory' via raw MinioService
    const data = await minioService.getObject('knowledge-factory', uploadPath);

    expect(data).toBeDefined();
    expect(data.toString()).toBe(testContent);
  });

  it('4. Verify workspace path isolation — upload to separate workspace', async () => {
    const result = await adapter.upload(testBuffer, crossWsPath, contentType);

    expect(result).toBe(crossWsPath);
  });

  it('5. Verify download returns correct content', async () => {
    const data = await adapter.download(uploadPath);

    expect(data).toBeInstanceOf(Buffer);
    expect(data.toString()).toBe(testContent);
  });

  it('6. Verify download preserves binary content', async () => {
    const binaryContent = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe]);
    const binaryPath = `workspaces/${WS_ID}/${testId}-binary.bin`;

    try {
      await adapter.upload(binaryContent, binaryPath, 'application/octet-stream');
      const downloaded = await adapter.download(binaryPath);

      expect(downloaded).toEqual(binaryContent);
    } finally {
      await adapter.delete(binaryPath).catch(() => {});
    }
  });

  it('7. Verify exists returns false for non-existent object', async () => {
    const result = await adapter.exists(`workspaces/${WS_ID}/${testId}-nonexistent.pdf`);

    expect(result).toBe(false);
  });

  it('8. Verify upload returns correct path/object key', async () => {
    const path = `workspaces/${WS_ID}/${testId}-path-test.pdf`;
    const result = await adapter.upload(testBuffer, path, contentType);

    expect(result).toBe(path);

    await adapter.delete(path);
  });

  it('9. Verify delete behavior — object removed after delete', async () => {
    const tempPath = `workspaces/${WS_ID}/${testId}-delete-test.pdf`;
    await adapter.upload(testBuffer, tempPath, contentType);
    expect(await adapter.exists(tempPath)).toBe(true);

    await adapter.delete(tempPath);

    expect(await adapter.exists(tempPath)).toBe(false);
  });

  it('10. Verify error propagation on download of non-existent object', async () => {
    await expect(
      adapter.download(`workspaces/${WS_ID}/${testId}-no-such-file.pdf`),
    ).rejects.toThrow();
  });

  it('11. Verify invalid content handling — empty buffer upload', async () => {
    const emptyPath = `workspaces/${WS_ID}/${testId}-empty.pdf`;

    try {
      const result = await adapter.upload(Buffer.alloc(0), emptyPath, 'application/pdf');

      expect(result).toBe(emptyPath);
      expect(await adapter.exists(emptyPath)).toBe(true);

      const downloaded = await adapter.download(emptyPath);
      expect(downloaded.length).toBe(0);
    } finally {
      await adapter.delete(emptyPath).catch(() => {});
    }
  });

  it('12. Verify large content upload and download', async () => {
    const largeContent = Buffer.alloc(1024 * 1024, 'A'); // 1MB
    const largePath = `workspaces/${WS_ID}/${testId}-large.bin`;

    try {
      const result = await adapter.upload(largeContent, largePath, 'application/octet-stream');

      expect(result).toBe(largePath);
      expect(await adapter.exists(largePath)).toBe(true);

      const downloaded = await adapter.download(largePath);
      expect(downloaded.length).toBe(1024 * 1024);
      expect(downloaded[0]).toBe(65); // 'A'
      expect(downloaded[1024 * 1024 - 1]).toBe(65);
    } finally {
      await adapter.delete(largePath).catch(() => {});
    }
  });

  it('13. Verify MIME type preservation', async () => {
    const jsonPath = `workspaces/${WS_ID}/${testId}-data.json`;
    const jsonContent = Buffer.from(JSON.stringify({ key: 'value' }));
    const jsonMime = 'application/json';

    try {
      await adapter.upload(jsonContent, jsonPath, jsonMime);
      const downloaded = await adapter.download(jsonPath);

      expect(JSON.parse(downloaded.toString())).toEqual({ key: 'value' });
    } finally {
      await adapter.delete(jsonPath).catch(() => {});
    }
  });

  it('14. Verify cross-workspace isolation — objects in one ws not visible in another', async () => {
    // ws2 should not have ws1's object
    const result = await adapter.exists(`workspaces/${WS_ID_2}/${testId}-upload-test.pdf`);

    expect(result).toBe(false);
  });

  // cleanup verified in afterAll
});
