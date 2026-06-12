import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import type { IWorkspaceRepository } from '../../domain/interfaces/workspace.repository.interface.js';
import { WorkspaceEntity } from '../../domain/entities/workspace.entity.js';

@Injectable()
export class WorkspaceRepository implements IWorkspaceRepository {
  async save(workspace: WorkspaceEntity): Promise<void> {
    await prisma.workspaces.upsert({
      where: { id: workspace.id },
      update: {
        name: workspace.name,
        code: workspace.code,
        updated_by: workspace.updatedBy,
        updated_at: workspace.updatedAt,
        deleted_at: workspace.deletedAt,
      },
      create: {
        id: workspace.id,
        name: workspace.name,
        code: workspace.code,
        created_by: workspace.createdBy,
        updated_by: workspace.updatedBy,
        created_at: workspace.createdAt,
        updated_at: workspace.updatedAt,
        deleted_at: workspace.deletedAt,
      },
    });
  }

  async findById(id: string): Promise<WorkspaceEntity | null> {
    const workspace = await prisma.workspaces.findUnique({
      where: { id },
    });

    if (!workspace) return null;

    return WorkspaceEntity.reconstitute({
      id: workspace.id,
      code: workspace.code,
      name: workspace.name,
      createdBy: workspace.created_by,
      updatedBy: workspace.updated_by,
      createdAt: workspace.created_at,
      updatedAt: workspace.updated_at,
      deletedAt: workspace.deleted_at,
    });
  }

  async findByCode(code: string): Promise<WorkspaceEntity | null> {
    const workspace = await prisma.workspaces.findUnique({
      where: { code },
    });

    if (!workspace) return null;

    return WorkspaceEntity.reconstitute({
      id: workspace.id,
      code: workspace.code,
      name: workspace.name,
      createdBy: workspace.created_by,
      updatedBy: workspace.updated_by,
      createdAt: workspace.created_at,
      updatedAt: workspace.updated_at,
      deletedAt: workspace.deleted_at,
    });
  }

  async findAll(offset = 0, limit = 20): Promise<WorkspaceEntity[]> {
    const workspaces = await prisma.workspaces.findMany({
      skip: offset,
      take: limit,
      orderBy: { created_at: 'desc' },
    });

    return workspaces.map((workspace) =>
      WorkspaceEntity.reconstitute({
        id: workspace.id,
        code: workspace.code,
        name: workspace.name,
        createdBy: workspace.created_by,
        updatedBy: workspace.updated_by,
        createdAt: workspace.created_at,
        updatedAt: workspace.updated_at,
        deletedAt: workspace.deleted_at,
      }),
    );
  }

  async count(): Promise<number> {
    return prisma.workspaces.count();
  }

  async delete(id: string): Promise<void> {
    await prisma.workspaces.delete({
      where: { id },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await prisma.workspaces.count({
      where: { id },
    });
    return count > 0;
  }
}