import { Test, TestingModule } from '@nestjs/testing';
import { PromptTemplateService } from '../prompt-template.service.js';
import { InMemoryTemplateRegistry } from '../../../testing/adapters/in-memory-template-registry.js';

describe('PromptTemplateService', () => {
  let service: PromptTemplateService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromptTemplateService,
        { provide: 'ITemplateRegistry', useClass: InMemoryTemplateRegistry },
      ],
    }).compile();

    service = module.get(PromptTemplateService);
    registry = module.get('ITemplateRegistry');
  });

  describe('register()', () => {
    it('should register a new template', async () => {
      const template = await service.register({
        name: 'greeting',
        description: 'A greeting template',
        content: 'Hello {{name}}, welcome to {{place}}!',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'place', type: 'string', required: false, default: 'Xennic' },
        ],
        createdBy: 'user-1',
      });

      expect(template).toBeDefined();
      expect(template.name).toBe('greeting');
      expect(template.version).toBe(1);
      expect(template.variables).toHaveLength(2);
    });
  });

  describe('get()', () => {
    it('should retrieve a template by id', async () => {
      const created = await service.register({
        name: 'get-test',
        description: '',
        content: 'test',
        variables: [],
        createdBy: 'u1',
      });

      const found = await service.get(created.id);
      expect(found.id).toBe(created.id);
    });

    it('should throw for non-existent id', async () => {
      await expect(service.get('bad-id')).rejects.toThrow('not found');
    });
  });

  describe('render()', () => {
    it('should render a template with variables', async () => {
      const template = await service.register({
        name: 'render-test',
        description: '',
        content: 'Hi {{name}}, your score is {{score}}',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'score', type: 'number', required: true },
        ],
        createdBy: 'u1',
      });

      const result = await service.render(template.id, { name: 'Alice', score: '95' });
      expect(result).toBe('Hi Alice, your score is 95');
    });

    it('should use default values for missing optional variables', async () => {
      const template = await service.register({
        name: 'defaults',
        description: '',
        content: 'Hello {{name}} from {{place}}',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'place', type: 'string', required: false, default: 'Earth' },
        ],
        createdBy: 'u1',
      });

      const result = await service.render(template.id, { name: 'Bob' });
      expect(result).toBe('Hello Bob from Earth');
    });

    it('should override defaults with provided values', async () => {
      const template = await service.register({
        name: 'override',
        description: '',
        content: 'Hello {{name}} from {{place}}',
        variables: [
          { name: 'name', type: 'string', required: true },
          { name: 'place', type: 'string', required: false, default: 'Earth' },
        ],
        createdBy: 'u1',
      });

      const result = await service.render(template.id, { name: 'Bob', place: 'Mars' });
      expect(result).toBe('Hello Bob from Mars');
    });

    it('should throw when a required variable is missing', async () => {
      const template = await service.register({
        name: 'missing-required',
        description: '',
        content: '{{required}} is needed',
        variables: [
          { name: 'required', type: 'string', required: true },
        ],
        createdBy: 'u1',
      });

      await expect(
        service.render(template.id, {}),
      ).rejects.toThrow('Missing required variable');
    });

    it('should throw for non-existent template', async () => {
      await expect(service.render('bad-id', {})).rejects.toThrow('not found');
    });
  });

  describe('list()', () => {
    it('should list all templates', async () => {
      await service.register({ name: 'a', description: '', content: '', variables: [], createdBy: 'u1' });
      await service.register({ name: 'b', description: '', content: '', variables: [], createdBy: 'u1' });

      const result = await service.list();
      expect(result.total).toBe(2);
    });
  });

  describe('delete()', () => {
    it('should delete a template', async () => {
      const template = await service.register({
        name: 'to-delete',
        description: '',
        content: 'content',
        variables: [],
        createdBy: 'u1',
      });

      await service.delete(template.id);
      await expect(service.get(template.id)).rejects.toThrow('not found');
    });
  });
});