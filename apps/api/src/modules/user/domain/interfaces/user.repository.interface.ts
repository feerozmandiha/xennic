import { UserEntity } from '../entities/user.entity.js';

export interface IUserRepository {
  save(user: UserEntity): Promise<void>;
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  findByPhone(phone: string): Promise<UserEntity | null>;
  findAll(offset?: number, limit?: number): Promise<UserEntity[]>;
  count(filters?: { status?: string }): Promise<number>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  existsByEmail(email: string, excludeId?: string): Promise<boolean>;
}
