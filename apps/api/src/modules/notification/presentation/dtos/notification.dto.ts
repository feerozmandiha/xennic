import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import type { NotificationEntity, NotificationType, NotificationChannel } from '../../domain/entities/notification.entity.js';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class SendNotificationDto {
  @ApiProperty({
    enum: [
      'workspace_invite','workspace_member_added','workspace_member_removed',
      'project_added','project_updated','calculation_complete',
      'subscription_changed','subscription_expiring','file_shared','system','security_alert',
    ],
    example: 'system',
  })
  @IsEnum([
    'workspace_invite','workspace_member_added','workspace_member_removed',
    'project_added','project_updated','calculation_complete',
    'subscription_changed','subscription_expiring','file_shared','system','security_alert',
  ])
  type!: NotificationType;

  @ApiProperty({ enum: ['in_app','email','sms','push'], example: 'in_app', required: false })
  @IsOptional()
  @IsEnum(['in_app','email','sms','push'])
  channel?: NotificationChannel;

  @ApiProperty({ example: 'اطلاعیه مهم', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @ApiProperty({ example: 'محتوای پیام', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class NotificationResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() userId!: string;
  @ApiProperty() type!: string;
  @ApiProperty({ enum: ['in_app','email','sms','push'] }) channel!: string;
  @ApiProperty() title!: string;
  @ApiProperty() content!: string;
  @ApiProperty({ enum: ['pending','sent','read','failed'] }) status!: string;
  @ApiProperty({ nullable: true }) sentAt!: Date | null;
  @ApiProperty() createdAt!: Date;
  @ApiProperty() isRead!: boolean;

  static fromEntity(n: NotificationEntity): NotificationResponseDto {
    const dto      = new NotificationResponseDto();
    dto.id         = n.id;
    dto.userId     = n.userId;
    dto.type       = n.type;
    dto.channel    = n.channel;
    dto.title      = n.title;
    dto.content    = n.content;
    dto.status     = n.status;
    dto.sentAt     = n.sentAt;
    dto.createdAt  = n.createdAt;
    dto.isRead     = n.isRead();
    return dto;
  }
}
