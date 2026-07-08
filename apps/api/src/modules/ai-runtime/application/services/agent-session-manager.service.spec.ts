import { Test, TestingModule } from '@nestjs/testing';
import { AgentSessionManagerService } from './agent-session-manager.service';
import { I_SESSION_STORE } from '../../domain/interfaces/session-store.interface';
import { InMemorySessionStore } from '../../../testing/adapters/in-memory-session.store';
import { SessionNotFoundException, SessionExpiredException } from '../../domain/exceptions/session.exception';

describe('AgentSessionManagerService', () => {
  let service: AgentSessionManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgentSessionManagerService,
        { provide: I_SESSION_STORE, useClass: InMemorySessionStore },
      ],
    }).compile();
    service = module.get<AgentSessionManagerService>(AgentSessionManagerService);
  });

  it('should create a session', async () => {
    const session = await service.create('agent-1', 'ws-1', 'user-1');
    expect(session.agentId).toBe('agent-1');
    expect(session.status).toBe('idle');
  });

  it('should return existing session for same user/agent', async () => {
    const s1 = await service.create('agent-1', 'ws-1', 'user-1');
    const s2 = await service.create('agent-1', 'ws-1', 'user-1');
    expect(s2.id).toBe(s1.id);
  });

  it('should get a session by id', async () => {
    const session = await service.create('agent-1', 'ws-1', 'user-1');
    const found = await service.get(session.id);
    expect(found.id).toBe(session.id);
  });

  it('should throw on non-existent session', async () => {
    await expect(service.get('nonexistent')).rejects.toThrow(SessionNotFoundException);
  });

  it('should transition session state', async () => {
    const session = await service.create('agent-1', 'ws-1', 'user-1');
    const updated = await service.transition(session.id, 'processing');
    expect(updated.status).toBe('processing');
  });

  it('should end a session', async () => {
    const session = await service.create('agent-1', 'ws-1', 'user-1');
    await service.end(session.id);
    await expect(service.get(session.id)).rejects.toThrow(SessionExpiredException);
  });
});
