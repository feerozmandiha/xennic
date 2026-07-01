import type { EkosEntity } from '../ekos.entity.js';
import type { EkoStatus } from '../constants.js';

export interface IKnowledgeFactoryRepository {
  save(entity: EkosEntity): Promise<void>;
  findById(id: string): Promise<EkosEntity | null>;
  findByChecksum(checksum: string): Promise<EkosEntity | null>;
  findByWorkspace(workspaceId: string): Promise<EkosEntity[]>;
  updateStatus(id: string, status: EkoStatus): Promise<void>;
  delete(id: string): Promise<void>;
}
