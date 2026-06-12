import { PermissionEntity } from '../entities/permission.entity.js';

export interface IPermissionRepository {
  save(permission: PermissionEntity): Promise<void>;
  findById(id: string): Promise<PermissionEntity | null>;
  findBySlug(slug: string): Promise<PermissionEntity | null>;
  findAll(offset?: number, limit?: number): Promise<PermissionEntity[]>;
  findByDomain(domain: string): Promise<PermissionEntity[]>;
  count(): Promise<number>;
  delete(id: string): Promise<void>;
  hasPermissionForRoles(roleIds: string[], permissionSlug: string): Promise<boolean>;
  findPermissionsForRoles(roleIds: string[]): Promise<string[]>;
  assignPermissionToRole(roleId: string, permissionId: string): Promise<void>;
  removePermissionFromRole(roleId: string, permissionId: string): Promise<void>;
}