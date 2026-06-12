import { SessionEntity } from '../entities/session.entity.js';

export interface ISessionRepository {
  save(session: SessionEntity): Promise<void>;
  findById(id: string): Promise<SessionEntity | null>;
  findByUserId(userId: string): Promise<SessionEntity[]>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
  updateLastActivity(id: string): Promise<void>;
}