import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsOptional, IsBoolean, IsUrl, ArrayMinSize, MaxLength } from 'class-validator';
import type { WebhookEntity, WebhookEvent } from '../../domain/entities/webhook.entity.js';

export class CreateWebhookDto {
  @ApiProperty({ description: 'Webhook callback URL', example: 'https://example.com/webhook' })
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  @MaxLength(500)
  url!: string;

  @ApiPropertyOptional({ description: 'Secret for HMAC signature (auto-generated if empty)' })
  @IsOptional()
  @IsString()
  @MaxLength(128)
  secret?: string;

  @ApiProperty({
    description: 'Events to subscribe to',
    example: ['project.created', 'calculation.completed'],
    isArray: true,
  })
  @IsArray()
  @ArrayMinSize(1)
  events!: WebhookEvent[];
}

export class UpdateWebhookDto {
  @ApiPropertyOptional({ description: 'New callback URL' })
  @IsOptional()
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  @MaxLength(500)
  url?: string;

  @ApiPropertyOptional({ description: 'Updated event subscriptions' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  events?: WebhookEvent[];

  @ApiPropertyOptional({ description: 'Enable or disable the webhook' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class WebhookResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty() url!: string;
  @ApiProperty() events!: string[];
  @ApiProperty() isActive!: boolean;
  @ApiProperty() createdAt!: Date;

  static fromEntity(w: WebhookEntity): WebhookResponseDto {
    const dto = new WebhookResponseDto();
    dto.id = w.id;
    dto.workspaceId = w.workspaceId;
    dto.url = w.url;
    dto.events = w.events;
    dto.isActive = w.isActive;
    dto.createdAt = w.createdAt;
    return dto;
  }
}
