jest.mock('@xennic/database', () => ({ prisma: {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../src/modules/rbac/infrastructure/guards/workspace.guard.js';
import { PermissionsGuard } from '../src/modules/rbac/infrastructure/guards/permissions.guard.js';
import { AllExceptionsFilter } from '../src/shared/filters/all-exceptions.filter.js';
import { ProjectFileController } from '../src/modules/project/presentation/controllers/project-file.controller.js';
import { ProjectFileService } from '../src/modules/project/application/services/project-file.service.js';
import { ProjectMemberGuard } from '../src/modules/project/infrastructure/guards/project-member.guard.js';
import { AuditLogRepository } from '../src/modules/rbac/infrastructure/repositories/audit-log.repository.js';
import request from 'supertest';

const mockProjectFileRepo = {
  save: jest.fn(),
  findByProjectId: jest.fn().mockResolvedValue([]),
  findByFileId: jest.fn().mockResolvedValue([]),
  find: jest.fn().mockImplementation((pid: string, fid: string) => {
    if (pid === 'proj-1' && fid === 'file-1') {
      return Promise.resolve({
        id: 'pf-1',
        projectId: pid,
        fileId: fid,
        addedBy: 'u1',
        createdAt: new Date(),
      });
    }
    return Promise.resolve(null);
  }),
  delete: jest.fn(),
  countByProjectId: jest.fn().mockResolvedValue(0),
  exists: jest.fn(),
};

const mockProjectRepo = {
  findById: jest.fn().mockImplementation((id: string) => {
    if (id === 'proj-1') {
      return Promise.resolve({ id, workspaceId: 'ws-1', isDeleted: () => false, deletedAt: null });
    }
    return Promise.resolve(null);
  }),
  isMember: jest.fn().mockResolvedValue(true),
};

const mockStorageRepo = {
  findById: jest.fn().mockImplementation((id: string) => {
    if (id === 'file-1') {
      return Promise.resolve({ id, workspaceId: 'ws-1', isDeleted: () => false, deletedAt: null });
    }
    return Promise.resolve(null);
  }),
};

describe('Runtime DI — Phase 1B Verification', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectFileController],
      providers: [
        ProjectFileService,
        ProjectMemberGuard,
        { provide: 'IProjectFileRepository', useValue: mockProjectFileRepo },
        { provide: 'IProjectRepository', useValue: mockProjectRepo },
        { provide: 'IStorageRepository', useValue: mockStorageRepo },
        { provide: AuditLogRepository, useValue: { save: jest.fn() } },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: 'u1', planSlug: 'enterprise' };
          return true;
        },
      })
      .overrideGuard(WorkspaceGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.workspaceId = 'ws-1';
          return true;
        },
      })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── DI Resolution ────────────────────────────────────────────────────────

  it('ProjectFileService should be resolvable from DI container', () => {
    const service = app.get(ProjectFileService);
    expect(service).toBeDefined();
    expect(typeof service.attachFile).toBe('function');
    expect(typeof service.detachFile).toBe('function');
    expect(typeof service.listProjectFiles).toBe('function');
  });

  it('ProjectFileController should be resolvable from DI container', () => {
    const controller = app.get(ProjectFileController);
    expect(controller).toBeDefined();
  });

  it('ProjectMemberGuard should be resolvable from DI container', () => {
    const guard = app.get(ProjectMemberGuard);
    expect(guard).toBeDefined();
    expect(typeof guard.canActivate).toBe('function');
  });

  // ── Route Mapping ────────────────────────────────────────────────────────

  it('POST /projects/:projectId/files/:fileId should be mapped (201)', async () => {
    mockProjectFileRepo.find.mockResolvedValue(null);
    mockProjectFileRepo.save.mockResolvedValue();

    const res = await request(app.getHttpServer())
      .post('/projects/proj-1/files/file-1')
      .set('x-workspace-id', 'ws-1')
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.projectId).toBe('proj-1');
    expect(res.body.data.fileId).toBe('file-1');
  });

  it('DELETE /projects/:projectId/files/:fileId should be mapped (204)', async () => {
    mockProjectFileRepo.find.mockResolvedValue({
      id: 'pf-1',
      projectId: 'proj-1',
      fileId: 'file-1',
      addedBy: 'u1',
      createdAt: new Date(),
    });

    await request(app.getHttpServer())
      .delete('/projects/proj-1/files/file-1')
      .set('x-workspace-id', 'ws-1')
      .expect(204);
  });

  it('GET /projects/:projectId/files should be mapped (200)', async () => {
    mockProjectFileRepo.findByProjectId.mockResolvedValue([]);
    mockProjectFileRepo.countByProjectId.mockResolvedValue(0);

    const res = await request(app.getHttpServer())
      .get('/projects/proj-1/files')
      .set('x-workspace-id', 'ws-1')
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta).toBeDefined();
  });

  // ── Error response format ────────────────────────────────────────────────

  it('error responses should use {success: false, error: {code, message}} format', async () => {
    const res = await request(app.getHttpServer())
      .post('/projects/nonexistent/files/file-1')
      .set('x-workspace-id', 'ws-1')
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('POST with duplicate file should return 409', async () => {
    mockProjectFileRepo.find.mockResolvedValue({ id: 'pf-existing' });

    const res = await request(app.getHttpServer())
      .post('/projects/proj-1/files/file-1')
      .set('x-workspace-id', 'ws-1')
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });
});
