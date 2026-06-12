import { ProjectEntity, ProjectMember, ProjectNote } from '../entities/project.entity.js';

export interface IProjectRepository {
  // ── Project CRUD ────────────────────────────────────────────────────────────
  save(project: ProjectEntity): Promise<void>;
  findById(id: string): Promise<ProjectEntity | null>;
  findAll(workspaceId: string, offset?: number, limit?: number): Promise<ProjectEntity[]>;
  count(workspaceId: string): Promise<number>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;

  // ── Members ─────────────────────────────────────────────────────────────────
  saveMember(member: ProjectMember): Promise<void>;
  findMembers(projectId: string): Promise<ProjectMember[]>;
  findMember(projectId: string, userId: string): Promise<ProjectMember | null>;
  removeMember(projectId: string, userId: string): Promise<void>;
  isMember(projectId: string, userId: string): Promise<boolean>;

  // ── Notes ───────────────────────────────────────────────────────────────────
  saveNote(note: ProjectNote): Promise<void>;
  findNotes(projectId: string): Promise<ProjectNote[]>;
  deleteNote(noteId: string): Promise<void>;
}
