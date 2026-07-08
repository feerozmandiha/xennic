export interface TemplateVariable {
  name: string;
  description: string;
  required: boolean;
  defaultValue?: string;
}

export interface TemplateSection {
  name: string;
  content: string;
  order: number;
}

export class PromptTemplate {
  constructor(
    public readonly id: string,
    public readonly key: string,
    public readonly name: string,
    public readonly version: string,
    public readonly sections: TemplateSection[],
    public readonly variables: TemplateVariable[],
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly description: string = '',
    public readonly tags: string[] = [],
  ) {}

  static create(
    key: string,
    name: string,
    sections: TemplateSection[],
    variables: TemplateVariable[],
    description?: string,
    tags?: string[],
  ): PromptTemplate {
    const now = new Date();
    return new PromptTemplate(
      crypto.randomUUID(),
      key,
      name,
      '1.0.0',
      sections,
      variables,
      now,
      now,
      description ?? '',
      tags ?? [],
    );
  }

  get fullTemplate(): string {
    return this.sections
      .sort((a, b) => a.order - b.order)
      .map(s => s.content)
      .join('\n\n');
  }
}
