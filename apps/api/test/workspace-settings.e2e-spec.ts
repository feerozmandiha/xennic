import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe, UnauthorizedException } from '@nestjs/common';
import request from 'supertest';
import { WorkspaceModule } from '../src/modules/workspace/workspace.module';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/guards/jwt-auth.guard';
import { WorkspaceGuard } from '../src/modules/rbac/infrastructure/guards/workspace.guard';
import { WorkspaceSettingsService } from '../src/modules/workspace/application/services/workspace-settings.service';
import { DEFAULT_WORKSPACE_SETTINGS } from '../src/modules/workspace/domain/entities/workspace-settings.entity';

jest.mock('@xennic/database', () => ({
  prisma: {
    workspace_settings: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
    },
    workspaces: {
      findUnique: jest.fn(),
    },
    workspace_members: {
      findFirst: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

const mockSettings = {
  workspaceId: 'ws-123',
  settings: {
    brand: {
      name: 'Test Corp',
      logo_url: null,
      primary_color: '#2563eb',
      accent_color: '#7c3aed',
    },
    localization: {
      locale: 'fa',
      direction: 'rtl',
      timezone: 'Asia/Tehran',
      date_format: 'YYYY/MM/DD',
      number_format: 'en',
    },
    defaults: {
      voltage_level_kv: 400,
      frequency_hz: 50,
      ambient_temperature_c: 35,
      conductor_material: 'copper',
      insulation_type: 'xlpe',
      power_factor: 0.85,
    },
    notifications: {
      email_alerts: true,
      calculation_completed: false,
      member_joined: true,
      weekly_report: true,
    },
    features: {
      auto_save: true,
      show_advanced_options: false,
      export_default_format: 'pdf',
    },
  },
  updatedAt: new Date('2024-01-15T10:00:00Z'),
};

const mockService = {
  getSettings: jest.fn().mockResolvedValue(mockSettings),
  updateSettings: jest.fn().mockResolvedValue(mockSettings),
  resetSettings: jest.fn().mockResolvedValue({
    workspaceId: 'ws-123',
    settings: { ...DEFAULT_WORKSPACE_SETTINGS },
    updatedAt: new Date('2024-06-17T10:00:00Z'),
  }),
};

describe('Workspace Settings (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [WorkspaceModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(WorkspaceGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: 'user-123', email: 'test@xennic.com' };
          req.workspaceId = 'ws-123';
          return true;
        },
      })
      .overrideProvider(WorkspaceSettingsService)
      .useValue(mockService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/workspaces/:workspaceId/settings', () => {
    it('should return 200 with workspace settings', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/workspaces/ws-123/settings')
        .expect(200);

      expect(res.body).toMatchObject({
        workspaceId: 'ws-123',
        settings: expect.objectContaining({
          brand: expect.objectContaining({ name: 'Test Corp' }),
          localization: expect.objectContaining({ locale: 'fa' }),
          notifications: expect.objectContaining({ email_alerts: true }),
        }),
      });
      expect(mockService.getSettings).toHaveBeenCalledWith('ws-123');
    });

    it('should send 401 when JwtAuthGuard rejects', async () => {
      const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [WorkspaceModule],
      })
        .overrideGuard(JwtAuthGuard)
        .useValue({ canActivate: () => { throw new UnauthorizedException(); } })
        .overrideGuard(WorkspaceGuard)
        .useValue({ canActivate: () => true })
        .overrideProvider(WorkspaceSettingsService)
        .useValue(mockService)
        .compile();

      const unauthApp = moduleFixture.createNestApplication();
      unauthApp.setGlobalPrefix('api/v1');
      unauthApp.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
      await unauthApp.init();

      await request(unauthApp.getHttpServer())
        .get('/api/v1/workspaces/ws-123/settings')
        .expect(401);

      await unauthApp.close();
    });
  });

  describe('PATCH /api/v1/workspaces/:workspaceId/settings', () => {
    it('should return 200 with updated settings', async () => {
      const updateBody = {
        brand: { name: 'Updated Corp' },
        notifications: { email_alerts: false },
      };

      const res = await request(app.getHttpServer())
        .patch('/api/v1/workspaces/ws-123/settings')
        .send(updateBody)
        .expect(200);

      expect(res.body).toMatchObject({
        workspaceId: 'ws-123',
      });
      expect(mockService.updateSettings).toHaveBeenCalledWith(
        'ws-123',
        expect.objectContaining(updateBody),
      );
    });

    it('should return 400 for extra unknown field', async () => {
      const invalidBody = {
        brand: { name: 'Test' },
        unknownField: 'should-not-pass',
      };

      await request(app.getHttpServer())
        .patch('/api/v1/workspaces/ws-123/settings')
        .send(invalidBody)
        .expect(400);
    });

    it('should return 400 for invalid value type', async () => {
      const invalidBody = {
        notifications: { emailNotifications: 'not-a-boolean' },
      };

      await request(app.getHttpServer())
        .patch('/api/v1/workspaces/ws-123/settings')
        .send(invalidBody)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/workspaces/:workspaceId/settings/reset', () => {
    it('should return 200 with default settings after reset', async () => {
      const res = await request(app.getHttpServer())
        .patch('/api/v1/workspaces/ws-123/settings/reset')
        .expect(200);

      expect(res.body).toMatchObject({
        workspaceId: 'ws-123',
        settings: expect.objectContaining({
          localization: expect.objectContaining({ locale: 'fa' }),
          notifications: expect.objectContaining({ email_alerts: true }),
          features: expect.objectContaining({ auto_save: true }),
        }),
      });
      expect(mockService.resetSettings).toHaveBeenCalledWith('ws-123');
    });
  });
});
