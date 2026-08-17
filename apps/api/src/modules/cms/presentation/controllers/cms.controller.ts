import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { CmsService } from '../../application/services/cms.service.js';

/**
 * CmsPublicController — اندپوینت‌های عمومی (بدون احراز هویت)
 *
 * - GET /cms/content/:slot?locale=fa
 * - GET /cms/media/* (serve مستقیم از storage محلی)
 */
@ApiTags('cms (public)')
@Controller('cms')
export class CmsPublicController {
  constructor(private readonly cms: CmsService) {}

  @Get('content/*slot')
  @ApiOperation({ summary: 'دریافت محتوای منتشرشده‌ی یک slot' })
  @ApiParam({ name: 'slot', example: 'landing/hero' })
  @ApiQuery({ name: 'locale', required: false, example: 'fa' })
  async getContent(@Param('slot') slot: string, @Query('locale') locale?: string) {
    const content = await this.cms.getPublished(slot, locale ?? 'fa');
    return {
      success: true,
      data: content
        ? {
            id: content.id,
            slot: content.slot,
            locale: content.locale,
            version: content.version,
            publishedAt: content.publishedAt,
            document: content.document,
          }
        : null,
    };
  }

  @Get('media/*path')
  @ApiOperation({ summary: 'سرو فایل رسانه از storage محلی' })
  async serveMedia(@Param('path') path: string, @Res() res: FastifyReply) {
    if (!path) throw new BadRequestException('مسیر رسانه نامعتبر است');
    const objectKey = path;
    const { stream, mimeType, size } = await this.cms.readMedia(objectKey);
    res
      .header('Content-Type', mimeType)
      .header('Content-Length', String(size))
      .header('Cache-Control', 'public, max-age=31536000, immutable')
      .header('X-Content-Type-Options', 'nosniff');
    return res.send(stream);
  }
}
