import { Test, TestingModule } from '@nestjs/testing';
import { AgentStateManagerService } from './agent-state-manager.service';

describe('AgentStateManagerService', () => {
  let service: AgentStateManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentStateManagerService],
    }).compile();
    service = module.get<AgentStateManagerService>(AgentStateManagerService);
  });

  it('should initialize agent state', () => {
    service.initialize('agent-1', 'conv-1');
    expect(service.getPhase('agent-1')).toBe('initialized');
  });

  it('should transition through valid phases', () => {
    service.initialize('agent-1');
    service.transition('agent-1', 'context_ready');
    expect(service.getPhase('agent-1')).toBe('context_ready');
    service.transition('agent-1', 'tools_resolved');
    expect(service.getPhase('agent-1')).toBe('tools_resolved');
    service.transition('agent-1', 'prompt_rendered');
    expect(service.getPhase('agent-1')).toBe('prompt_rendered');
    service.transition('agent-1', 'llm_completed');
    expect(service.getPhase('agent-1')).toBe('llm_completed');
    service.transition('agent-1', 'response_ready');
    expect(service.getPhase('agent-1')).toBe('response_ready');
    service.transition('agent-1', 'completed');
    expect(service.getPhase('agent-1')).toBe('completed');
  });

  it('should reject invalid transitions', () => {
    service.initialize('agent-1');
    expect(() => service.transition('agent-1', 'completed')).toThrow(
      'Invalid agent phase transition',
    );
  });

  it('should store and retrieve metadata', () => {
    service.initialize('agent-1');
    service.setMetadata('agent-1', 'result', 'test-value');
    expect(service.getMetadata('agent-1', 'result')).toBe('test-value');
  });

  it('should return null for unknown agent', () => {
    expect(service.getPhase('nonexistent')).toBeNull();
  });

  it('should reset agent state', () => {
    service.initialize('agent-1');
    service.transition('agent-1', 'context_ready');
    service.reset('agent-1');
    expect(service.getPhase('agent-1')).toBe('initialized');
  });
});
