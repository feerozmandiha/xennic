import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard }  from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard }    from '../../infrastructure/guards/admin.guard.js';
import { AdminService }  from '../../application/services/admin.service.js';

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  // ── Dashboard ─────────────────────────────────────────────────────────────

  @Get('dashboard')
  @ApiOperation({ summary: 'آمار کلی پلتفرم' })
  async dashboard() {
    return { success: true, data: await this.svc.getDashboardStats() };
  }

  @Get('dashboard/chart')
  @ApiOperation({ summary: 'نمودار فعالیت روزانه' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  async chart(@Query('days') days?: string) {
    return { success: true, data: await this.svc.getActivityChart(Number(days ?? 30)) };
  }

  // ── Users ─────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'لیست کاربران' })
  @ApiQuery({ name: 'page',   required: false })
  @ApiQuery({ name: 'limit',  required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  async getUsers(
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const result = await this.svc.getUsers({
      page:   Number(page  ?? 1),
      limit:  Number(limit ?? 20),
      search: search  || undefined,
      status: status  || undefined,
    });
    return { success: true, data: result.data, meta: { total: result.total } };
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'ویرایش کاربر (status، isAdmin، role)' })
  async updateUser(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateUser(id, body);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف نرم کاربر' })
  async deleteUser(@Param('id') id: string) {
    return this.svc.deleteUser(id);
  }

  // ── Workspaces ────────────────────────────────────────────────────────────

  @Get('workspaces')
  @ApiOperation({ summary: 'لیست workspace ها' })
  async getWorkspaces(
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('search') search?: string,
  ) {
    const r = await this.svc.getWorkspaces({
      page: Number(page ?? 1), limit: Number(limit ?? 20), search,
    });
    return { success: true, data: r.data, meta: { total: r.total } };
  }

  @Patch('workspaces/:id/plan')
  @ApiOperation({ summary: 'تغییر پلن workspace' })
  async updatePlan(@Param('id') id: string, @Body() body: { planSlug: string }) {
    return this.svc.updateWorkspacePlan(id, body.planSlug);
  }

  // ── Plans ─────────────────────────────────────────────────────────────────

  @Get('plans')
  @ApiOperation({ summary: 'لیست پلن‌ها' })
  async getPlans() {
    return { success: true, data: await this.svc.getPlans() };
  }

  @Put('plans/:id')
  @ApiOperation({ summary: 'ویرایش پلن (قیمت، ویژگی‌ها)' })
  async updatePlan2(@Param('id') id: string, @Body() body: any) {
    return this.svc.updatePlan(id, body);
  }

  // ── Consultations ─────────────────────────────────────────────────────────

  @Get('consultations')
  @ApiOperation({ summary: 'لیست تیکت‌های مشاوره (همه workspace ها)' })
  @ApiQuery({ name: 'status',   required: false })
  @ApiQuery({ name: 'priority', required: false })
  async getConsultations(
    @Query('page')     page?:     string,
    @Query('limit')    limit?:    string,
    @Query('status')   status?:   string,
    @Query('priority') priority?: string,
  ) {
    const r = await this.svc.getConsultations({
      page: Number(page ?? 1), limit: Number(limit ?? 20),
      status:   status   || undefined,
      priority: priority || undefined,
    });
    return { success: true, data: r.data, meta: { total: r.total } };
  }

  @Post('consultations/:id/reply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'پاسخ ادمین به مشاوره' })
  async adminReply(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Req() req: any,
  ) {
    const adminName = `${req.user?.firstName ?? ''} ${req.user?.lastName ?? 'ادمین'}`.trim();
    return this.svc.adminReply(id, req.user.userId, adminName || 'ادمین Xennic', body.content);
  }

  @Patch('consultations/:id/status')
  @ApiOperation({ summary: 'تغییر وضعیت مشاوره' })
  async updateConsultationStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.svc.updateConsultationStatus(id, body.status);
  }

  // ── Articles ──────────────────────────────────────────────────────────────

  @Post('articles')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد مقاله توسط ادمین' })
  async createArticle(@Body() body: any, @Req() req: any) {
    return this.svc.adminCreateArticle({
      ...body,
      authorId:   req.user.userId,
      authorName: `${req.user?.firstName ?? ''} ${req.user?.lastName ?? 'ادمین'}`.trim() || 'تیم Xennic',
    });
  }

  @Patch('articles/:id/status')
  @ApiOperation({ summary: 'تغییر وضعیت مقاله (draft/published/archived)' })
  async updateArticleStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.svc.updateArticleStatus(id, body.status);
  }

  // ── Notifications ─────────────────────────────────────────────────────────

  @Post('notifications/broadcast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'ارسال اعلان سراسری به همه (یا یک پلن خاص)' })
  async broadcast(@Body() body: any) {
    return this.svc.sendBroadcastNotification(body);
  }

  // ── Audit Log ─────────────────────────────────────────────────────────────

  @Get('audit-log')
  @ApiOperation({ summary: 'تاریخچه تغییرات پلتفرم' })
  async auditLog(
    @Query('page')   page?:   string,
    @Query('limit')  limit?:  string,
    @Query('action') action?: string,
  ) {
    const r = await this.svc.getAuditLog({
      page: Number(page ?? 1), limit: Number(limit ?? 50), action,
    });
    return { success: true, data: r.data, meta: { total: r.total } };
  }

  // ── Settings ──────────────────────────────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'تنظیمات سیستم' })
  async getSettings() {
    return { success: true, data: await this.svc.getSettings() };
  }

  @Put('settings')
  @ApiOperation({ summary: 'آپدیت تنظیمات سیستم' })
  async updateSettings(@Body() body: Record<string, string>) {
    return this.svc.updateSettings(body);
  }
}
