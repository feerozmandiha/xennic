jest.mock('@xennic/database', () => ({ prisma: {} }));

import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from '../src/modules/auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../src/modules/rbac/infrastructure/guards/workspace.guard.js';
import { PermissionsGuard } from '../src/modules/rbac/infrastructure/guards/permissions.guard.js';
import { ProjectFileController } from '../src/modules/project/presentation/controllers/project-file.controller.js';
import { ProjectFileService } from '../src/modules/project/application/services/project-file.service.js';
import { ProjectMemberGuard } from '../src/modules/project/infrastructure/guards/project-member.guard.js';
import type { IProjectFileRepository } from '../src/modules/project/domain/interfaces/project-file.repository.interface.js';
import type { IProjectRepository } from '../src/modules/project/domain/interfaces/project.repository.interface.js';
import type { IStorageRepository } from '../src/modules/storage/domain/interfaces/storage.repository.interface.js';
import { AuditLogRepository } from '../src/modules/rbac/infrastructure/repositories/audit-log.repository.js';
import { ProjectFile } from '../src/modules/project/domain/entities/project-file.entity.js';
import { NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { AllExceptionsFilter } from '../src/shared/filters/all-exceptions.filter.js';

const WS_ID = 'ws-e2e-001';
const PROJECT_ID = 'proj-e2e-001';
const FILE_ID = 'file-e2e-001';
const USER_ID = 'user-e2e-001';

function makeProject(overrides?: { workspaceId?: string }) {
  return {
    id: PROJECT_ID,
    workspaceId: overrides?.workspaceId ?? WS_ID,
    isDeleted: () => false,
    deletedAt: null,
  };
}

function makeFile(overrides?: { workspaceId?: string }) {
  return {
    id: FILE_ID,
    workspaceId: overrides?.workspaceId ?? WS_ID,
    isDeleted: () => false,
    deletedAt: null,
  };
}

function makeProjectFile(overrides?: { id?: string; projectId?: string; fileId?: string }) {
  return ProjectFile.reconstitute({
    id: overrides?.id ?? crypto.randomUUID(),
    projectId: overrides?.projectId ?? PROJECT_ID,
    fileId: overrides?.fileId ?? FILE_ID,
    addedBy: USER_ID,
    createdAt: new Date('2026-07-19T12:00:00Z'),
  });
}

describe('ProjectFileController (e2e)', () => {
  let app: INestApplication;
  let projectFileRepo: jest.Mocked<IProjectFileRepository>;
  let projectRepo: jest.Mocked<IProjectRepository>;
  let storageRepo: jest.Mocked<IStorageRepository>;
  let auditRepo: jest.Mocked<AuditLogRepository>;

  beforeAll(async () => {
    const mockProjectFileRepo = {
      save: jest.fn(),
      findByProjectId: jest.fn(),
      findByFileId: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      countByProjectId: jest.fn(),
      exists: jest.fn(),
    };

    const mockProjectRepo = {
      findById: jest.fn(),
      isMember: jest.fn().mockResolvedValue(true),
    };

    const mockStorageRepo = {
      findById: jest.fn(),
    };

    const mockAuditRepo = {
      save: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProjectFileController],
      providers: [
        ProjectFileService,
        ProjectMemberGuard,
        { provide: 'IProjectFileRepository', useValue: mockProjectFileRepo },
        { provide: 'IProjectRepository', useValue: mockProjectRepo },
        { provide: 'IStorageRepository', useValue: mockStorageRepo },
        { provide: AuditLogRepository, useValue: mockAuditRepo },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.user = { userId: USER_ID, planSlug: 'enterprise' };
          return true;
        },
      })
      .overrideGuard(WorkspaceGuard)
      .useValue({
        canActivate: (ctx: any) => {
          const req = ctx.switchToHttp().getRequest();
          req.workspaceId = WS_ID;
          return true;
        },
      })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    app.useGlobalFilters(new AllExceptionsFilter());
    await app.init();

    projectFileRepo = moduleFixture.get('IProjectFileRepository');
    projectRepo = moduleFixture.get('IProjectRepository');
    storageRepo = moduleFixture.get('IStorageRepository');
    auditRepo = moduleFixture.get(AuditLogRepository);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    projectRepo.isMember.mockResolvedValue(true);
    projectRepo.findById.mockReset();
    projectRepo.findById.mockResolvedValue(undefined);
  });

  // ─── POST /projects/:projectId/files/:fileId ─────────────────────────────

  describe('POST /projects/:projectId/files/:fileId', () => {
    it('should attach a file to a project (201)', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      storageRepo.findById.mockResolvedValue(makeFile() as any);
      projectFileRepo.find.mockResolvedValue(null);
      projectFileRepo.save.mockResolvedValue();

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.projectId).toBe(PROJECT_ID);
      expect(res.body.data.fileId).toBe(FILE_ID);
      expect(res.body.data.addedBy).toBe(USER_ID);
      expect(projectFileRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should return 404 when project not found', async () => {
      projectRepo.findById.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 when file not found', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      storageRepo.findById.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 when project workspace mismatch', async () => {
      projectRepo.findById.mockResolvedValue(makeProject({ workspaceId: 'other-ws' }) as any);

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 when file workspace mismatch', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      storageRepo.findById.mockResolvedValue(makeFile({ workspaceId: 'other-ws' }) as any);

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should return 409 when file already attached', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      storageRepo.findById.mockResolvedValue(makeFile() as any);
      projectFileRepo.find.mockResolvedValue(makeProjectFile() as any);

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(409);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 when project is soft-deleted', async () => {
      projectRepo.findById.mockResolvedValue({
        ...makeProject(),
        isDeleted: () => true,
      } as any);

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 when user is not a project member', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectRepo.isMember.mockResolvedValue(false);
      storageRepo.findById.mockResolvedValue(makeFile() as any);

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  // ─── DELETE /projects/:projectId/files/:fileId ────────────────────────────

  describe('DELETE /projects/:projectId/files/:fileId', () => {
    it('should detach a file from a project (204)', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.find.mockResolvedValue(makeProjectFile() as any);
      projectFileRepo.delete.mockResolvedValue();

      await request(app.getHttpServer())
        .delete(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(204);

      expect(projectFileRepo.delete).toHaveBeenCalledWith(PROJECT_ID, FILE_ID);
    });

    it('should return 404 when project not found', async () => {
      projectRepo.findById.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .delete(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 404 when association not found', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.find.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .delete(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 when workspace mismatch', async () => {
      projectRepo.findById.mockResolvedValue(makeProject({ workspaceId: 'other-ws' }) as any);

      const res = await request(app.getHttpServer())
        .delete(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should not expose body on 204', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.find.mockResolvedValue(makeProjectFile() as any);
      projectFileRepo.delete.mockResolvedValue();

      const res = await request(app.getHttpServer())
        .delete(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(204);

      expect(res.body).toEqual({});
    });

    it('should return 403 when user is not a project member', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectRepo.isMember.mockResolvedValue(false);

      const res = await request(app.getHttpServer())
        .delete(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  // ─── GET /projects/:projectId/files ──────────────────────────────────────

  describe('GET /projects/:projectId/files', () => {
    it('should list project files (200)', async () => {
      const pf = makeProjectFile();
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.findByProjectId.mockResolvedValue([pf]);
      projectFileRepo.countByProjectId.mockResolvedValue(1);

      const res = await request(app.getHttpServer())
        .get(`/projects/${PROJECT_ID}/files`)
        .set('x-workspace-id', WS_ID)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].projectId).toBe(PROJECT_ID);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBe(1);
    });

    it('should return empty array when no files', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.findByProjectId.mockResolvedValue([]);
      projectFileRepo.countByProjectId.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get(`/projects/${PROJECT_ID}/files`)
        .set('x-workspace-id', WS_ID)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.meta.total).toBe(0);
    });

    it('should return 404 when project not found', async () => {
      projectRepo.findById.mockResolvedValue(null);

      const res = await request(app.getHttpServer())
        .get(`/projects/${PROJECT_ID}/files`)
        .set('x-workspace-id', WS_ID)
        .expect(404);

      expect(res.body.success).toBe(false);
    });

    it('should return 403 when workspace mismatch', async () => {
      projectRepo.findById.mockResolvedValue(makeProject({ workspaceId: 'other-ws' }) as any);

      const res = await request(app.getHttpServer())
        .get(`/projects/${PROJECT_ID}/files`)
        .set('x-workspace-id', WS_ID)
        .expect(403);

      expect(res.body.success).toBe(false);
    });

    it('should handle pagination query params', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.findByProjectId.mockResolvedValue([]);
      projectFileRepo.countByProjectId.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get(`/projects/${PROJECT_ID}/files`)
        .query({ page: '2', limit: '5' })
        .set('x-workspace-id', WS_ID)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.meta.page).toBe(2);
      expect(res.body.meta.limit).toBe(5);
    });

    it('should use default pagination when no query params', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.findByProjectId.mockResolvedValue([]);
      projectFileRepo.countByProjectId.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get(`/projects/${PROJECT_ID}/files`)
        .set('x-workspace-id', WS_ID)
        .expect(200);

      expect(res.body.meta.page).toBe(1);
      expect(res.body.meta.limit).toBe(20);
    });

    it('should return correct totalPages', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.findByProjectId.mockResolvedValue([]);
      projectFileRepo.countByProjectId.mockResolvedValue(25);

      const res = await request(app.getHttpServer())
        .get(`/projects/${PROJECT_ID}/files`)
        .query({ limit: '10' })
        .set('x-workspace-id', WS_ID)
        .expect(200);

      expect(res.body.meta.totalPages).toBe(3);
    });

    it('should return 403 when user is not a project member', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectRepo.isMember.mockResolvedValue(false);

      const res = await request(app.getHttpServer())
        .get(`/projects/${PROJECT_ID}/files`)
        .set('x-workspace-id', WS_ID)
        .expect(403);

      expect(res.body.success).toBe(false);
    });
  });

  // ─── Response format ─────────────────────────────────────────────────────

  describe('response format', () => {
    it('POST should return {success, data} with ProjectFileResponseDto fields', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      storageRepo.findById.mockResolvedValue(makeFile() as any);
      projectFileRepo.find.mockResolvedValue(null);
      projectFileRepo.save.mockResolvedValue();

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(201);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body.data).toHaveProperty('id');
      expect(res.body.data).toHaveProperty('projectId');
      expect(res.body.data).toHaveProperty('fileId');
      expect(res.body.data).toHaveProperty('addedBy');
      expect(res.body.data).toHaveProperty('createdAt');
    });

    it('GET should return {success, data, meta}', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.findByProjectId.mockResolvedValue([]);
      projectFileRepo.countByProjectId.mockResolvedValue(0);

      const res = await request(app.getHttpServer())
        .get(`/projects/${PROJECT_ID}/files`)
        .set('x-workspace-id', WS_ID)
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
      expect(res.body).toHaveProperty('meta');
      expect(res.body.meta).toHaveProperty('page');
      expect(res.body.meta).toHaveProperty('limit');
      expect(res.body.meta).toHaveProperty('total');
      expect(res.body.meta).toHaveProperty('totalPages');
    });
  });

  // ─── Audit behavior ──────────────────────────────────────────────────────

  describe('audit behavior', () => {
    it('should save audit log on attach', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      storageRepo.findById.mockResolvedValue(makeFile() as any);
      projectFileRepo.find.mockResolvedValue(null);
      projectFileRepo.save.mockResolvedValue();

      await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(201);

      expect(auditRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should save audit log on detach', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      projectFileRepo.find.mockResolvedValue(makeProjectFile() as any);
      projectFileRepo.delete.mockResolvedValue();

      await request(app.getHttpServer())
        .delete(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(204);

      expect(auditRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should not block operation when audit fails', async () => {
      projectRepo.findById.mockResolvedValue(makeProject() as any);
      storageRepo.findById.mockResolvedValue(makeFile() as any);
      projectFileRepo.find.mockResolvedValue(null);
      projectFileRepo.save.mockResolvedValue();
      auditRepo.save.mockRejectedValue(new Error('audit write failed'));

      const res = await request(app.getHttpServer())
        .post(`/projects/${PROJECT_ID}/files/${FILE_ID}`)
        .set('x-workspace-id', WS_ID)
        .expect(201);

      expect(res.body.success).toBe(true);
    });
  });
});
