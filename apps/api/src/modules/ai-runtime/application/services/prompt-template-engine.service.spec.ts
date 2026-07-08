import { Test, TestingModule } from '@nestjs/testing';
import { PromptTemplateEngineService } from './prompt-template-engine.service';
import { PromptTemplate } from '../../domain/types/prompt.types';
import { PromptRenderingException } from '../../domain/exceptions/prompt.exception';

describe('PromptTemplateEngineService', () => {
  let service: PromptTemplateEngineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PromptTemplateEngineService],
    }).compile();
    service = module.get<PromptTemplateEngineService>(PromptTemplateEngineService);
  });

  it('should render a template with variables', () => {
    const template = PromptTemplate.create(
      'test',
      'Test',
      [{ name: 'main', content: 'Hello {{name}}! You are {{role}}.', order: 1 }],
      [
        { name: 'name', description: 'Name', required: true },
        { name: 'role', description: 'Role', required: true },
      ],
    );
    const result = service.render(template, { name: 'Ali', role: 'engineer' });
    expect(result).toBe('Hello Ali! You are engineer.');
  });

  it('should throw on missing required variables', () => {
    const template = PromptTemplate.create(
      'test',
      'Test',
      [{ name: 'main', content: 'Hello {{name}}', order: 1 }],
      [{ name: 'name', description: 'Name', required: true }],
    );
    expect(() => service.render(template, {})).toThrow(PromptRenderingException);
  });

  it('should use default values for missing optional variables', () => {
    const template = PromptTemplate.create(
      'test',
      'Test',
      [{ name: 'main', content: 'Hello {{name}}', order: 1 }],
      [{ name: 'name', description: 'Name', required: false, defaultValue: 'World' }],
    );
    const result = service.render(template, {});
    expect(result).toBe('Hello World');
  });

  it('should render from string', () => {
    const result = service.renderFromString('Hello {{name}}!', { name: 'Test' });
    expect(result).toBe('Hello Test!');
  });
});
