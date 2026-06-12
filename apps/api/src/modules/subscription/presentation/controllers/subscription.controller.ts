import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { SubscriptionService } from '../../application/services/subscription.service.js';
import {
  SubscribeDto,
  PlanResponseDto,
  SubscriptionResponseDto,
  UsageStatsDto,
} from '../dtos/subscription.dto.js';

@ApiTags('subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // ── GET /subscriptions/plans ──────────────────────────────────────────────

  @Get('plans')
  @ApiOperation({
    summary: 'List all plans',
    description: 'Returns all available subscription plans with features and pricing.',
  })
  @ApiResponse({ status: 200, description: 'Plans retrieved', type: [PlanResponseDto] })
  async getPlans() {
    const plans = await this.subscriptionService.getPlans();
    return {
      success: true,
      data: plans.map(p => PlanResponseDto.fromEntity(p)),
    };
  }

  // ── GET /subscriptions/plans/:id ─────────────────────────────────────────

  @Get('plans/:id')
  @ApiOperation({ summary: 'Get plan by ID' })
  @ApiParam({ name: 'id', description: 'Plan UUID' })
  @ApiResponse({ status: 200, type: PlanResponseDto })
  @ApiResponse({ status: 404, description: 'Plan not found' })
  async getPlan(@Param('id') id: string) {
    const plan = await this.subscriptionService.getPlan(id);
    return { success: true, data: PlanResponseDto.fromEntity(plan) };
  }
}

// ── Workspace-scoped subscription endpoints ───────────────────────────────────

@ApiTags('subscriptions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('workspaces/:workspaceId/subscription')
export class WorkspaceSubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  // ── GET /workspaces/:id/subscription ─────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Get workspace subscription',
    description: 'Returns the active subscription and plan details for the workspace.',
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'Subscription retrieved' })
  async getSubscription(@Req() req: any) {
    const workspaceId = req.workspaceId;

    const [sub, plan] = await Promise.all([
      this.subscriptionService.getActiveSubscription(workspaceId),
      this.subscriptionService.getActivePlan(workspaceId),
    ]);

    return {
      success: true,
      data: {
        subscription: sub ? SubscriptionResponseDto.fromEntity(sub) : null,
        plan:         PlanResponseDto.fromEntity(plan),
        isActive:     sub?.isActive() ?? false,
      },
    };
  }

  // ── POST /workspaces/:id/subscription ────────────────────────────────────

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Subscribe to a plan',
    description: 'Subscribes the workspace to a new plan. Cancels existing subscription.',
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiBody({ type: SubscribeDto })
  @ApiResponse({ status: 201, description: 'Subscribed successfully', type: SubscriptionResponseDto })
  @ApiResponse({ status: 409, description: 'Already subscribed to this plan' })
  async subscribe(
    @Req() req: any,
    @Body() dto: SubscribeDto,
  ) {
    const sub = await this.subscriptionService.subscribe(
      req.workspaceId,
      dto.planId,
      dto.expiresAt ? new Date(dto.expiresAt) : undefined,
    );
    return { success: true, data: SubscriptionResponseDto.fromEntity(sub) };
  }

  // ── POST /workspaces/:id/subscription/:subId/cancel ───────────────────────

  @Post(':subscriptionId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel subscription' })
  @ApiParam({ name: 'workspaceId',     description: 'Workspace UUID' })
  @ApiParam({ name: 'subscriptionId',  description: 'Subscription UUID' })
  @ApiResponse({ status: 200, description: 'Subscription cancelled' })
  async cancel(
    @Param('subscriptionId') subscriptionId: string,
    @Req() req: any,
  ) {
    const sub = await this.subscriptionService.cancel(subscriptionId, req.workspaceId);
    return { success: true, data: SubscriptionResponseDto.fromEntity(sub) };
  }

  // ── GET /workspaces/:id/subscription/history ──────────────────────────────

  @Get('history')
  @ApiOperation({ summary: 'Subscription history' })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'History retrieved' })
  async getHistory(@Req() req: any) {
    const subs = await this.subscriptionService.getWorkspaceSubscriptions(req.workspaceId);
    return {
      success: true,
      data: subs.map(s => SubscriptionResponseDto.fromEntity(s)),
    };
  }

  // ── GET /workspaces/:id/subscription/usage ────────────────────────────────

  @Get('usage')
  @ApiOperation({
    summary: 'Usage statistics',
    description: 'Returns current month usage for calculations, AI requests, etc.',
  })
  @ApiParam({ name: 'workspaceId', description: 'Workspace UUID' })
  @ApiResponse({ status: 200, description: 'Usage stats retrieved', type: UsageStatsDto })
  async getUsage(@Req() req: any) {
    const stats = await this.subscriptionService.getUsageStats(req.workspaceId);
    return { success: true, data: stats };
  }
}
