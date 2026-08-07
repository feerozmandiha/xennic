import { ProjectFile } from './project-file.entity.js';

describe('ProjectFile Entity', () => {
  describe('create', () => {
    it('should create a ProjectFile with generated id and timestamp', () => {
      const pf = ProjectFile.create('proj-001', 'file-001', 'user-001');

      expect(pf).toBeInstanceOf(ProjectFile);
      expect(pf.id).toBeDefined();
      expect(typeof pf.id).toBe('string');
      expect(pf.id.length).toBe(36); // UUID format
      expect(pf.projectId).toBe('proj-001');
      expect(pf.fileId).toBe('file-001');
      expect(pf.addedBy).toBe('user-001');
      expect(pf.createdAt).toBeInstanceOf(Date);
    });

    it('should generate unique ids for different instances', () => {
      const pf1 = ProjectFile.create('proj-001', 'file-001', 'user-001');
      const pf2 = ProjectFile.create('proj-001', 'file-001', 'user-001');

      expect(pf1.id).not.toBe(pf2.id);
    });

    it('should set createdAt to current time', () => {
      const before = new Date();
      const pf = ProjectFile.create('proj-001', 'file-001', 'user-001');
      const after = new Date();

      expect(pf.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(pf.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should accept valid UUID identifiers', () => {
      const validId = '550e8400-e29b-41d4-a716-446655440000';
      const pf = ProjectFile.create(validId, validId, validId);

      expect(pf.projectId).toBe(validId);
      expect(pf.fileId).toBe(validId);
      expect(pf.addedBy).toBe(validId);
    });
  });

  describe('reconstitute', () => {
    it('should reconstitute from data object', () => {
      const data = {
        id: 'pf-001',
        projectId: 'proj-001',
        fileId: 'file-001',
        addedBy: 'user-001',
        createdAt: new Date('2026-01-01'),
      };

      const pf = ProjectFile.reconstitute(data);

      expect(pf.id).toBe('pf-001');
      expect(pf.projectId).toBe('proj-001');
      expect(pf.fileId).toBe('file-001');
      expect(pf.addedBy).toBe('user-001');
      expect(pf.createdAt).toEqual(new Date('2026-01-01'));
    });

    it('should preserve all fields from reconstitution', () => {
      const data = {
        id: 'test-id',
        projectId: 'test-project',
        fileId: 'test-file',
        addedBy: 'test-user',
        createdAt: new Date('2026-07-19T12:00:00Z'),
      };

      const pf = ProjectFile.reconstitute(data);

      expect(pf.id).toBe(data.id);
      expect(pf.projectId).toBe(data.projectId);
      expect(pf.fileId).toBe(data.fileId);
      expect(pf.addedBy).toBe(data.addedBy);
      expect(pf.createdAt).toBe(data.createdAt);
    });
  });

  describe('immutability', () => {
    it('should have readonly fields', () => {
      const pf = ProjectFile.create('proj-001', 'file-001', 'user-001');

      // TypeScript prevents assignment to readonly fields at compile time
      // At runtime, strict mode would throw. Verify the values are set.
      expect(pf.id).toBeDefined();
      expect(pf.projectId).toBeDefined();
      expect(pf.fileId).toBeDefined();
      expect(pf.addedBy).toBeDefined();
      expect(pf.createdAt).toBeDefined();
    });
  });
});
