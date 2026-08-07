import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ApiModule } from '../src/api.module.js';
import { PrismaClient } from '@prisma/client';

/**
 * Knowledge Factory Pipeline E2E
 *
 * سناریوی واقعی «مسیر بحرانی»:
 *   ثبت‌نام → ساخت workspace → آپلود سند (multipart) → اجرای خط لوله (BullMQ)
 *   → انتظار تا سند به وضعیت published برسد → بررسی chunk ها، رکورد knowledge
 *   و رویداد DocumentPublished در outbox.
 *
 * پیش‌نیازهای runtime (در CI به‌عنوان service): PostgreSQL، Redis، MinIO.
 *
 * نکته: چون API روی Fastify است، درخواست‌ها با `app.inject()` انجام می‌شوند
 * (روش توصیه‌شده برای Nest+Fastify) به‌جای supertest.
 */
jest.setTimeout(180_000);

const BOUNDARY = '----xennic-e2e';

function multipartPayload(
  fields: Record<string, string>,
  file?: { name: string; content: Buffer; type: string },
): Buffer {
  let body = '';
  for (const [k, v] of Object.entries(fields)) {
    body += `--${BOUNDARY}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`;
  }
  if (file) {
    body += `--${BOUNDARY}\r\nContent-Disposition: form-data; name="file"; filename="${file.name}"\r\nContent-Type: ${file.type}\r\n\r\n`;
  }
  const prefix = Buffer.from(body, 'utf8');
  const suffix = Buffer.from(`\r\n--${BOUNDARY}--\r\n`, 'utf8');
  return Buffer.concat([prefix, file ? file.content : Buffer.alloc(0), suffix]);
}

describe('Knowledge Factory Pipeline (E2E)', () => {
  let app: NestFastifyApplication;
  let token = '';
  let workspaceId = '';
  let documentId = '';
  let publishedKnowledgeId: string | null = null;

  const unique = Date.now().toString(36);
  const email = `pipeline-e2e-${unique}@xennic.dev`;
  const password = 'Test@12345';
  const prisma = new PrismaClient();

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [ApiModule] }).compile();
    app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
    await app.register((await import('@fastify/multipart')).default, {
      limits: { fileSize: 50 * 1024 * 1024, files: 1 },
    });
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    if (documentId) {
      await prisma.knowledge_pipeline_runs.deleteMany({ where: { document_id: documentId } });
      await prisma.knowledge_document_chunks.deleteMany({ where: { document_id: documentId } });
      await prisma.knowledge_extractions.deleteMany({ where: { document_id: documentId } });
      if (publishedKnowledgeId) {
        await prisma.knowledge
          .delete({ where: { id: publishedKnowledgeId } })
          .catch(() => undefined);
      }
      await prisma.knowledge_documents.deleteMany({ where: { id: documentId } });
    }
    await prisma.$disconnect();
    await app.close();
  });

  it('1) registers a user and gets a JWT', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/register',
      payload: JSON.stringify({ email, password, firstName: 'Pipeline', lastName: 'E2E' }),
      headers: { 'content-type': 'application/json' },
    });
    expect(res.statusCode).toBe(201);
    token = res.json()?.data?.accessToken;
    expect(token).toBeTruthy();
  });

  it('2) creates a workspace', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/workspaces',
      payload: JSON.stringify({ name: `Pipeline E2E ${unique}` }),
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    });
    expect(res.statusCode).toBe(201);
    workspaceId = res.json()?.data?.id;
    expect(workspaceId).toBeTruthy();
  });

  it('3) uploads a document via Fastify multipart', async () => {
    const payload = multipartPayload(
      { metadata: JSON.stringify({ source: 'pipeline-e2e' }) },
      {
        name: 'e2e-doc.txt',
        content: Buffer.from(
          'XENNIC E2E PIPELINE DOCUMENT\n\nParagraph one about electrical engineering.\n\nParagraph two about renewable energy.\n\nParagraph three about power systems.',
          'utf8',
        ),
        type: 'text/plain',
      },
    );
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/knowledge-factory/documents/upload',
      payload,
      headers: {
        authorization: `Bearer ${token}`,
        'x-workspace-id': workspaceId,
        'content-type': `multipart/form-data; boundary=${BOUNDARY}`,
      },
    });
    expect(res.statusCode).toBe(201);
    documentId = res.json()?.data?.id;
    expect(documentId).toBeTruthy();
    expect(res.json()?.data?.status).toBe('uploaded');
  });

  it('4) runs the pipeline (7 BullMQ stages) until published', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/v1/knowledge-factory/documents/${documentId}/process`,
      headers: { authorization: `Bearer ${token}`, 'x-workspace-id': workspaceId },
    });
    expect(res.statusCode).toBe(201);
    expect(res.json()?.data?.success).toBe(true);

    let status = '';
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 1500));
      const doc = await prisma.knowledge_documents.findUnique({ where: { id: documentId } });
      status = doc?.status ?? '';
      if (status === 'published' || status === 'failed') break;
    }

    expect(status).toBe('published');

    const doc = await prisma.knowledge_documents.findUnique({ where: { id: documentId } });
    publishedKnowledgeId = doc?.published_knowledge_id ?? null;
    expect(publishedKnowledgeId).toBeTruthy();
  });

  it('5) creates chunks from the document', async () => {
    const count = await prisma.knowledge_document_chunks.count({
      where: { document_id: documentId },
    });
    expect(count).toBeGreaterThan(0);
  });

  it('6) creates a knowledge record with a stable slug', async () => {
    const record = await prisma.knowledge.findUnique({
      where: { id: publishedKnowledgeId! },
    });
    expect(record).not.toBeNull();
    expect(record?.slug).toBe(`factory-${documentId}`);
    expect(record?.status).toBe('published');
  });

  it('7) emits DocumentPublished through the outbox (event-driven)', async () => {
    const event = await prisma.event_outbox.findFirst({
      where: { event_type: 'DocumentPublished' },
      orderBy: { created_at: 'desc' },
    });
    expect(event).not.toBeNull();
  });
});
