import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional, IsDateString } from 'class-validator';
import type { PlanEntity } from '../../domain/entities/plan.entity.js';
import type { SubscriptionEntity } from '../../domain/entities/subscription.entity.js';

// ─── Request DTOs ─────────────────────────────────────────────────────────────

export class SubscribeDto {
  @ApiProperty({ description: 'Plan UUID to subscribe to', example: 'plan-uuid' })
  @IsUUID()
  planId!: string;

  @ApiProperty({ description: 'Subscription expiry date (optional)', required: false })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class PlanFeaturesDto {
  @ApiProperty({ example: 3, description: '-1 = unlimited' })
  projects!: number;

  @ApiProperty({ example: 100 })
  calculations_month!: number;

  @ApiProperty({ example: 50 })
  ai_requests_month!: number;

  @ApiProperty({ example: 1 })
  storage_gb!: number;

  @ApiProperty({ example: false })
  api_access!: boolean;

  @ApiProperty({ example: ['pdf'] })
  report_formats!: string[];
}

export class PlanResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() name!: string;
  @ApiProperty({ example: 'free' }) slug!: string;
  @ApiProperty({ example: 0 }) monthlyPrice!: number;
  @ApiProperty({ example: 0 }) yearlyPrice!: number;
  @ApiProperty({ type: PlanFeaturesDto }) features!: PlanFeaturesDto;
  @ApiProperty() isActive!: boolean;

  static fromEntity(p: PlanEntity): PlanResponseDto {
    const dto = new PlanResponseDto();
    dto.id           = p.id;
    dto.name         = p.name;
    dto.slug         = p.slug;
    dto.monthlyPrice = p.monthlyPrice;
    dto.yearlyPrice  = p.yearlyPrice;
    dto.features     = p.features as PlanFeaturesDto;
    dto.isActive     = p.isActive;
    return dto;
  }
}

export class SubscriptionResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty() workspaceId!: string;
  @ApiProperty() planId!: string;
  @ApiProperty() planSlug!: string;
  @ApiProperty({ enum: ['active', 'cancelled', 'expired', 'trial'] }) status!: string;
  @ApiProperty() startsAt!: Date;
  @ApiProperty({ nullable: true }) expiresAt!: Date | null;
  @ApiProperty({ nullable: true }) cancelledAt!: Date | null;
  @ApiProperty() createdAt!: Date;

  static fromEntity(s: SubscriptionEntity): SubscriptionResponseDto {
    const dto = new SubscriptionResponseDto();
    dto.id          = s.id;
    dto.workspaceId = s.workspaceId;
    dto.planId      = s.planId;
    dto.planSlug    = s.planSlug;
    dto.status      = s.status;
    dto.startsAt    = s.startsAt;
    dto.expiresAt   = s.expiresAt;
    dto.cancelledAt = s.cancelledAt;
    dto.createdAt   = s.createdAt;
    return dto;
  }
}

export class UsageStatsDto {
  @ApiProperty({ example: 'free' }) planSlug!: string;

  @ApiProperty({ example: { used: 10, limit: 100 } })
  calculations!: { used: number; limit: number };

  @ApiProperty({ example: { used: 5, limit: 50 } })
  ai_requests!: { used: number; limit: number };
}
