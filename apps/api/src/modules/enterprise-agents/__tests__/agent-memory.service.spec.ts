import { Test, TestingModule } from '@nestjs/testing';
import { AgentMemory } from '../application/services/agent-memory.service.js';
import { MemoryType } from '../domain/types/agent.types.js';

describe('AgentMemory', () => {
  let service: AgentMemory;
  let sessionId: string;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AgentMemory],
    }).compile();
    service = module.get<AgentMemory>(AgentMemory);
    sessionId = service.createSession('agent-1', 'test-agent', 'ws-1').sessionId;
  });

  it('creates a session', () => {
    expect(sessionId).toBeTruthy();
    const session = service.getSession(sessionId);
    expect(session).toBeDefined();
    expect(session!.agentId).toBe('agent-1');
    expect(session!.agentSlug).toBe('test-agent');
    expect(session!.workspaceId).toBe('ws-1');
    expect(session!.entries).toHaveLength(0);
  });

  it('returns null for unknown session', () => {
    expect(service.getSession('nonexistent')).toBeNull();
  });

  it('stores a memory entry', () => {
    const entry = service.store(sessionId, {
      sessionId, agentId: 'agent-1', type: MemoryType.FACT,
      content: { key: 'value' },
    });
    expect(entry.id).toBeTruthy();
    expect(entry.sessionId).toBe(sessionId);
    expect(entry.timestamp).toBeGreaterThan(0);
    expect(entry.type).toBe(MemoryType.FACT);
  });

  it('retrieves stored entries in reverse chronological order', async () => {
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.FACT, content: { order: 1 } });
    await new Promise((r) => setTimeout(r, 5));
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.FACT, content: { order: 2 } });
    const entries = service.retrieve(sessionId);
    expect(entries).toHaveLength(2);
    expect(entries[0].content).toEqual({ order: 2 });
    expect(entries[1].content).toEqual({ order: 1 });
  });

  it('filters by memory type', () => {
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.FACT, content: {} });
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.DECISION, content: {} });
    const facts = service.retrieve(sessionId, MemoryType.FACT);
    expect(facts).toHaveLength(1);
    expect(facts[0].type).toBe(MemoryType.FACT);
    const decisions = service.retrieve(sessionId, MemoryType.DECISION);
    expect(decisions).toHaveLength(1);
  });

  it('searches memory entries by content', async () => {
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.FACT, content: { text: 'voltage drop calculation result' } });
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.FACT, content: { text: 'cable sizing recommendation' } });
    const results = await service.search(sessionId, 'voltage');
    expect(results).toHaveLength(1);
    expect(JSON.stringify(results[0].content)).toContain('voltage');
  });

  it('returns empty for search with no matches', async () => {
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.FACT, content: { text: 'something' } });
    const results = await service.search(sessionId, 'nonexistent');
    expect(results).toHaveLength(0);
  });

  it('clears all entries in a session', () => {
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.FACT, content: {} });
    service.clearSession(sessionId);
    expect(service.retrieve(sessionId)).toHaveLength(0);
  });

  it('deletes a session', () => {
    service.deleteSession(sessionId);
    expect(service.getSession(sessionId)).toBeNull();
  });

  it('throws when storing to nonexistent session', () => {
    expect(() => service.store('nonexistent', { sessionId: 'nonexistent', agentId: 'a1', type: MemoryType.FACT, content: {} })).toThrow('not found');
  });

  it('returns empty array for retrieve on nonexistent session', () => {
    expect(service.retrieve('nonexistent')).toHaveLength(0);
  });

  it('returns empty array for search on nonexistent session', async () => {
    const results = await service.search('nonexistent', 'test');
    expect(results).toHaveLength(0);
  });

  it('respects maxResults in search', async () => {
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.FACT, content: { text: 'voltage drop' } });
    service.store(sessionId, { sessionId, agentId: 'agent-1', type: MemoryType.FACT, content: { text: 'voltage rise' } });
    const results = await service.search(sessionId, 'voltage', 1);
    expect(results).toHaveLength(1);
  });
});
