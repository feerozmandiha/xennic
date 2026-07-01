export interface ProvenanceProps {
  id: string;
  knowledgeObjectId: string;
  sourceDocument?: string;
  page?: number;
  section?: string;
  paragraph?: string;
  chunkId?: string;
  pipelineVersion?: string;
  parserVersion?: string;
  embeddingVersion?: string;
  citationChain: Record<string, unknown>[];
  traceId?: string;
  createdAt: Date;
}

export class ProvenanceRecord {
  constructor(private readonly props: ProvenanceProps) {}

  get id(): string { return this.props.id; }
  get knowledgeObjectId(): string { return this.props.knowledgeObjectId; }
  get sourceDocument(): string | undefined { return this.props.sourceDocument; }
  get page(): number | undefined { return this.props.page; }
  get section(): string | undefined { return this.props.section; }
  get paragraph(): string | undefined { return this.props.paragraph; }
  get chunkId(): string | undefined { return this.props.chunkId; }
  get pipelineVersion(): string | undefined { return this.props.pipelineVersion; }
  get parserVersion(): string | undefined { return this.props.parserVersion; }
  get embeddingVersion(): string | undefined { return this.props.embeddingVersion; }
  get citationChain(): Record<string, unknown>[] { return this.props.citationChain; }
  get traceId(): string | undefined { return this.props.traceId; }
  get createdAt(): Date { return this.props.createdAt; }

  toJSON(): ProvenanceProps {
    return { ...this.props };
  }

  static reconstitute(props: ProvenanceProps): ProvenanceRecord {
    return new ProvenanceRecord(props);
  }
}
