import { PromptTemplate } from './prompt.types';

describe('PromptTemplate', () => {
  it('should create a template', () => {
    const template = PromptTemplate.create(
      'test-key',
      'Test Template',
      [{ name: 'header', content: 'Hello {{name}}', order: 1 }],
      [{ name: 'name', description: 'User name', required: true }],
    );
    expect(template.key).toBe('test-key');
    expect(template.fullTemplate).toBe('Hello {{name}}');
  });

  it('should combine sections in order', () => {
    const template = PromptTemplate.create(
      'test',
      'Test',
      [
        { name: 'footer', content: 'Footer', order: 2 },
        { name: 'header', content: 'Header', order: 1 },
      ],
      [],
    );
    expect(template.fullTemplate).toBe('Header\n\nFooter');
  });
});
