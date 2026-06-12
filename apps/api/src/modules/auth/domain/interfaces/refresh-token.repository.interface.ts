import { RefreshTokenEntity } from '../entities/refresh-token.entity.js';

export interface IRefreshTokenRepository {
  save(token: RefreshTokenEntity): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
  findByUserId(userId: string): Promise<RefreshTokenEntity[]>;
  revoke(id: string): Promise<void>;
  revokeAllByUserId(userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}