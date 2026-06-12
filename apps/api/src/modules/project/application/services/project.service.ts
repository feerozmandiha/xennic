import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
// ERROR FIX TS1272: interfaces used in decorated constructor must use `import type`
import type { IProjectRepository } from '../../domain/interfaces/project.repository.interface.js';
import {
  ProjectEntity,
  ProjectMember,
  type ProjectMemberRole,
  ProjectNote,
  type ProjectStatus,
} from '../../domain/entities/project.entity.js';

// ─── Input Types ─────────────────────────────────────────────────────────────

export interface CreateProjectInput {
  workspaceId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string | null;
  status?: ProjectStatus;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface PaginatedProjects {
  data: ProjectEntity[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

// ─── Service ─────────────────────────────────────────────────────────────────

@Injectable()
export class ProjectService {
  constructor(
    @Inject('IProjectRepository')
    private readonly projectRepository: IProjectRepository,
  ) {}

  // ── findAll ─────────────────────────────────────────────────────────────────

  async findAll(
    workspaceId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedProjects> {
    const offset = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.projectRepository.findAll(workspaceId, offset, limit),
      this.projectRepository.count(workspaceId),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── findOne ─────────────────────────────────────────────────────────────────

  async findOne(id: string, workspaceId: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findById(id);
    if (!project || project.isDeleted()) {
      throw new NotFoundException(`Project with ID "${id}" not found`);
    }
    // workspace isolation
    if (project.workspaceId !== workspaceId) {
      throw new ForbiddenException('Access denied to this project');
    }
    return project;
  }

  // ── create ──────────────────────────────────────────────────────────────────

  async create(
    input: CreateProjectInput,
    userId: string,
  ): Promise<ProjectEntity> {
    const project = ProjectEntity.create(
      input.workspaceId,
      input.name,
      userId,
      input.description,
      input.startDate,
      input.endDate,
    );
    await this.projectRepository.save(project);

    // creator را به‌عنوان owner اضافه می‌کنیم
    const ownerMember = ProjectMember.create(project.id, userId, 'owner');
    await this.projectRepository.saveMember(ownerMember);

    return project;
  }

  // ── update ──────────────────────────────────────────────────────────────────

  async update(
    id: string,
    workspaceId: string,
    input: UpdateProjectInput,
    userId: string,
  ): Promise<ProjectEntity> {
    const project = await this.findOne(id, workspaceId);
    project.update(input, userId);
    await this.projectRepository.save(project);
    return project;
  }

  // ── softDelete ───────────────────────────────────────────────────────────────

  async remove(id: string, workspaceId: string, userId: string): Promise<void> {
    const project = await this.findOne(id, workspaceId);
    project.softDelete(userId);
    await this.projectRepository.save(project);
  }

  // ── hardDelete ───────────────────────────────────────────────────────────────

  async hardDelete(id: string, workspaceId: string): Promise<void> {
    await this.findOne(id, workspaceId);
    await this.projectRepository.delete(id);
  }

  // ── restore ──────────────────────────────────────────────────────────────────

  async restore(id: string, workspaceId: string, userId: string): Promise<ProjectEntity> {
    const project = await this.projectRepository.findById(id);
    if (!project) throw new NotFoundException(`Project with ID "${id}" not found`);
    if (project.workspaceId !== workspaceId) throw new ForbiddenException('Access denied');
    project.restore(userId);
    await this.projectRepository.save(project);
    return project;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // MEMBERS
  // ══════════════════════════════════════════════════════════════════════════

  async getMembers(
    projectId: string,
    workspaceId: string,
  ): Promise<ProjectMember[]> {
    await this.findOne(projectId, workspaceId);
    return this.projectRepository.findMembers(projectId);
  }

  async addMember(
    projectId: string,
    workspaceId: string,
    userId: string,
    role: ProjectMemberRole,
    addedBy: string,
  ): Promise<ProjectMember> {
    await this.findOne(projectId, workspaceId);

    const existing = await this.projectRepository.findMember(projectId, userId);
    if (existing) {
      throw new ConflictException('User is already a member of this project');
    }

    const member = ProjectMember.create(projectId, userId, role);
    await this.projectRepository.saveMember(member);
    return member;
  }

  async removeMember(
    projectId: string,
    workspaceId: string,
    userId: string,
  ): Promise<void> {
    await this.findOne(projectId, workspaceId);
    await this.projectRepository.removeMember(projectId, userId);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // NOTES
  // ══════════════════════════════════════════════════════════════════════════

  async getNotes(
    projectId: string,
    workspaceId: string,
  ): Promise<ProjectNote[]> {
    await this.findOne(projectId, workspaceId);
    return this.projectRepository.findNotes(projectId);
  }

  async addNote(
    projectId: string,
    workspaceId: string,
    content: string,
    userId: string,
  ): Promise<ProjectNote> {
    await this.findOne(projectId, workspaceId);
    const note = ProjectNote.create(projectId, content, userId);
    await this.projectRepository.saveNote(note);
    return note;
  }

  async deleteNote(
    projectId: string,
    workspaceId: string,
    noteId: string,
  ): Promise<void> {
    await this.findOne(projectId, workspaceId);
    await this.projectRepository.deleteNote(noteId);
  }
}
