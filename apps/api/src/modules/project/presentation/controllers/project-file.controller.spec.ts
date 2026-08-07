jest.mock('@xennic/database', () => ({ prisma: {} }));

import { ProjectFileController } from './project-file.controller.js';
import { ProjectFileService } from '../../application/services/project-file.service.js';
import { ProjectFile } from '../../domain/entities/project-file.entity.js';

describe('ProjectFileController', () => {
  let controller: ProjectFileController;
  let service: jest.Mocked<ProjectFileService>;

  beforeEach(() => {
    service = {
      attachFile: jest.fn(),
      detachFile: jest.fn(),
      listProjectFiles: jest.fn(),
    } as any;
    controller = new ProjectFileController(service);
    jest.clearAllMocks();
  });

  describe('POST /projects/:projectId/files/:fileId — attach', () => {
    it('should return {success, data} with ProjectFileResponseDto', async () => {
      const pf = ProjectFile.reconstitute({
        id: 'pf-1',
        projectId: 'proj-1',
        fileId: 'file-1',
        addedBy: 'user-1',
        createdAt: new Date('2026-07-19'),
      });
      service.attachFile.mockResolvedValue(pf);

      const result = await controller.attach('proj-1', 'file-1', {
        user: { userId: 'user-1' },
        workspaceId: 'ws-1',
      });

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('pf-1');
      expect(result.data.projectId).toBe('proj-1');
      expect(result.data.fileId).toBe('file-1');
      expect(result.data.addedBy).toBe('user-1');
      expect(service.attachFile).toHaveBeenCalledWith('proj-1', 'file-1', 'user-1', 'ws-1');
    });
  });

  describe('DELETE /projects/:projectId/files/:fileId — detach', () => {
    it('should call service.detachFile and return void', async () => {
      service.detachFile.mockResolvedValue(undefined);

      await controller.detach('proj-1', 'file-1', {
        user: { userId: 'user-1' },
        workspaceId: 'ws-1',
      });

      expect(service.detachFile).toHaveBeenCalledWith('proj-1', 'file-1', 'user-1', 'ws-1');
    });
  });

  describe('GET /projects/:projectId/files — list', () => {
    it('should return {success, data, meta}', async () => {
      const pf = ProjectFile.reconstitute({
        id: 'pf-1',
        projectId: 'proj-1',
        fileId: 'file-1',
        addedBy: 'user-1',
        createdAt: new Date('2026-07-19'),
      });
      service.listProjectFiles.mockResolvedValue({
        data: [pf],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const result = await controller.list(
        'proj-1',
        {
          user: { userId: 'user-1' },
          workspaceId: 'ws-1',
        },
        undefined,
        undefined,
      );

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].projectId).toBe('proj-1');
      expect(result.meta.total).toBe(1);
      expect(result.meta.totalPages).toBe(1);
    });

    it('should parse page and limit query params', async () => {
      service.listProjectFiles.mockResolvedValue({
        data: [],
        meta: { page: 2, limit: 5, total: 0, totalPages: 0 },
      });

      await controller.list(
        'proj-1',
        {
          user: { userId: 'user-1' },
          workspaceId: 'ws-1',
        },
        '2',
        '5',
      );

      expect(service.listProjectFiles).toHaveBeenCalledWith('proj-1', 'ws-1', 'user-1', 2, 5);
    });

    it('should use defaults when page/limit not provided', async () => {
      service.listProjectFiles.mockResolvedValue({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      });

      await controller.list(
        'proj-1',
        {
          user: { userId: 'user-1' },
          workspaceId: 'ws-1',
        },
        undefined,
        undefined,
      );

      expect(service.listProjectFiles).toHaveBeenCalledWith('proj-1', 'ws-1', 'user-1', 1, 20);
    });
  });

  describe('route decorators', () => {
    it('should have @UseGuards at class level', () => {
      const guards = Reflect.getMetadata('__guards__', ProjectFileController);
      expect(guards).toBeDefined();
      expect(guards.length).toBe(4);
    });

    it('should include ProjectMemberGuard in guards', () => {
      const guards = Reflect.getMetadata('__guards__', ProjectFileController);
      const names = guards.map((g: any) => g.name ?? g.toString());
      expect(names.some((n: string) => n.includes('ProjectMemberGuard'))).toBe(true);
    });

    it('attach should have @RequirePermissions("projects.update")', () => {
      const perms = Reflect.getMetadata('xennic_permissions', controller.attach);
      expect(perms).toContain('projects.update');
    });

    it('detach should have @RequirePermissions("projects.update")', () => {
      const perms = Reflect.getMetadata('xennic_permissions', controller.detach);
      expect(perms).toContain('projects.update');
    });

    it('list should have @RequirePermissions("projects.read")', () => {
      const perms = Reflect.getMetadata('xennic_permissions', controller.list);
      expect(perms).toContain('projects.read');
    });
  });
});
