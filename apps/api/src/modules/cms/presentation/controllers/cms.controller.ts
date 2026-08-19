import { BadRequestException, Controller, Get, Param, Query, Res } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { FastifyReply } from 'fastify';
import { CmsService } from '../../application/services/cms.service.js';

/**
 * CmsPublicController — اندپوینت‌های عمومی (بدون احراز هویت)
 *
 * - GET /cms/content/:slot0/:slot1/...  (محتوای منتشرشده)
 * - GET /cms/media/* (سرو فایل رسانه)
 */
@ApiTags('cms (public)')
@Controller('cms')
export class CmsPublicController {
  constructor(private readonly cms: CmsService) {}

  @Get('content/*')
  @ApiOperation({ summary: 'دریافت محتوای منتشرشده‌ی یک slot' })
  @ApiQuery({ name: 'locale', required: false, example: 'fa' })
  async getContent(@Param('*') wildcard: string, @Query('locale') locale?: string) {
    if (!wildcard) throw new BadRequestException('slot الزامی است');
    // wildcard ممکن است با / شروع شود
    const slot = wildcard.replace(/^\/+/, '');
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

  @Get('media/*')
  @ApiOperation({ summary: 'سرو فایل رسانه از storage محلی' })
  async serveMedia(@Param('*') wildcard: string, @Res() res: FastifyReply) {
    if (!wildcard) throw new BadRequestException('مسیر رسانه نامعتبر است');
    const objectKey = wildcard.replace(/^\/+/, '');
    const { stream, mimeType, size } = await this.cms.readMedia(objectKey);
    res
      .header('Content-Type', mimeType)
      .header('Content-Length', String(size))
      .header('Cache-Control', 'public, max-age=31536000, immutable')
      .header('X-Content-Type-Options', 'nosniff');
    return res.send(stream);
  }
}
