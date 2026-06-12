import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import type { IPermissionRepository } from '../../domain/interfaces/permission.repository.interface.js';
import { PermissionEntity } from '../../domain/entities/permission.entity.js';

export interface CreatePermissionInput {
  name: string;
  slug: string;
  domain: string;
  description?: string;
}

@Injectable()
export class PermissionService {
  constructor(
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
  ) {}

  // ─── findAll ─────────────────────────────────────────────────────────────────

  async findAll(): Promise<PermissionEntity[]> {
    return this.permissionRepository.findAll();
  }

  // ─── findOne ─────────────────────────────────────────────────────────────────

  async findOne(id: string): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findById(id);
    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }
    return permission;
  }

  // ─── create ──────────────────────────────────────────────────────────────────

  async create(input: CreatePermissionInput): Promise<PermissionEntity> {
    const existing = await this.permissionRepository.findBySlug(input.slug);
    if (existing) {
      throw new ConflictException(
        `Permission with slug "${input.slug}" already exists`,
      );
    }

    const permission = PermissionEntity.create(
      input.name,
      input.slug,
      input.domain,
      input.description,
    );
    await this.permissionRepository.save(permission);
    return permission;
  }

  // ─── remove ──────────────────────────────────────────────────────────────────

  async remove(id: string): Promise<void> {
    await this.findOne(id); // throws 404 اگر نباشد
    await this.permissionRepository.delete(id);
  }

  // ─── findByDomain ────────────────────────────────────────────────────────────

  async findByDomain(domain: string): Promise<PermissionEntity[]> {
    return this.permissionRepository.findByDomain(domain);
  }
}
