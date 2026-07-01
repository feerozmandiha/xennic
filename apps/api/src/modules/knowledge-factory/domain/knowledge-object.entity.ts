export type KnowledgeStatus = 'active' | 'superseded' | 'deprecated' | 'withdrawn' | 'archived';
export type KnowledgeTier = 'platinum' | 'gold' | 'silver' | 'bronze';

export interface KnowledgeObjectProps {
  id: string;
  xid: string;
  workspaceId: string;
  title: string;
  slug: string;
  language: string;
  tier: KnowledgeTier;
  taxonomy: Record<string, unknown>[];
  ontologyRefs: Record<string, unknown>[];
  documentVersion: number;
  checksum?: string;
  publicationDate?: Date;
  effectiveDate?: Date;
  status: KnowledgeStatus;
  license?: string;
  authorityScore: number;
  engineeringDomain?: string;
  semanticTags: string[];
  citations: Record<string, unknown>[];
  sourceUrl?: string;
  storagePath?: string;
  content: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

export class KnowledgeObject {
  constructor(private readonly props: KnowledgeObjectProps) {}

  get id(): string { return this.props.id; }
  get xid(): string { return this.props.xid; }
  get workspaceId(): string { return this.props.workspaceId; }
  get title(): string { return this.props.title; }
  get slug(): string { return this.props.slug; }
  get language(): string { return this.props.language; }
  get tier(): KnowledgeTier { return this.props.tier; }
  get taxonomy(): Record<string, unknown>[] { return this.props.taxonomy; }
  get ontologyRefs(): Record<string, unknown>[] { return this.props.ontologyRefs; }
  get documentVersion(): number { return this.props.documentVersion; }
  get checksum(): string | undefined { return this.props.checksum; }
  get publicationDate(): Date | undefined { return this.props.publicationDate; }
  get effectiveDate(): Date | undefined { return this.props.effectiveDate; }
  get status(): KnowledgeStatus { return this.props.status; }
  get license(): string | undefined { return this.props.license; }
  get authorityScore(): number { return this.props.authorityScore; }
  get engineeringDomain(): string | undefined { return this.props.engineeringDomain; }
  get semanticTags(): string[] { return this.props.semanticTags; }
  get citations(): Record<string, unknown>[] { return this.props.citations; }
  get sourceUrl(): string | undefined { return this.props.sourceUrl; }
  get storagePath(): string | undefined { return this.props.storagePath; }
  get content(): Record<string, unknown> { return this.props.content; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  updateStatus(status: KnowledgeStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  bumpVersion(): void {
    this.props.documentVersion += 1;
    this.props.updatedAt = new Date();
  }

  toJSON(): KnowledgeObjectProps {
    return { ...this.props };
  }

  static reconstitute(props: KnowledgeObjectProps): KnowledgeObject {
    return new KnowledgeObject(props);
  }
}
