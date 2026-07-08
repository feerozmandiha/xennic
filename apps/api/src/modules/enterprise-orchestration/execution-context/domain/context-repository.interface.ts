import type { ExecutionContext } from './execution-context.entity.js';
import type { SharedArtifact } from './shared-artifact.entity.js';
import type { SharedMemory, MemoryEntry } from './shared-memory.vo.js';

export interface IContextRepository {
  saveContext(context: ExecutionContext): Promise<void>;
  getContext(executionId: string): Promise<ExecutionContext | null>;
  deleteContext(executionId: string): Promise<void>;

  saveArtifact(artifact: SharedArtifact): Promise<void>;
  getArtifact(id: string): Promise<SharedArtifact | null>;
  listArtifacts(executionId: string): Promise<SharedArtifact[]>;
  deleteArtifact(id: string): Promise<void>;

  saveMemory(memory: SharedMemory): Promise<void>;
  getMemory(executionId: string): Promise<SharedMemory | null>;
  addMemoryEntry(executionId: string, entry: MemoryEntry): Promise<void>;
  clearMemory(executionId: string): Promise<void>;
}
