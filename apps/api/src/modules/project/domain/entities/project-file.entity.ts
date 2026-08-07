export class ProjectFile {
  private constructor(
    public readonly id: string,
    public readonly projectId: string,
    public readonly fileId: string,
    public readonly addedBy: string,
    public readonly createdAt: Date,
  ) {}

  static create(projectId: string, fileId: string, addedBy: string): ProjectFile {
    return new ProjectFile(crypto.randomUUID(), projectId, fileId, addedBy, new Date());
  }

  static reconstitute(data: {
    id: string;
    projectId: string;
    fileId: string;
    addedBy: string;
    createdAt: Date;
  }): ProjectFile {
    return new ProjectFile(data.id, data.projectId, data.fileId, data.addedBy, data.createdAt);
  }
}
