import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
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
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { NotificationService } from '../../application/services/notification.service.js';
import { SendNotificationDto, NotificationResponseDto } from '../dtos/notification.dto.js';

@ApiTags('notifications')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ── GET /notifications ────────────────────────────────────────────────────

  @Get()
  @ApiOperation({
    summary: 'Get my notifications',
    description: 'Returns in-app notifications for the authenticated user.',
  })
  @ApiQuery({ name: 'page',   required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit',  required: false, type: Number, example: 20 })
  @ApiQuery({
    name: 'status', required: false,
    enum: ['pending', 'sent', 'read', 'failed'],
    description: 'Filter by status',
  })
  @ApiResponse({ status: 200, description: 'Notifications retrieved' })
  async getMyNotifications(
    @Req() req: any,
    @Query('page')   page?: string,
    @Query('limit')  limit?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.notificationService.getMyNotifications(
      req.user.userId,
      page  ? parseInt(page,  10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status,
    );
    return {
      success: true,
      data:    result.data.map(n => NotificationResponseDto.fromEntity(n)),
      meta:    result.meta,
    };
  }

  // ── GET /notifications/unread-count ───────────────────────────────────────

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(@Req() req: any) {
    const count = await this.notificationService.getUnreadCount(req.user.userId);
    // هر دو فیلد برای backward compatibility
    return { success: true, data: { count, unread: count } };
  }

  // ── PATCH /notifications/:id/read ─────────────────────────────────────────

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 200, description: 'Marked as read', type: NotificationResponseDto })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    const notification = await this.notificationService.markAsRead(id, req.user.userId);
    return { success: true, data: NotificationResponseDto.fromEntity(notification) };
  }

  // ── PATCH /notifications/read-all ─────────────────────────────────────────

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Req() req: any) {
    const result = await this.notificationService.markAllAsRead(req.user.userId);
    return { success: true, data: result };
  }

  // ── DELETE /notifications/:id ─────────────────────────────────────────────

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification UUID' })
  @ApiResponse({ status: 204, description: 'Notification deleted' })
  async delete(@Param('id') id: string, @Req() req: any) {
    await this.notificationService.delete(id, req.user.userId);
  }

  // ── POST /notifications/send ──────────────────────────────────────────────
  // (internal — برای تست و admin استفاده)

  @Post('send')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send a notification to self (test)',
    description: 'Sends a notification to the authenticated user. Useful for testing.',
  })
  @ApiBody({ type: SendNotificationDto })
  @ApiResponse({ status: 201, description: 'Notification sent', type: NotificationResponseDto })
  async sendToSelf(@Body() dto: SendNotificationDto, @Req() req: any) {
    const notification = await this.notificationService.send({
      userId:  req.user.userId,
      type:    dto.type,
      channel: dto.channel,
      title:   dto.title,
      content: dto.content,
    });
    return { success: true, data: NotificationResponseDto.fromEntity(notification) };
  }
}
