jest.mock('@xennic/database', () => ({ prisma: {} }));

import { ProjectFileRepository } from './project-file.repository.js';
import { ProjectFile } from '../../domain/entities/project-file.entity.js';
import { prisma } from '@xennic/database';

const prismaMock = prisma as any;

function makeRow(overrides?: {
  id?: string;
  project_id?: string;
  file_id?: string;
  added_by?: string;
  created_at?: Date | null;
}) {
  const row: Record<string, any> = {
    id: overrides?.id ?? crypto.randomUUID(),
    project_id: overrides?.project_id ?? 'proj-001',
    file_id: overrides?.file_id ?? 'file-001',
    added_by: overrides?.added_by ?? 'user-001',
  };
  if (overrides?.created_at !== undefined || (overrides && 'created_at' in overrides)) {
    row.created_at = overrides.created_at;
  } else {
    row.created_at = new Date('2026-01-01T00:00:00Z');
  }
  return row;
}

describe('ProjectFileRepository', () => {
  let repo: ProjectFileRepository;

  beforeEach(() => {
    repo = new ProjectFileRepository();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── save ──────────────────────────────────────────────────────────────────

  describe('save', () => {
    it('should execute INSERT SQL', async () => {
      prismaMock.$executeRaw = jest.fn().mockResolvedValue(1);
      const pf = ProjectFile.create('proj-001', 'file-001', 'user-001');

      await repo.save(pf);

      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1);
      const sql = prismaMock.$executeRaw.mock.calls[0][0];
      expect(sql.join('')).toContain('INSERT INTO "project_files"');
    });

    it('should throw on DB constraint violation', async () => {
      prismaMock.$executeRaw = jest.fn().mockRejectedValue(new Error('unique constraint'));
      const pf = ProjectFile.create('proj-001', 'file-001', 'user-001');

      await expect(repo.save(pf)).rejects.toThrow('ProjectFileRepository.save failed');
    });
  });

  // ── findByProjectId ──────────────────────────────────────────────────────

  describe('findByProjectId', () => {
    it('should return mapped ProjectFile array', async () => {
      const row = makeRow();
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([row]);

      const result = await repo.findByProjectId('proj-001');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(ProjectFile);
      expect(result[0].projectId).toBe('proj-001');
      expect(result[0].fileId).toBe('file-001');
    });

    it('should return empty array on DB error', async () => {
      prismaMock.$queryRaw = jest.fn().mockRejectedValue(new Error('connection lost'));

      const result = await repo.findByProjectId('proj-001');

      expect(result).toEqual([]);
    });

    it('should return empty array when no rows', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([]);

      const result = await repo.findByProjectId('proj-001');

      expect(result).toEqual([]);
    });

    it('should apply LIMIT and OFFSET', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([]);

      await repo.findByProjectId('proj-001', 10, 5);

      const sql = prismaMock.$queryRaw.mock.calls[0][0];
      const sqlStr = sql.join('');
      expect(sqlStr).toContain('LIMIT');
      expect(sqlStr).toContain('OFFSET');
    });
  });

  // ── findByFileId ─────────────────────────────────────────────────────────

  describe('findByFileId', () => {
    it('should return mapped ProjectFile array', async () => {
      const row1 = makeRow({ project_id: 'proj-A' });
      const row2 = makeRow({ project_id: 'proj-B' });
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([row1, row2]);

      const result = await repo.findByFileId('file-001');

      expect(result).toHaveLength(2);
      expect(result[0].projectId).toBe('proj-A');
      expect(result[1].projectId).toBe('proj-B');
    });

    it('should return empty array on DB error', async () => {
      prismaMock.$queryRaw = jest.fn().mockRejectedValue(new Error('timeout'));

      const result = await repo.findByFileId('file-001');

      expect(result).toEqual([]);
    });

    it('should return empty array when no rows', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([]);

      const result = await repo.findByFileId('file-001');

      expect(result).toEqual([]);
    });
  });

  // ── find ─────────────────────────────────────────────────────────────────

  describe('find', () => {
    it('should return single ProjectFile', async () => {
      const row = makeRow();
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([row]);

      const result = await repo.find('proj-001', 'file-001');

      expect(result).toBeInstanceOf(ProjectFile);
      expect(result!.projectId).toBe('proj-001');
      expect(result!.fileId).toBe('file-001');
    });

    it('should return null when not found', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([]);

      const result = await repo.find('proj-001', 'file-001');

      expect(result).toBeNull();
    });

    it('should return null on DB error', async () => {
      prismaMock.$queryRaw = jest.fn().mockRejectedValue(new Error('error'));

      const result = await repo.find('proj-001', 'file-001');

      expect(result).toBeNull();
    });
  });

  // ── delete ───────────────────────────────────────────────────────────────

  describe('delete', () => {
    it('should execute DELETE SQL', async () => {
      prismaMock.$executeRaw = jest.fn().mockResolvedValue(1);

      await repo.delete('proj-001', 'file-001');

      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1);
      const sql = prismaMock.$executeRaw.mock.calls[0][0];
      expect(sql.join('')).toContain('DELETE FROM "project_files"');
    });

    it('should throw on DB error', async () => {
      prismaMock.$executeRaw = jest.fn().mockRejectedValue(new Error('fk violation'));

      await expect(repo.delete('proj-001', 'file-001')).rejects.toThrow(
        'ProjectFileRepository.delete failed',
      );
    });
  });

  // ── countByProjectId ─────────────────────────────────────────────────────

  describe('countByProjectId', () => {
    it('should return count as number', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([{ count: '7' }]);

      const result = await repo.countByProjectId('proj-001');

      expect(result).toBe(7);
    });

    it('should return 0 when no rows', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([]);

      const result = await repo.countByProjectId('proj-001');

      expect(result).toBe(0);
    });

    it('should return 0 on DB error', async () => {
      prismaMock.$queryRaw = jest.fn().mockRejectedValue(new Error('error'));

      const result = await repo.countByProjectId('proj-001');

      expect(result).toBe(0);
    });
  });

  // ── exists ───────────────────────────────────────────────────────────────

  describe('exists', () => {
    it('should return true when association exists', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([{ '1': 1 }]);

      const result = await repo.exists('proj-001', 'file-001');

      expect(result).toBe(true);
    });

    it('should return false when not found', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([]);

      const result = await repo.exists('proj-001', 'file-001');

      expect(result).toBe(false);
    });

    it('should return false on DB error', async () => {
      prismaMock.$queryRaw = jest.fn().mockRejectedValue(new Error('error'));

      const result = await repo.exists('proj-001', 'file-001');

      expect(result).toBe(false);
    });
  });

  // ── _map ─────────────────────────────────────────────────────────────────

  describe('_map', () => {
    it('should map snake_case DB row to camelCase ProjectFile', async () => {
      const row = makeRow({
        id: 'pf-map-1',
        project_id: 'proj-X',
        file_id: 'file-Y',
        added_by: 'user-Z',
      });
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([row]);

      const result = await repo.findByProjectId('proj-X');

      expect(result[0].id).toBe('pf-map-1');
      expect(result[0].projectId).toBe('proj-X');
      expect(result[0].fileId).toBe('file-Y');
      expect(result[0].addedBy).toBe('user-Z');
    });

    it('should handle created_at as Date', async () => {
      const date = new Date('2026-06-15T12:30:00Z');
      const row = makeRow({ created_at: date });
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([row]);

      const result = await repo.findByProjectId('proj-001');

      expect(result[0].createdAt).toEqual(date);
    });
  });

  // ── FK constraint behavior ───────────────────────────────────────────────

  describe('FK constraint behavior', () => {
    it('should propagate project_id FK error on insert', async () => {
      prismaMock.$executeRaw = jest
        .fn()
        .mockRejectedValue(
          new Error('foreign key constraint fails: project_files_project_id_fkey'),
        );
      const pf = ProjectFile.create('nonexistent-proj', 'file-001', 'user-001');

      await expect(repo.save(pf)).rejects.toThrow('ProjectFileRepository.save failed');
    });

    it('should propagate file_id FK error on insert', async () => {
      prismaMock.$executeRaw = jest
        .fn()
        .mockRejectedValue(new Error('foreign key constraint fails: project_files_file_id_fkey'));
      const pf = ProjectFile.create('proj-001', 'nonexistent-file', 'user-001');

      await expect(repo.save(pf)).rejects.toThrow('ProjectFileRepository.save failed');
    });

    it('should propagate added_by FK error on insert', async () => {
      prismaMock.$executeRaw = jest
        .fn()
        .mockRejectedValue(new Error('foreign key constraint fails: project_files_added_by_fkey'));
      const pf = ProjectFile.create('proj-001', 'file-001', 'nonexistent-user');

      await expect(repo.save(pf)).rejects.toThrow('ProjectFileRepository.save failed');
    });

    it('should propagate unique constraint error on duplicate (project_id, file_id)', async () => {
      prismaMock.$executeRaw = jest
        .fn()
        .mockRejectedValue(
          new Error(
            'duplicate key value violates unique constraint: project_files_project_id_file_id_key',
          ),
        );
      const pf = ProjectFile.create('proj-001', 'file-001', 'user-001');

      await expect(repo.save(pf)).rejects.toThrow('ProjectFileRepository.save failed');
    });
  });

  // ── row mapping edge cases ──────────────────────────────────────────────

  describe('row mapping edge cases', () => {
    it('should handle null created_at by passing null through', async () => {
      const row = makeRow({ created_at: null as any });
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([row]);

      const result = await repo.findByProjectId('proj-001');

      expect(result[0].createdAt).toBeNull();
    });

    it('should handle multiple rows with different projects', async () => {
      const rows = [
        makeRow({ project_id: 'proj-A', file_id: 'file-1' }),
        makeRow({ project_id: 'proj-B', file_id: 'file-2' }),
        makeRow({ project_id: 'proj-A', file_id: 'file-3' }),
      ];
      prismaMock.$queryRaw = jest.fn().mockResolvedValue(rows);

      const result = await repo.findByProjectId('proj-A');

      expect(result).toHaveLength(3);
      expect(result.map((r) => r.fileId)).toEqual(['file-1', 'file-2', 'file-3']);
    });
  });

  // ── pagination parameters ───────────────────────────────────────────────

  describe('pagination parameters', () => {
    it('should use default offset=0 and limit=50', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([]);

      await repo.findByProjectId('proj-001');

      const call = prismaMock.$queryRaw.mock.calls[0];
      // Prisma tagged template: call = [strings, projectId, limit, offset]
      expect(call[1]).toBe('proj-001');
      expect(call[2]).toBe(50);
      expect(call[3]).toBe(0);
    });

    it('should use custom offset and limit', async () => {
      prismaMock.$queryRaw = jest.fn().mockResolvedValue([]);

      await repo.findByProjectId('proj-001', 20, 10);

      const call = prismaMock.$queryRaw.mock.calls[0];
      expect(call[1]).toBe('proj-001');
      expect(call[2]).toBe(10);
      expect(call[3]).toBe(20);
    });
  });
});
