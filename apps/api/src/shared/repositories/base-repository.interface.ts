export interface BaseRepository<T, ID = string> {
  save(entity: T): Promise<void>;
  findById(id: ID): Promise<T | null>;
  findAll(offset?: number, limit?: number): Promise<T[]>;
  count(filters?: Record<string, unknown>): Promise<number>;
  delete(id: ID): Promise<void>;
  exists(id: ID): Promise<boolean>;
}
