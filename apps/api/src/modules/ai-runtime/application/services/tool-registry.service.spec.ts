import { Test, TestingModule } from '@nestjs/testing';
import { ToolRegistryService } from './tool-registry.service';
import { ToolDefinition } from '../../domain/types/tool.types';
import { ToolExecutionException } from '../../domain/exceptions/tool-execution.exception';

describe('ToolRegistryService', () => {
  let service: ToolRegistryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ToolRegistryService],
    }).compile();
    service = module.get<ToolRegistryService>(ToolRegistryService);
  });

  it('should register and find tools', () => {
    const tool = new ToolDefinition('calc', 'Calculator', [], 'calc-handler');
    service.register(tool);
    expect(service.get('calc')).toBeDefined();
    expect(service.getAll()).toHaveLength(1);
  });

  it('should unregister tools', () => {
    const tool = new ToolDefinition('calc', 'Calculator', [], 'calc-handler');
    service.register(tool);
    service.unregister('calc');
    expect(service.get('calc')).toBeNull();
  });

  it('should dispatch to registered handler', async () => {
    const tool = new ToolDefinition('echo', 'Echo', [], 'echo-handler');
    service.register(tool);
    service.registerHandler('echo', async (params) => params);

    const result = await service.dispatch({ toolName: 'echo', parameters: { msg: 'hi' }, callId: '1' });
    expect(result.status).toBe('success');
    expect(result.output).toEqual({ msg: 'hi' });
  });

  it('should throw on unknown tool', async () => {
    await expect(
      service.dispatch({ toolName: 'unknown', parameters: {}, callId: '1' }),
    ).rejects.toThrow(ToolExecutionException);
  });

  it('should return error result when handler fails', async () => {
    const tool = new ToolDefinition('failing', 'Fails', [], 'fail-handler');
    service.register(tool);
    service.registerHandler('failing', async () => { throw new Error('handler error'); });

    const result = await service.dispatch({ toolName: 'failing', parameters: {}, callId: '1' });
    expect(result.status).toBe('error');
    expect(result.error).toBe('handler error');
  });
});
