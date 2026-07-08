import { Test, TestingModule } from '@nestjs/testing';
import { ToolExecutorService } from '../tool-executor.service.js';
import type { IToolRegistry } from '../../domain/tool-registry.interface.js';
import { InMemoryToolRegistry } from '../../../testing/adapters/in-memory-tool-registry.js';
import { ToolEntity } from '../../domain/tool.entity.js';

function createTool(
  name: string,
  description: string,
  schema: Record<string, unknown>,
  permissions: string[] = ['math:execute'],
  metadata?: Record<string, unknown>,
): ToolEntity {
  return ToolEntity.create(name, description, schema, permissions, undefined, metadata);
}

describe('ToolExecutorService', () => {
  let executor: ToolExecutorService;
  let registry: IToolRegistry;
  let toolId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToolExecutorService,
        { provide: 'IToolRegistry', useClass: InMemoryToolRegistry },
      ],
    }).compile();

    executor = module.get(ToolExecutorService);
    registry = module.get('IToolRegistry');

    const tool = createTool('math-tool', 'Performs math operations', {
      input: {
        type: 'object',
        properties: {
          a: { type: 'number' },
          b: { type: 'number' },
          operation: { type: 'string' },
        },
        required: ['a', 'b', 'operation'],
      },
      output: {
        type: 'object',
        properties: { result: { type: 'number' } },
      },
    });
    await registry.register(tool);

    const tools = await registry.list();
    toolId = tools.items[0].id;
  });

  afterEach(async () => {
    const all = await registry.list();
    for (const item of all.items) {
      await registry.delete(item.id);
    }
  });

  describe('execute valid', () => {
    it('should execute tool with valid input and return success', async () => {
      const result = await executor.execute(toolId, {
        a: 5,
        b: 3,
        operation: 'add',
      });

      expect(result.success).toBe(true);
      expect(result.toolId).toBe(toolId);
      expect(result.error).toBeNull();
      expect(result.duration).toBeGreaterThanOrEqual(0);
      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.id).toBeDefined();
    });

    it('should include input and output in execution result', async () => {
      const result = await executor.execute(toolId, {
        a: 10,
        b: 20,
        operation: 'sum',
      });

      expect(result.input).toEqual({ a: 10, b: 20, operation: 'sum' });
      expect(result.output).toEqual({
        executed: true,
        input: { a: 10, b: 20, operation: 'sum' },
      });
    });

    it('should handle empty input when schema has no required fields', async () => {
      const noReqTool = createTool('no-req', 'No required fields', {
        input: { type: 'object', properties: { x: { type: 'string' } } },
        output: { type: 'object', properties: {} },
      });
      await registry.register(noReqTool);

      const result = await executor.execute(noReqTool.id, {});
      expect(result.success).toBe(true);
    });
  });

  describe('execute invalid (schema validation)', () => {
    it('should fail on missing required fields', async () => {
      const result = await executor.execute(toolId, { a: 5 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('Missing required field: b');
    });

    it('should fail on missing all required fields', async () => {
      const result = await executor.execute(toolId, {});

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
      expect(result.error).toContain('Missing required field: a');
      expect(result.error).toContain('Missing required field: b');
      expect(result.error).toContain('Missing required field: operation');
    });

    it('should fail on type mismatch', async () => {
      const result = await executor.execute(toolId, {
        a: 'not-a-number',
        b: 3,
        operation: 'add',
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Validation failed');
    });

    it('should fail for nonexistent tool', async () => {
      const result = await executor.execute('nonexistent-id', { x: 1 });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Tool nonexistent-id not found');
    });
  });

  describe('getContract', () => {
    it('should return input schema from tool definition', async () => {
      const contract = await executor.getContract(toolId);

      expect(contract.inputSchema).toEqual({
        type: 'object',
        properties: {
          a: { type: 'number' },
          b: { type: 'number' },
          operation: { type: 'string' },
        },
        required: ['a', 'b', 'operation'],
      });
    });

    it('should return output schema from tool definition', async () => {
      const contract = await executor.getContract(toolId);

      expect(contract.outputSchema).toEqual({
        type: 'object',
        properties: { result: { type: 'number' } },
      });
    });

    it('should return permissions from tool', async () => {
      const contract = await executor.getContract(toolId);
      expect(contract.permissions).toEqual(['math:execute']);
    });

    it('should return default timeout when not specified', async () => {
      const contract = await executor.getContract(toolId);
      expect(contract.timeout).toBe(30000);
    });

    it('should throw for nonexistent tool', async () => {
      await expect(executor.getContract('no-such-tool')).rejects.toThrow(
        'Tool no-such-tool not found',
      );
    });

    it('should return custom timeout from metadata', async () => {
      const timedTool = createTool(
        'timed-out',
        'Has custom timeout',
        {
          input: { type: 'object', properties: {} },
          output: { type: 'object', properties: {} },
        },
        ['run:timed'],
        { timeout: 5000 },
      );
      await registry.register(timedTool);

      const contract = await executor.getContract(timedTool.id);
      expect(contract.timeout).toBe(5000);
    });
  });

  describe('validate', () => {
    it('should return valid for correct input', async () => {
      const result = await executor.validate(toolId, {
        a: 1,
        b: 2,
        operation: 'add',
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return invalid for missing required fields', async () => {
      const result = await executor.validate(toolId, { a: 1 });

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should return invalid for nonexistent tool', async () => {
      const result = await executor.validate('ghost', {});
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Tool ghost not found');
    });
  });
});
