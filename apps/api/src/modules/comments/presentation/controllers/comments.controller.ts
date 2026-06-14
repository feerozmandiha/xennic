import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, Req,
  UseGuards, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { CommentsService } from '../../application/services/comments.service.js';
import { CreateCommentDto, UpdateCommentDto } from '../dtos/comments.dto.js';

@ApiTags('comments')
@Controller()
export class CommentsController {
  constructor(private readonly svc: CommentsService) {}

  @Get('articles/:articleId/comments')
  @ApiOperation({ summary: 'دریافت نظرات یک مقاله' })
  @ApiParam({ name: 'articleId', type: String })
  async findByArticle(@Param('articleId') articleId: string) {
    const data = await this.svc.findByArticle(articleId);
    return { success: true, data };
  }

  @Post('articles/:articleId/comments')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'ثبت نظر جدید' })
  @ApiParam({ name: 'articleId', type: String })
  async create(
    @Param('articleId') articleId: string,
    @Body() dto: CreateCommentDto,
    @Req() req: any,
  ) {
    const data = await this.svc.create({
      articleId,
      userId: req.user.userId,
      content: dto.content,
      parentId: dto.parentId,
    });
    return { success: true, data };
  }

  @Patch('comments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'ویرایش نظر' })
  @ApiParam({ name: 'id', type: String })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCommentDto,
    @Req() req: any,
  ) {
    const data = await this.svc.update(id, req.user.userId, dto.content);
    return { success: true, data };
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'حذف نظر' })
  @ApiParam({ name: 'id', type: String })
  async delete(@Param('id') id: string, @Req() req: any) {
    const isAdmin = req.user.roles?.includes('admin') ?? false;
    await this.svc.delete(id, req.user.userId, isAdmin);
    return { success: true, message: 'نظر حذف شد' };
  }

  @Post('comments/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'لایک/آنلایک نظر' })
  @ApiParam({ name: 'id', type: String })
  async toggleLike(@Param('id') id: string, @Req() req: any) {
    const result = await this.svc.toggleLike(id, req.user.userId);
    return { success: true, data: result };
  }
}
