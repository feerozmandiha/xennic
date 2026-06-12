import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { IRoleRepository } from '../../domain/interfaces/role.repository.interface.js';
import type { IPermissionRepository } from '../../domain/interfaces/permission.repository.interface.js';
import type { IAuditLogRepository } from '../../domain/interfaces/audit-log.repository.interface.js';
import { RoleEntity } from '../../domain/entities/role.entity.js';

export interface CreateRoleInput {
  name: string;
  slug: string;
  description?: string;
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

@Injectable()
export class RoleService {
  constructor(
    @Inject('IRoleRepository')
    private readonly roleRepository: IRoleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IAuditLogRepository')
    private readonly auditLogRepository: IAuditLogRepository,
  ) {}

  // ─── findAll ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<RoleEntity[]> {
    return this.roleRepository.findAll();
  }

  // ─── findOne ─────────────────────────────────────────────────────────────────

  async findOne(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }
    return role;
  }

  // ─── create ──────────────────────────────────────────────────────────────────

  async create(
    input: CreateRoleInput,
    createdBy: string,
    meta?: { ipAddress?: string; userAgent?: string; workspaceId?: string },
  ): Promise<RoleEntity> {
    const existing = await this.roleRepository.findBySlug(
      input.slug.toUpperCase(),
    );
    if (existing) {
      throw new ConflictException(
        `Role with slug "${input.slug}" already exists`,
      );
    }

    const role = RoleEntity.create(input.name, input.slug, input.description);
    await this.roleRepository.save(role);

    await this.auditLogRepository.save({
      id: crypto.randomUUID(),
      workspaceId: meta?.workspaceId ?? null,
      userId: createdBy,
      ipAddress: meta?.ipAddress ?? null,
      userAgent: meta?.userAgent ?? null,
      action: 'role.created',
      entity: 'roles',
      entityId: role.id,
      oldValues: null,
      newValues: { name: role.name, slug: role.slug },
      metadata: null,
      createdAt: new Date(),
    } as any);

    return role;
  }

  // ─── update ──────────────────────────────────────────────────────────────────

  async update(
    id: string,
    input: UpdateRoleInput,
    updatedBy: string,
    meta?: { ipAddress?: string; userAgent?: string; workspaceId?: string },
  ): Promise<RoleEntity> {
    const role = await this.findOne(id);
    const oldValues = { name: role.name, description: role.description };

    if (input.name) role.updateName(input.name);
    if (input.description !== undefined) role.updateDescription(input.description ?? null);

    await this.roleRepository.save(role);

    await this.auditLogRepository.save({
      id: crypto.randomUUID(),
      workspaceId: meta?.workspaceId ?? null,
      userId: updatedBy,
      ipAddress: meta?.ipAddress ?? null,
      userAgent: meta?.userAgent ?? null,
      action: 'role.updated',
      entity: 'roles',
      entityId: role.id,
      oldValues,
      newValues: { name: role.name, description: role.description },
      metadata: null,
      createdAt: new Date(),
    } as any);

    return role;
  }

  // ─── remove ──────────────────────────────────────────────────────────────────

  async remove(
    id: string,
    deletedBy: string,
    meta?: { ipAddress?: string; workspaceId?: string },
  ): Promise<void> {
    const role = await this.findOne(id);
    await this.roleRepository.delete(id);

    await this.auditLogRepository.save({
      id: crypto.randomUUID(),
      workspaceId: meta?.workspaceId ?? null,
      userId: deletedBy,
      ipAddress: meta?.ipAddress ?? null,
      userAgent: null,
      action: 'role.deleted',
      entity: 'roles',
      entityId: role.id,
      oldValues: { name: role.name, slug: role.slug },
      newValues: null,
      metadata: null,
      createdAt: new Date(),
    } as any);
  }

  // ─── assignPermissions ───────────────────────────────────────────────────────

  async assignPermissions(
    roleId: string,
    permissionIds: string[],
    assignedBy: string,
    meta?: { ipAddress?: string; workspaceId?: string },
  ): Promise<void> {
    await this.findOne(roleId); // throws 404 اگر نباشد

    for (const permId of permissionIds) {
      const perm = await this.permissionRepository.findById(permId);
      if (!perm) {
        throw new NotFoundException(`Permission with ID "${permId}" not found`);
      }
      await this.permissionRepository.assignPermissionToRole(roleId, permId);
    }

    await this.auditLogRepository.save({
      id: crypto.randomUUID(),
      workspaceId: meta?.workspaceId ?? null,
      userId: assignedBy,
      ipAddress: meta?.ipAddress ?? null,
      userAgent: null,
      action: 'role.permissions.assigned',
      entity: 'roles',
      entityId: roleId,
      oldValues: null,
      newValues: { permissionIds },
      metadata: null,
      createdAt: new Date(),
    } as any);
  }

  // ─── assignRoleToUser ────────────────────────────────────────────────────────

  async assignRoleToUser(
    userId: string,
    roleId: string,
    workspaceId: string,
    assignedBy: string,
    meta?: { ipAddress?: string },
  ): Promise<void> {
    await this.findOne(roleId);
    await this.roleRepository.assignRoleToUser(userId, roleId, workspaceId, assignedBy);

    await this.auditLogRepository.save({
      id: crypto.randomUUID(),
      workspaceId,
      userId: assignedBy,
      ipAddress: meta?.ipAddress ?? null,
      userAgent: null,
      action: 'role.assigned_to_user',
      entity: 'user_roles',
      entityId: userId,
      oldValues: null,
      newValues: { roleId, workspaceId },
      metadata: null,
      createdAt: new Date(),
    } as any);
  }

  // ─── removeRoleFromUser ──────────────────────────────────────────────────────

  async removeRoleFromUser(
    userId: string,
    roleId: string,
    workspaceId: string,
    removedBy: string,
    meta?: { ipAddress?: string },
  ): Promise<void> {
    await this.roleRepository.removeRoleFromUser(userId, roleId, workspaceId);

    await this.auditLogRepository.save({
      id: crypto.randomUUID(),
      workspaceId,
      userId: removedBy,
      ipAddress: meta?.ipAddress ?? null,
      userAgent: null,
      action: 'role.removed_from_user',
      entity: 'user_roles',
      entityId: userId,
      oldValues: { roleId, workspaceId },
      newValues: null,
      metadata: null,
      createdAt: new Date(),
    } as any);
  }
}
