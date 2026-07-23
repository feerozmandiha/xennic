import type { ProjectFile } from '../entities/project-file.entity.js';

export interface IProjectFileRepository {
  save(projectFile: ProjectFile): Promise<void>;
  findByProjectId(projectId: string, offset?: number, limit?: number): Promise<ProjectFile[]>;
  findByFileId(fileId: string): Promise<ProjectFile[]>;
  find(projectId: string, fileId: string): Promise<ProjectFile | null>;
  delete(projectId: string, fileId: string): Promise<void>;
  countByProjectId(projectId: string): Promise<number>;
  exists(projectId: string, fileId: string): Promise<boolean>;
}
