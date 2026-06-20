export class StandardEntity {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly title: string,
    public readonly organization: string,
    public readonly version: string,
    public readonly publishedAt: Date | null,
    public readonly status: string,
  ) {}

  static reconstitute(data: {
    id: string;
    code: string;
    title: string;
    organization: string;
    version: string;
    publishedAt: Date | null;
    status: string;
  }): StandardEntity {
    return new StandardEntity(
      data.id,
      data.code,
      data.title,
      data.organization,
      data.version,
      data.publishedAt,
      data.status,
    );
  }
}
