import { InMemorySessionStore } from './in-memory-session.store';
import { AgentSession } from '../../domain/types/session.types';

describe('InMemorySessionStore', () => {
  let store: InMemorySessionStore;

  beforeEach(() => {
    store = new InMemorySessionStore();
  });

  it('should create and find sessions', async () => {
    const session = AgentSession.create('agent-1', 'ws-1', 'user-1');
    await store.create(session);
    const found = await store.findById(session.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(session.id);
  });

  it('should find sessions by user', async () => {
    const s1 = AgentSession.create('agent-1', 'ws-1', 'user-1');
    const s2 = AgentSession.create('agent-2', 'ws-1', 'user-1');
    await store.create(s1);
    await store.create(s2);
    const results = await store.findByUser('ws-1', 'user-1');
    expect(results).toHaveLength(2);
  });

  it('should update sessions', async () => {
    const session = AgentSession.create('agent-1', 'ws-1', 'user-1');
    await store.create(session);
    session.transition('processing');
    await store.update(session);
    const found = await store.findById(session.id);
    expect(found!.status).toBe('processing');
  });

  it('should delete sessions', async () => {
    const session = AgentSession.create('agent-1', 'ws-1', 'user-1');
    await store.create(session);
    await store.delete(session.id);
    const found = await store.findById(session.id);
    expect(found).toBeNull();
  });

  it('should cleanup expired sessions', async () => {
    const session = AgentSession.create('agent-1', 'ws-1', 'user-1', -1);
    await store.create(session);
    const count = await store.cleanupExpired();
    expect(count).toBe(1);
  });
});
