import { IsString, IsNotEmpty, IsOptional, MaxLength, IsIn } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { AgentEntity, ConversationEntity, MessageEntity } from '../../domain/entities/conversation.entity.js';

// ── Request DTOs ──────────────────────────────────────────────────────────────

export class CreateConversationDto {
  @ApiProperty({ example: 'electrical-engineer' })
  @IsString() @IsNotEmpty()
  agentSlug!: string;

  @ApiPropertyOptional({ example: 'بررسی THD سیستم' })
  @IsOptional() @IsString() @MaxLength(100)
  title?: string;
}

export class SendMessageDto {
  @ApiProperty({ example: 'چطور THD جریان را کاهش دهم؟' })
  @IsString() @IsNotEmpty() @MaxLength(4000)
  content!: string;
}

// ── Response DTOs ─────────────────────────────────────────────────────────────

export class AgentResponseDto {
  id!:       string;
  name!:     string;
  slug!:     string;
  version!:  string;

  static fromEntity(e: AgentEntity): AgentResponseDto {
    return { id: e.id, name: e.name, slug: e.slug, version: e.version };
  }

  static fromEntities(list: AgentEntity[]): AgentResponseDto[] {
    return list.map(e => AgentResponseDto.fromEntity(e));
  }
}

export class MessageResponseDto {
  id!:             string;
  role!:           string;
  content!:        string;
  createdAt!:      string;

  static fromEntity(e: MessageEntity): MessageResponseDto {
    return {
      id:        e.id,
      role:      e.role,
      content:   e.content,
      createdAt: e.createdAt.toISOString(),
    };
  }
}

export class ConversationResponseDto {
  id!:          string;
  agentId!:     string;
  title!:       string | null;
  createdAt!:   string;
  updatedAt!:   string;
  messages!:    MessageResponseDto[];
  messageCount!: number;

  static fromEntity(e: ConversationEntity): ConversationResponseDto {
    return {
      id:           e.id,
      agentId:      e.agentId,
      title:        e.title,
      createdAt:    e.createdAt.toISOString(),
      updatedAt:    e.updatedAt.toISOString(),
      messages:     e.messages
                      .filter(m => m.role !== 'system')
                      .map(m => MessageResponseDto.fromEntity(m)),
      messageCount: e.messages.filter(m => m.role !== 'system').length,
    };
  }
}
