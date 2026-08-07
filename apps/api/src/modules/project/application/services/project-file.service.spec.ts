jest.mock('@xennic/database', () => ({ prisma: {} }));

import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { ProjectFileService } from './project-file.service.js';
import { ProjectFile } from '../../domain/entities/project-file.entity.js';
import type { IProjectFileRepository } from '../../domain/interfaces/project-file.repository.interface.js';
import type { IProjectRepository } from '../../domain/interfaces/project.repository.interface.js';
import type { IStorageRepository } from '../../../storage/domain/interfaces/storage.repository.interface.js';
import { AuditLogRepository } from '../../../rbac/infrastructure/repositories/audit-log.repository.js';

const WS_ID = 'ws-test-001';
const PROJECT_ID = 'proj-test-001';
const FILE_ID = 'file-test-001';
const USER_ID = 'user-test-001';

function createProject(overrides?: { workspaceId?: string; deletedAt?: Date | null }) {
  return {
    id: PROJECT_ID,
    workspaceId: overrides?.workspaceId ?? WS_ID,
    isDeleted: () => overrides?.deletedAt !== undefined && overrides.deletedAt !== null,
    deletedAt: overrides?.deletedAt ?? null,
  };
}

function createFile(overrides?: { workspaceId?: string; deletedAt?: Date | null }) {
  return {
    id: FILE_ID,
    workspaceId: overrides?.workspaceId ?? WS_ID,
    isDeleted: () => overrides?.deletedAt !== undefined && overrides.deletedAt !== null,
    deletedAt: overrides?.deletedAt ?? null,
  };
}

describe('ProjectFileService', () => {
  let service: ProjectFileService;
  let projectFileRepo: jest.Mocked<IProjectFileRepository>;
  let projectRepo: jest.Mocked<IProjectRepository>;
  let storageRepo: jest.Mocked<IStorageRepository>;
  let auditRepo: jest.Mocked<AuditLogRepository>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectFileService,
        {
          provide: 'IProjectFileRepository',
          useValue: {
            save: jest.fn(),
            findByProjectId: jest.fn(),
            findByFileId: jest.fn(),
            find: jest.fn(),
            delete: jest.fn(),
            countByProjectId: jest.fn(),
            exists: jest.fn(),
          },
        },
        {
          provide: 'IProjectRepository',
          useValue: {
            findById: jest.fn(),
            isMember: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: 'IStorageRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: AuditLogRepository,
          useValue: {
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProjectFileService>(ProjectFileService);
    projectFileRepo = module.get('IProjectFileRepository') as jest.Mocked<IProjectFileRepository>;
    projectRepo = module.get('IProjectRepository') as jest.Mocked<IProjectRepository>;
    storageRepo = module.get('IStorageRepository') as jest.Mocked<IStorageRepository>;
    auditRepo = module.get(AuditLogRepository) as jest.Mocked<AuditLogRepository>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── attachFile ──────────────────────────────────────────────────────────────

  describe('attachFile', () => {
    it('should attach a file to a project', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      storageRepo.findById.mockResolvedValue(createFile() as any);
      projectFileRepo.find.mockResolvedValue(null);
      projectFileRepo.save.mockResolvedValue();

      const result = await service.attachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID);

      expect(result).toBeInstanceOf(ProjectFile);
      expect(result.projectId).toBe(PROJECT_ID);
      expect(result.fileId).toBe(FILE_ID);
      expect(result.addedBy).toBe(USER_ID);
      expect(projectFileRepo.save).toHaveBeenCalledTimes(1);
      expect(auditRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepo.findById.mockResolvedValue(null);

      await expect(service.attachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when project workspace mismatch', async () => {
      projectRepo.findById.mockResolvedValue(createProject({ workspaceId: 'other-ws' }) as any);

      await expect(service.attachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when user is not a project member', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      projectRepo.isMember.mockResolvedValue(false);

      await expect(service.attachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when file not found', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      storageRepo.findById.mockResolvedValue(null);

      await expect(service.attachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when file workspace mismatch', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      storageRepo.findById.mockResolvedValue(createFile({ workspaceId: 'other-ws' }) as any);

      await expect(service.attachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ConflictException when file already attached', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      storageRepo.findById.mockResolvedValue(createFile() as any);
      projectFileRepo.find.mockResolvedValue({} as ProjectFile);

      await expect(service.attachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  // ── detachFile ──────────────────────────────────────────────────────────────

  describe('detachFile', () => {
    it('should detach a file from a project', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      projectFileRepo.find.mockResolvedValue({} as ProjectFile);
      projectFileRepo.delete.mockResolvedValue();

      await service.detachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID);

      expect(projectFileRepo.delete).toHaveBeenCalledWith(PROJECT_ID, FILE_ID);
      expect(auditRepo.save).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepo.findById.mockResolvedValue(null);

      await expect(service.detachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when user is not a project member', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      projectRepo.isMember.mockResolvedValue(false);

      await expect(service.detachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw NotFoundException when association not found', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      projectFileRepo.find.mockResolvedValue(null);

      await expect(service.detachFile(PROJECT_ID, FILE_ID, USER_ID, WS_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── listProjectFiles ────────────────────────────────────────────────────────

  describe('listProjectFiles', () => {
    it('should list files for a project', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      projectFileRepo.findByProjectId.mockResolvedValue([
        { id: 'pf-1', projectId: PROJECT_ID, fileId: FILE_ID } as ProjectFile,
      ]);
      projectFileRepo.countByProjectId.mockResolvedValue(1);

      const result = await service.listProjectFiles(PROJECT_ID, WS_ID, USER_ID);

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should throw NotFoundException when project not found', async () => {
      projectRepo.findById.mockResolvedValue(null);

      await expect(service.listProjectFiles(PROJECT_ID, WS_ID, USER_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when workspace mismatch', async () => {
      projectRepo.findById.mockResolvedValue(createProject({ workspaceId: 'other-ws' }) as any);

      await expect(service.listProjectFiles(PROJECT_ID, WS_ID, USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should throw ForbiddenException when user is not a project member', async () => {
      projectRepo.findById.mockResolvedValue(createProject() as any);
      projectRepo.isMember.mockResolvedValue(false);

      await expect(service.listProjectFiles(PROJECT_ID, WS_ID, USER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });
});
