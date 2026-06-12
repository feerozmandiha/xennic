import {
  Controller, Get, Post, Patch, Body, Param, Query,
  Req, UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard }            from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { WorkspaceGuard }          from '../../../rbac/infrastructure/guards/workspace.guard.js';
import { ConsultationsService }    from '../../application/services/consultations.service.js';

@ApiTags('consultations')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, WorkspaceGuard)
@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly svc: ConsultationsService) {}

  // GET /consultations
  @Get()
  @ApiOperation({ summary: 'لیست مشاوره‌های workspace' })
  @ApiQuery({ name: 'page',   required: false, type: Number })
  @ApiQuery({ name: 'limit',  required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  async findAll(
    @Req()             req:     any,
    @Query('page')     page?:   string,
    @Query('limit')    limit?:  string,
    @Query('status')   status?: string,
  ) {
    const result = await this.svc.findAll(
      req.workspaceId,
      page  ? parseInt(page,  10) : 1,
      limit ? parseInt(limit, 10) : 20,
      status || undefined,
    );
    return { success: true, data: result.data, meta: { total: result.total } };
  }

  // GET /consultations/:id
  @Get(':id')
  @ApiOperation({ summary: 'جزئیات مشاوره' })
  @ApiParam({ name: 'id', type: String })
  async findOne(@Param('id') id: string) {
    const c = await this.svc.findById(id);
    return { success: true, data: c };
  }

  // POST /consultations
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ارسال سوال مشاوره جدید' })
  async create(@Body() dto: any, @Req() req: any) {
    const c = await this.svc.create(
      req.workspaceId, req.user.userId,
      req.user.name ?? req.user.email ?? 'کاربر',
      dto,
    );
    return { success: true, data: c };
  }

  // POST /consultations/:id/reply
  @Post(':id/reply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'پاسخ به مشاوره' })
  async reply(@Param('id') id: string, @Body() dto: any, @Req() req: any) {
    const reply = await this.svc.addReply(
      id, req.user.userId,
      req.user.name ?? 'کاربر',
      dto.content,
      dto.isExpert ?? false,
    );
    return { success: true, data: reply };
  }

  // POST /consultations/:id/ai-reply
  @Post(':id/ai-reply')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'پاسخ خودکار Groq AI به مشاوره' })
  async aiReply(@Param('id') id: string) {
    const content = await this.svc.aiAutoReply(id);
    return { success: true, data: { content } };
  }

  // PATCH /consultations/:id/status
  @Patch(':id/status')
  @ApiOperation({ summary: 'تغییر وضعیت مشاوره' })
  async updateStatus(@Param('id') id: string, @Body() dto: { status: string }) {
    return this.svc.updateStatus(id, dto.status);
  }
}
