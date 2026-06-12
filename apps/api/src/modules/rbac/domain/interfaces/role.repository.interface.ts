import { RoleEntity } from '../entities/role.entity.js';

export interface IRoleRepository {
  save(role: RoleEntity): Promise<void>;
  findById(id: string): Promise<RoleEntity | null>;
  findBySlug(slug: string): Promise<RoleEntity | null>;
  findAll(offset?: number, limit?: number): Promise<RoleEntity[]>;
  count(): Promise<number>;
  delete(id: string): Promise<void>;
  findUserRolesInWorkspace(userId: string, workspaceId: string): Promise<RoleEntity[]>;
  assignRoleToUser(userId: string, roleId: string, workspaceId: string, assignedBy?: string): Promise<void>;
  removeRoleFromUser(userId: string, roleId: string, workspaceId: string): Promise<void>;
}