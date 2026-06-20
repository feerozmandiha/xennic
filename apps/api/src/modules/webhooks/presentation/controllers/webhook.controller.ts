import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  Body,
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
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard } from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { RequirePermissions } from '../../../rbac/infrastructure/decorators/permissions.decorator.js';
import { PermissionsGuard } from '../../../rbac/infrastructure/guards/permissions.guard.js';
import { WebhookService } from '../../application/services/webhook.service.js';
import { CreateWebhookDto, UpdateWebhookDto, WebhookResponseDto } from '../dtos/webhook.dto.js';

@ApiTags('webhooks')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard, PermissionsGuard)
@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('webhooks.create')
  @ApiOperation({ summary: 'Create a new webhook' })
  @ApiResponse({ status: 201, description: 'Webhook created' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async create(@Body() dto: CreateWebhookDto, @Req() req: any) {
    const webhook = await this.webhookService.create({
      workspaceId: req.workspaceId,
      url: dto.url,
      secret: dto.secret,
      events: dto.events,
    });
    return { success: true, data: WebhookResponseDto.fromEntity(webhook) };
  }

  @Get()
  @RequirePermissions('webhooks.read')
  @ApiOperation({ summary: 'List webhooks', description: 'Returns paginated webhooks for the workspace.' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Webhooks retrieved' })
  async findAll(@Req() req: any, @Query('page') page?: string, @Query('limit') limit?: string) {
    const result = await this.webhookService.findAll(
      req.workspaceId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
    return {
      success: true,
      data: result.data.map(w => WebhookResponseDto.fromEntity(w)),
      meta: result.meta,
    };
  }

  @Get(':id')
  @RequirePermissions('webhooks.read')
  @ApiOperation({ summary: 'Get webhook details' })
  @ApiParam({ name: 'id', description: 'Webhook UUID' })
  @ApiResponse({ status: 200, description: 'Webhook found' })
  @ApiResponse({ status: 404, description: 'Webhook not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    const webhook = await this.webhookService.findOne(id, req.workspaceId);
    return { success: true, data: WebhookResponseDto.fromEntity(webhook) };
  }

  @Patch(':id')
  @RequirePermissions('webhooks.update')
  @ApiOperation({ summary: 'Update webhook', description: 'Update URL, events, or active status.' })
  @ApiParam({ name: 'id', description: 'Webhook UUID' })
  @ApiResponse({ status: 200, description: 'Webhook updated' })
  async update(@Param('id') id: string, @Body() dto: UpdateWebhookDto, @Req() req: any) {
    const webhook = await this.webhookService.update(id, req.workspaceId, {
      url: dto.url,
      events: dto.events,
      isActive: dto.isActive,
    });
    return { success: true, data: WebhookResponseDto.fromEntity(webhook) };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions('webhooks.delete')
  @ApiOperation({ summary: 'Delete a webhook' })
  @ApiParam({ name: 'id', description: 'Webhook UUID' })
  @ApiResponse({ status: 204, description: 'Webhook deleted' })
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.webhookService.delete(id, req.workspaceId);
  }
}
