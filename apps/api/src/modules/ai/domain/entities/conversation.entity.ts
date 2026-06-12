export class MessageEntity {
  constructor(
    public readonly id:             string,
    public readonly conversationId: string,
    public readonly role:           'user' | 'assistant' | 'system',
    public readonly content:        string,
    public readonly metadata:       Record<string, unknown>,
    public readonly createdAt:      Date,
  ) {}

  static reconstitute(data: {
    id: string; conversationId: string; role: string;
    content: string; metadata: unknown; createdAt: Date;
  }): MessageEntity {
    return new MessageEntity(
      data.id, data.conversationId,
      data.role as 'user' | 'assistant' | 'system',
      data.content,
      (data.metadata as Record<string, unknown>) ?? {},
      data.createdAt,
    );
  }
}

export class ConversationEntity {
  constructor(
    public readonly id:          string,
    public readonly workspaceId: string,
    public readonly agentId:     string,
    public          title:       string | null,
    public readonly createdAt:   Date,
    public readonly updatedAt:   Date,
    public readonly messages:    MessageEntity[],
  ) {}

  static create(workspaceId: string, agentId: string, title?: string): ConversationEntity {
    const now = new Date();
    return new ConversationEntity(
      crypto.randomUUID(), workspaceId, agentId,
      title ?? null, now, now, [],
    );
  }

  static reconstitute(data: {
    id: string; workspaceId: string; agentId: string;
    title: string | null; createdAt: Date; updatedAt: Date;
    messages?: MessageEntity[];
  }): ConversationEntity {
    return new ConversationEntity(
      data.id, data.workspaceId, data.agentId,
      data.title, data.createdAt, data.updatedAt,
      data.messages ?? [],
    );
  }
}

export class AgentEntity {
  constructor(
    public readonly id:        string,
    public readonly name:      string,
    public readonly slug:      string,
    public readonly version:   string,
    public readonly isActive:  boolean,
    public readonly createdAt: Date,
  ) {}

  static reconstitute(data: {
    id: string; name: string; slug: string;
    version: string; isActive: boolean; createdAt: Date;
  }): AgentEntity {
    return new AgentEntity(
      data.id, data.name, data.slug,
      data.version, data.isActive, data.createdAt,
    );
  }
}
