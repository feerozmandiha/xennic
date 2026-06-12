import { prisma } from '../client.js';

export interface CreateWorkspaceDto {
  name: string;
}

export interface UpdateWorkspaceDto {
  name: string;
}

export class WorkspaceRepository {
  async findAll() {
    return prisma.workspaces.findMany();
  }

  async findById(id: string) {
    return prisma.workspaces.findUnique({
      where: { id },
    });
  }

  async findByCode(code: string) {
    return prisma.workspaces.findUnique({
      where: { code },
    });
  }

  async create(data: CreateWorkspaceDto) {
    // Generate unique code from name
    const code = this.generateCode(data.name);
    
    return prisma.workspaces.create({
      data: {
        name: data.name,
        code,
        created_by: 'system', // Temporary - will be replaced by auth user
      },
    });
  }

  async update(id: string, data: UpdateWorkspaceDto) {
    return prisma.workspaces.update({
      where: { id },
      data: {
        name: data.name,
        updated_at: new Date(),
      },
    });
  }

  async softDelete(id: string, deletedBy: string) {
    return prisma.workspaces.update({
      where: { id },
      data: {
        deleted_at: new Date(),
        updated_by: deletedBy,
      },
    });
  }

  async restore(id: string, restoredBy: string) {
    return prisma.workspaces.update({
      where: { id },
      data: {
        deleted_at: null,
        updated_by: restoredBy,
      },
    });
  }

  async hardDelete(id: string) {
    return prisma.workspaces.delete({
      where: { id },
    });
  }

  private generateCode(name: string): string {
    const baseCode = name
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '_')
      .slice(0, 30);
    
    const uniqueSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${baseCode}_${uniqueSuffix}`;
  }
}