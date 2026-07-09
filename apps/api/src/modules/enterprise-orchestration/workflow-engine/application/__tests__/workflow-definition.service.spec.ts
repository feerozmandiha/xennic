import { Test, TestingModule } from '@nestjs/testing';
import { WorkflowDefinitionService } from '../workflow-definition.service.js';
import { WorkflowValidatorService } from '../workflow-validator.service.js';
import { InMemoryWorkflowRepository } from '../../testing/adapters/in-memory-workflow-repository.js';

describe('WorkflowDefinitionService', () => {
  let service: WorkflowDefinitionService;
  let repository: any;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkflowDefinitionService,
        { provide: 'IWorkflowRepository', useClass: InMemoryWorkflowRepository },
        { provide: 'IWorkflowValidator', useClass: WorkflowValidatorService },
      ],
    }).compile();

    service = module.get(WorkflowDefinitionService);
    repository = module.get('IWorkflowRepository');
  });

  const validSteps = [
    {
      id: 'step-1',
      type: 'task' as const,
      name: 'Process Data',
      description: 'Process incoming data',
      config: {},
      next: ['step-2'],
      onFailure: null,
      retryConfig: null,
      timeoutMs: null,
    },
    {
      id: 'step-2',
      type: 'task' as const,
      name: 'Save Result',
      description: 'Save processed data',
      config: {},
      next: null,
      onFailure: null,
      retryConfig: null,
      timeoutMs: null,
    },
  ];

  describe('create', () => {
    it('should create a workflow definition', async () => {
      const entity = await service.create({
        name: 'test-workflow',
        description: 'A test workflow',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      expect(entity.name).toBe('test-workflow');
      expect(entity.version).toBe(1);
      expect(entity.status).toBe('draft');
      expect(entity.steps).toHaveLength(2);
    });

    it('should reject duplicate names', async () => {
      await service.create({
        name: 'dup-workflow',
        description: 'First',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      await expect(
        service.create({
          name: 'dup-workflow',
          description: 'Second',
          steps: validSteps,
          triggers: [],
          timeout: null,
          createdBy: 'user-1',
        }),
      ).rejects.toThrow('already exists');
    });

    it('should reject invalid steps', async () => {
      const invalidSteps = [
        {
          id: 'step-1',
          type: 'task' as const,
          name: 'Process',
          description: '',
          config: {},
          next: ['step-missing'],
          onFailure: null,
          retryConfig: null,
          timeoutMs: null,
        },
      ];

      await expect(
        service.create({
          name: 'invalid-workflow',
          description: 'Has bad refs',
          steps: invalidSteps,
          triggers: [],
          timeout: null,
          createdBy: 'user-1',
        }),
      ).rejects.toThrow('Workflow validation failed');
    });
  });

  describe('getByName', () => {
    it('should get the latest version by name', async () => {
      const created = await service.create({
        name: 'versioned-workflow',
        description: 'v1',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      const found = await service.getByName('versioned-workflow');
      expect(found.id).toBe(created.id);
      expect(found.version).toBe(1);
    });

    it('should get a specific version', async () => {
      const v1 = await service.create({
        name: 'multi-version',
        description: 'v1',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      await service.createVersion(v1.id, {
        description: 'v2',
      });

      const foundV1 = await service.getByName('multi-version', 1);
      expect(foundV1.version).toBe(1);
      expect(foundV1.description).toBe('v1');

      const foundV2 = await service.getByName('multi-version', 2);
      expect(foundV2.version).toBe(2);
      expect(foundV2.description).toBe('v2');
    });

    it('should throw for non-existent name', async () => {
      await expect(service.getByName('does-not-exist')).rejects.toThrow('not found');
    });
  });

  describe('versioning', () => {
    it('should create a new version', async () => {
      const v1 = await service.create({
        name: 'version-me',
        description: 'original',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      const v2 = await service.createVersion(v1.id, {
        description: 'updated',
      });

      expect(v2.version).toBe(2);
      expect(v2.description).toBe('updated');
      expect(v2.id).toBe(v1.id);
    });
  });

  describe('activate', () => {
    it('should set status to active', async () => {
      const entity = await service.create({
        name: 'activate-me',
        description: 'test',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      const activated = await service.activate(entity.id);
      expect(activated.status).toBe('active');
    });
  });

  describe('archive', () => {
    it('should set status to archived', async () => {
      const entity = await service.create({
        name: 'archive-me',
        description: 'test',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      const archived = await service.archive(entity.id);
      expect(archived.status).toBe('archived');
    });
  });

  describe('list', () => {
    it('should list all workflows', async () => {
      await service.create({
        name: 'list-a',
        description: 'A',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      await service.create({
        name: 'list-b',
        description: 'B',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      const result = await service.list();
      expect(result.total).toBeGreaterThanOrEqual(2);
    });
  });

  describe('delete', () => {
    it('should delete a workflow', async () => {
      const entity = await service.create({
        name: 'delete-me',
        description: 'test',
        steps: validSteps,
        triggers: [],
        timeout: null,
        createdBy: 'user-1',
      });

      await service.delete(entity.id);

      await expect(service.get(entity.id)).rejects.toThrow('not found');
    });
  });
});
