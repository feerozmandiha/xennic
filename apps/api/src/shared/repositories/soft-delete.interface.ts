export interface SoftDelete {
  deletedAt: Date | null;
  deletedBy?: string;
}

export interface SoftDeleteRepository<T extends SoftDelete, ID = string> {
  softDelete(id: ID, deletedBy: string): Promise<void>;
  restore(id: ID, restoredBy: string): Promise<void>;
  findWithDeleted(id: ID): Promise<T | null>;
  findAllDeleted(offset?: number, limit?: number): Promise<T[]>;
}
