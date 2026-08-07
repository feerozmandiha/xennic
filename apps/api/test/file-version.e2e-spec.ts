/**
 * File Version API — E2E tests
 *
 * XENNIC-STORAGE-EO-1D-API-IMPLEMENT-047
 * Runs against real PostgreSQL + real MinIO (local dev containers).
 * Guards are overridden with mocks; the full controller → service →
 * repository → MinIO/DB stack is exercised over HTTP.
 */
process.env.MINIO_ENDPOINT ??= 'localhost:9000';
process.env.MINIO_ACCESS_KEY ??= 'xennic-test-access';
process.env.MINIO_SECRET_KEY ??= 'xennic-test-secret-1234';

jest.mock('@xennic/database', () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { PrismaClient } = require('@prisma/client');
  return { prisma: new PrismaClient() };
});

import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe, UnauthorizedException } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import request from 'supertest';
import { randomUUID } from 'crypto';
import { prisma } from '@xennic/database';
import { StorageModule } from '../src/modules/storage/storage.module.js';
import { AllExceptionsFilter } from '../src/shared/filters/all-exceptions.filter.js';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../src/modules/rbac/infrastructure/guards/workspace.guard.js';
import { PermissionsGuard } from '../src/modules/rbac/infrastructure/guards/permissions.guard.js';
import { MinioService } from '../src/modules/storage/infrastructure/minio/minio.service.js';

const WS_ID = `ws-e2e-fv-${randomUUID()}`;
const USER_ID = `user-e2e-fv-${randomUUID()}`;
const FILE_ID = `file-e2e-fv-${randomUUID()}`;
const WS_CODE = `ws-e2e-fv-${randomUUID().slice(0, 8)}`;

async function sql(query: string): Promise<any[]> {
  return (prisma as any).$executeRawUnsafe(query);
}

describe('File Version API (e2e)', () => {
  let app: NestFastifyApplication;
  let minioService: MinioService;
  const createdObjects: string[] = [];

  beforeAll(async () => {
    await sql(
      `INSERT INTO workspaces (id, code, name, created_by, created_at, updated_at)
       VALUES ('${WS_ID}', '${WS_CODE}', 'File Version E2E Workspace', '00000000-0000-0000-0000-000000000000', NOW(), NOW())`,
    );
    await sql(
      `INSERT INTO users (id, email, password, first_name, last_name, is_admin, is_active, created_at, updated_at)
       VALUES ('${USER_ID}', '${USER_ID}@test.local', 'test-hash', 'E2E', 'FileVersion', false, true, NOW(), NOW())`,
    );
    await sql(
      `INSERT INTO files (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at)
       VALUES ('${FILE_ID}', '${WS_ID}', 'documents', 'e2e/base.pdf', 'base.pdf', 'base.pdf', '.pdf', 'application/pdf', 100, '${USER_ID}', NOW())`,
    );

    minioService = new MinioService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: USER_ID, email: 'test@xennic.com' };
          req.workspaceId = WS_ID;
          return true;
        },
      })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.register((await import('@fastify/multipart')).default, {
      limits: { fileSize: 100 * 1024 * 1024, files: 1 },
    });
    await app.init();
    // Fastify initializes per-route lifecycle hook state (e.g. `preParsing`)
    // only during `ready()`. Without this, supertest requests against
    // `getHttpServer()` crash inside fastify's own hook runner.
    await app.getHttpAdapter().getInstance().ready();
  });

  afterAll(async () => {
    await app.close();

    for (const key of createdObjects) {
      await minioService.deleteObject('documents', key).catch(() => {});
    }

    await sql(`DELETE FROM file_versions WHERE file_id = '${FILE_ID}'`).catch(() => {});
    await sql(`DELETE FROM files WHERE id = '${FILE_ID}'`).catch(() => {});
    await sql(`DELETE FROM audit_logs WHERE workspace_id = '${WS_ID}'`).catch(() => {});
    await sql(`DELETE FROM users WHERE id = '${USER_ID}'`).catch(() => {});
    await sql(`DELETE FROM workspaces WHERE id = '${WS_ID}'`).catch(() => {});
    await (prisma as any).$disconnect();
  });

  const baseUrl = `/api/v1/storage/files/${FILE_ID}/versions`;

  it('1. creates version 1 via multipart upload', async () => {
    const res = await request(app.getHttpServer())
      .post(baseUrl)
      .attach('file', Buffer.from('e2e-v1-content'), {
        filename: 'doc.pdf',
        contentType: 'application/pdf',
      })
      .field('changeReason', 'Initial E2E version')
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe(1);
    expect(res.body.data.changeReason).toBe('Initial E2E version');
    createdObjects.push(`${WS_ID}/${res.body.data.path}`);
  });

  it('2. creates version 2', async () => {
    const res = await request(app.getHttpServer())
      .post(baseUrl)
      .attach('file', Buffer.from('e2e-v2-content'), {
        filename: 'doc.pdf',
        contentType: 'application/pdf',
      })
      .expect(201);

    expect(res.body.data.version).toBe(2);
    createdObjects.push(`${WS_ID}/${res.body.data.path}`);
  });

  it('3. lists versions newest first', async () => {
    const res = await request(app.getHttpServer()).get(baseUrl).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(2);
    expect(res.body.data[0].version).toBe(2);
    expect(res.body.data[0].isLatest).toBe(true);
    expect(res.body.data[1].isLatest).toBe(false);
    expect(res.body.meta.total).toBe(2);
  });

  it('4. gets version detail with presigned download URL', async () => {
    const res = await request(app.getHttpServer()).get(`${baseUrl}/1`).expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.version).toBe(1);
    expect(res.body.data.isLatest).toBe(false);
    expect(res.body.data.downloadUrl).toContain('http');
  });

  it('5. downloads a version as binary', async () => {
    const res = await request(app.getHttpServer()).get(`${baseUrl}/1/download`).expect(200);

    expect(Buffer.from(res.body as Buffer).toString()).toBe('e2e-v1-content');
  });

  it('6. reverts to version 1 — creates a NEW version with same content', async () => {
    const res = await request(app.getHttpServer())
      .post(`${baseUrl}/1/revert`)
      .send({ changeReason: 'Rollback to v1' })
      .expect(201);

    expect(res.body.data.version).toBe(3);
    expect(res.body.data.isLatest).toBe(true);
    expect(res.body.data.changeReason).toBe('Rollback to v1');
    createdObjects.push(`${WS_ID}/${res.body.data.path}`);

    const download = await request(app.getHttpServer()).get(`${baseUrl}/3/download`).expect(200);
    expect(Buffer.from(download.body as Buffer).toString()).toBe('e2e-v1-content');
  });

  it('7. rejects deleting the initial version', async () => {
    await request(app.getHttpServer()).delete(`${baseUrl}/1`).expect(400);
  });

  it('8. rejects deleting the latest active version', async () => {
    await request(app.getHttpServer()).delete(`${baseUrl}/3`).expect(409);
  });

  it('9. deletes an intermediate version', async () => {
    await request(app.getHttpServer()).delete(`${baseUrl}/2`).expect(204);

    await request(app.getHttpServer()).get(`${baseUrl}/2`).expect(404);
  });

  it('10. returns 404 for a non-existent version', async () => {
    await request(app.getHttpServer()).get(`${baseUrl}/99`).expect(404);
  });

  it('11. returns 404 for a non-existent file', async () => {
    await request(app.getHttpServer())
      .get(`/api/v1/storage/files/${randomUUID()}/versions`)
      .expect(404);
  });

  it('12. returns 400 for an invalid version number', async () => {
    await request(app.getHttpServer()).get(`${baseUrl}/abc`).expect(400);
  });

  it('13. returns 400 for a multipart upload without a file part', async () => {
    const res = await request(app.getHttpServer())
      .post(baseUrl)
      .field('changeReason', 'no file here')
      .expect(400);

    expect(res.body.success).toBe(false);
  });

  it('14. returns 401 when authentication fails', async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: () => {
          throw new UnauthorizedException();
        },
      })
      .overrideGuard(WorkspaceGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    const unauthApp = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    unauthApp.setGlobalPrefix('api/v1');
    await unauthApp.init();
    await unauthApp.getHttpAdapter().getInstance().ready();

    await request(unauthApp.getHttpServer()).get(baseUrl).expect(401);

    await unauthApp.close();
  });

  it('15. returns 403 when permission is missing', async () => {
    const { ForbiddenException } = await import('@nestjs/common');
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [StorageModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: USER_ID };
          req.workspaceId = WS_ID;
          return true;
        },
      })
      .overrideGuard(PermissionsGuard)
      .useValue({
        canActivate: () => {
          throw new ForbiddenException('Missing permission');
        },
      })
      .compile();

    const deniedApp = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter({ logger: false }),
    );
    deniedApp.setGlobalPrefix('api/v1');
    deniedApp.useGlobalFilters(new AllExceptionsFilter());
    await deniedApp.init();
    await deniedApp.getHttpAdapter().getInstance().ready();

    await request(deniedApp.getHttpServer()).get(baseUrl).expect(403);
    await deniedApp.close();
  });

  it('16. rejects cross-workspace access to another workspace file', async () => {
    const otherWsId = `ws-e2e-other-${randomUUID()}`;
    const otherFileId = `file-e2e-other-${randomUUID()}`;
    await sql(
      `INSERT INTO workspaces (id, code, name, created_by, created_at, updated_at)
       VALUES ('${otherWsId}', 'ws-other-${randomUUID().slice(0, 8)}', 'Other WS', '00000000-0000-0000-0000-000000000000', NOW(), NOW())`,
    );
    await sql(
      `INSERT INTO files (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at)
       VALUES ('${otherFileId}', '${otherWsId}', 'documents', 'e2e/other.pdf', 'other.pdf', 'other.pdf', '.pdf', 'application/pdf', 10, '${USER_ID}', NOW())`,
    );

    try {
      await request(app.getHttpServer())
        .get(`/api/v1/storage/files/${otherFileId}/versions`)
        .expect(403);
    } finally {
      await sql(`DELETE FROM files WHERE id = '${otherFileId}'`).catch(() => {});
      await sql(`DELETE FROM workspaces WHERE id = '${otherWsId}'`).catch(() => {});
    }
  });

  it('17. rejects operations on a soft-deleted file', async () => {
    const deletedFileId = `file-e2e-del-${randomUUID()}`;
    await sql(
      `INSERT INTO files (id, workspace_id, bucket, path, filename, original_name, extension, mime_type, size, uploaded_by, created_at, deleted_at)
       VALUES ('${deletedFileId}', '${WS_ID}', 'documents', 'e2e/del.pdf', 'del.pdf', 'del.pdf', '.pdf', 'application/pdf', 10, '${USER_ID}', NOW(), NOW())`,
    );

    try {
      await request(app.getHttpServer())
        .get(`/api/v1/storage/files/${deletedFileId}/versions`)
        .expect(404);
    } finally {
      await sql(`DELETE FROM files WHERE id = '${deletedFileId}'`).catch(() => {});
    }
  });

  it('18. rejects invalid MIME type on create', async () => {
    await request(app.getHttpServer())
      .post(baseUrl)
      .attach('file', Buffer.from('MZ'), {
        filename: 'malware.exe',
        contentType: 'application/x-executable',
      })
      .expect(400);
  });
});
