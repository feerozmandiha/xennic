import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ApiModule } from '../src/api.module';

/**
 * SEC-001A: تست‌های امنیتی CORS
 *
 * این تست‌ها تضمین می‌کنند که:
 * 1. فقط origins مجاز پذیرفته می‌شوند
 * 2. origins غیرمجاز رد می‌شوند
 * 3. headers مجاز محدود هستند
 */
describe('CORS Security (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    // تنظیم CORS_ORIGINS برای تست
    process.env.CORS_ORIGINS = 'http://localhost:3001,https://xennic.ir';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ApiModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.CORS_ORIGINS;
  });

  // ── تست‌های Origin مجاز ────────────────────────────────────────────────────

  describe('Authorized Origins', () => {
    it('should accept requests from localhost:3001', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBe(
        'http://localhost:3001',
      );
    });

    it('should accept requests from xennic.ir', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'https://xennic.ir')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBe(
        'https://xennic.ir',
      );
    });
  });

  // ── تست‌های Origin غیرمجاز ─────────────────────────────────────────────────

  describe('Unauthorized Origins', () => {
    it('should reject requests from evil-site.com', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'https://evil-site.com')
        .set('Access-Control-Request-Method', 'GET');

      // Origin غیرمجاز نباید در allow-origin باشد
      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should reject requests from random domain', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'https://attacker.evil.com')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });

    it('should reject requests with null origin', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'null')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-origin']).toBeUndefined();
    });
  });

  // ── تست‌های Methods مجاز ───────────────────────────────────────────────────

  describe('Allowed Methods', () => {
    it('should allow GET method', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'GET');

      expect(response.headers['access-control-allow-methods']).toContain('GET');
    });

    it('should allow POST method', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'POST');

      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  // ── تست‌های Headers مجاز ───────────────────────────────────────────────────

  describe('Allowed Headers', () => {
    it('should allow Content-Type header', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Content-Type');

      expect(response.headers['access-control-allow-headers']).toContain(
        'Content-Type',
      );
    });

    it('should allow Authorization header', async () => {
      const response = await request(app.getHttpServer())
        .options('/api/v1/health')
        .set('Origin', 'http://localhost:3001')
        .set('Access-Control-Request-Method', 'GET')
        .set('Access-Control-Request-Headers', 'Authorization');

      expect(response.headers['access-control-allow-headers']).toContain(
        'Authorization',
      );
    });
  });
});
