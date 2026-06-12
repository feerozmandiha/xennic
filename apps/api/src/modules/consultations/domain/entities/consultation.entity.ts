export type ConsultationStatus = 'pending' | 'open' | 'answered' | 'closed';
export type ConsultationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type ConsultationCategory =
  | 'cable' | 'transformer' | 'protection' | 'power_quality'
  | 'renewable' | 'grounding' | 'motor' | 'tariff' | 'general';

export class ConsultationEntity {
  constructor(
    public readonly id:           string,
    public          workspaceId:  string,
    public          userId:       string,
    public          userName:     string,
    public          title:        string,
    public          description:  string,
    public          category:     ConsultationCategory,
    public          priority:     ConsultationPriority,
    public          status:       ConsultationStatus,
    public          attachments:  string[],
    public          tags:         string[],
    public          replies:      ConsultationReply[],
    public readonly createdAt:    Date,
    public          updatedAt:    Date,
    public          answeredAt:   Date | null,
  ) {}
}

export class ConsultationReply {
  constructor(
    public readonly id:         string,
    public          reqId:      string,
    public          authorId:   string,
    public          authorName: string,
    public          isExpert:   boolean,
    public          content:    string,
    public readonly createdAt:  Date,
  ) {}
}
