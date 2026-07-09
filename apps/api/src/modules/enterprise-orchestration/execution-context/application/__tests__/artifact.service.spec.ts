import { Test, TestingModule } from '@nestjs/testing';
import { ArtifactService } from '../artifact.service.js';
import { InMemoryContextRepository } from '../../testing/adapters/in-memory-context-repository.js';
import type { IContextRepository } from '../../domain/context-repository.interface.js';

describe('ArtifactService', () => {
  let service: ArtifactService;
  let repository: IContextRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtifactService,
        { provide: 'IContextRepository', useClass: InMemoryContextRepository },
      ],
    }).compile();

    service = module.get(ArtifactService);
    repository = module.get('IContextRepository');
  });

  afterEach(async () => {
    for (const execId of ['exec-a', 'exec-b']) {
      const artifacts = await repository.listArtifacts(execId);
      for (const art of artifacts) {
        await repository.deleteArtifact(art.id);
      }
    }
  });

  describe('store', () => {
    it('should store an artifact and return it', async () => {
      const artifact = await service.store('exec-a', 'report.json', { data: 42 }, 'data', 'user-1');

      expect(artifact.id).toBeDefined();
      expect(artifact.name).toBe('report.json');
      expect(artifact.type).toBe('data');
      expect(artifact.content).toEqual({ data: 42 });
      expect(artifact.executionId).toBe('exec-a');
    });

    it('should store a file artifact with mime type and size', async () => {
      const artifact = await service.store(
        'exec-a',
        'photo.png',
        Buffer.from('fake-image'),
        'file',
        'user-1',
        'image/png',
        1024,
      );

      expect(artifact.mimeType).toBe('image/png');
      expect(artifact.size).toBe(1024);
    });
  });

  describe('get', () => {
    it('should retrieve a stored artifact', async () => {
      const stored = await service.store('exec-a', 'doc.txt', 'content', 'file', 'user-1');
      const retrieved = await service.get(stored.id);

      expect(retrieved.id).toBe(stored.id);
      expect(retrieved.name).toBe('doc.txt');
    });

    it('should throw for a non-existent artifact', async () => {
      await expect(service.get('nonexistent')).rejects.toThrow();
    });
  });

  describe('list', () => {
    it('should list all artifacts for an execution', async () => {
      await service.store('exec-a', 'a1', 'v1', 'data', 'user-1');
      await service.store('exec-a', 'a2', 'v2', 'data', 'user-1');
      await service.store('exec-b', 'b1', 'v3', 'data', 'user-1');

      const listA = await service.list('exec-a');
      const listB = await service.list('exec-b');

      expect(listA).toHaveLength(2);
      expect(listB).toHaveLength(1);
    });
  });

  describe('delete', () => {
    it('should delete an existing artifact', async () => {
      const stored = await service.store('exec-a', 'temp.txt', 'data', 'file', 'user-1');
      await service.delete(stored.id);

      await expect(service.get(stored.id)).rejects.toThrow();
    });

    it('should throw when deleting a non-existent artifact', async () => {
      await expect(service.delete('nonexistent')).rejects.toThrow();
    });
  });

  describe('share', () => {
    it('should copy an artifact to another execution', async () => {
      const source = await service.store(
        'exec-a',
        'shared.txt',
        { hello: 'world' },
        'data',
        'user-1',
      );

      const copy = await service.share('exec-b', source.id, 'user-2');

      expect(copy.id).not.toBe(source.id);
      expect(copy.name).toBe(source.name);
      expect(copy.content).toEqual(source.content);
      expect(copy.executionId).toBe('exec-b');

      const listB = await service.list('exec-b');
      expect(listB).toHaveLength(1);
      expect(listB[0].id).toBe(copy.id);
    });

    it('should throw when sharing a non-existent artifact', async () => {
      await expect(service.share('exec-b', 'nonexistent', 'user-1')).rejects.toThrow();
    });
  });
});
