import { InMemoryMemoryStore } from './in-memory-memory.store';
import { MemoryEntry } from '../../domain/types/memory.types';

describe('InMemoryMemoryStore', () => {
  let store: InMemoryMemoryStore;

  beforeEach(() => {
    store = new InMemoryMemoryStore();
  });

  it('should add and search memory entries', async () => {
    const entry = MemoryEntry.create('session-1', 'message', 'Hello');
    await store.add(entry);
    const results = await store.search({ sessionId: 'session-1' });
    expect(results).toHaveLength(1);
    expect(results[0].content).toBe('Hello');
  });

  it('should filter by type', async () => {
    await store.add(MemoryEntry.create('s1', 'message', 'msg'));
    await store.add(MemoryEntry.create('s1', 'summary', 'summary'));
    const results = await store.search({ sessionId: 's1', types: ['summary'] });
    expect(results).toHaveLength(1);
  });

  it('should clear session entries', async () => {
    await store.add(MemoryEntry.create('s1', 'message', 'msg'));
    await store.add(MemoryEntry.create('s1', 'message', 'msg2'));
    await store.add(MemoryEntry.create('s2', 'message', 'other'));
    await store.clear('s1');
    const s1Results = await store.search({ sessionId: 's1' });
    const s2Results = await store.search({ sessionId: 's2' });
    expect(s1Results).toHaveLength(0);
    expect(s2Results).toHaveLength(1);
  });
});
