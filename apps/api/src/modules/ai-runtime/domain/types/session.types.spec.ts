import { AgentSession } from './session.types';

describe('AgentSession', () => {
  it('should create a new session with idle status', () => {
    const session = AgentSession.create('agent-1', 'ws-1', 'user-1');
    expect(session.agentId).toBe('agent-1');
    expect(session.workspaceId).toBe('ws-1');
    expect(session.userId).toBe('user-1');
    expect(session.status).toBe('idle');
    expect(session.id).toBeDefined();
  });

  it('should detect expired session', () => {
    const session = AgentSession.create('agent-1', 'ws-1', 'user-1', -1);
    expect(session.isExpired()).toBe(true);
  });

  it('should allow valid state transitions', () => {
    const session = AgentSession.create('agent-1', 'ws-1', 'user-1');
    expect(session.canTransitionTo('processing')).toBe(true);
    session.transition('processing');
    expect(session.status).toBe('processing');
    session.transition('responding');
    expect(session.status).toBe('responding');
    session.transition('idle');
    expect(session.status).toBe('idle');
  });

  it('should reject invalid state transitions', () => {
    const session = AgentSession.create('agent-1', 'ws-1', 'user-1');
    expect(() => session.transition('expired')).toThrow('Invalid session transition');
  });
});
