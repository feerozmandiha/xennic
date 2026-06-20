import { IsString, IsNotEmpty, IsOptional, MaxLength, IsObject } from 'class-validator';
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

// ── Validation DTOs ──────────────────────────────────────────────────────────

export class ValidateCalculationDto {
  @ApiProperty({ example: 'CABLE-001' })
  @IsString() @IsNotEmpty()
  type!: string;

  @ApiProperty({ example: { load_current: 100, conductor_material: 'copper', cable_length_m: 50 } })
  @IsNotEmpty()
  inputs!: Record<string, any>;

  @ApiPropertyOptional({ example: { recommended_size: '35mm²', voltage_drop_percent: 1.2 } })
  @IsOptional() @IsObject()
  result?: Record<string, any>;
}

export class ValidationResponseDto {
  verified!:        boolean;
  confidence!:      'high' | 'medium' | 'low';
  summary!:         string;
  warnings!:        string[];
  recommendations!: string[];
  standards!:       string[];
  details!:         string;

  static fromAiResponse(aiContent: string, parsed?: Partial<ValidationResponseDto>): ValidationResponseDto {
    try {
      const json = JSON.parse(aiContent);
      return {
        verified:        json.verified ?? false,
        confidence:      json.confidence ?? 'low',
        summary:         json.summary ?? '',
        warnings:        json.warnings ?? [],
        recommendations: json.recommendations ?? [],
        standards:       json.standards ?? [],
        details:         json.details ?? aiContent,
      };
    } catch {
      return {
        verified:        parsed?.verified ?? false,
        confidence:      parsed?.confidence ?? 'low',
        summary:         parsed?.summary ?? 'AI validation completed',
        warnings:        parsed?.warnings ?? [],
        recommendations: parsed?.recommendations ?? [],
        standards:       parsed?.standards ?? [],
        details:         aiContent,
      };
    }
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
