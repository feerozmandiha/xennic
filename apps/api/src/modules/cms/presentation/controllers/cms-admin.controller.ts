import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../../admin/infrastructure/guards/admin.guard.js';
import { CmsService } from '../../application/services/cms.service.js';
import {
  CmsContentResponseDto,
  CmsMediaResponseDto,
  PatchCmsContentDto,
  UpsertCmsContentDto,
} from '../dtos/cms-content.dto.js';

/**
 * CmsAdminController — مدیریت محتوای CMS (فقط ادمین)
 */
@ApiTags('admin / cms')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/cms')
export class CmsAdminController {
  constructor(private readonly cms: CmsService) {}

  @Get('content')
  @ApiOperation({ summary: 'لیست محتواهای CMS' })
  @ApiQuery({ name: 'locale', required: false })
  @ApiQuery({ name: 'slotPrefix', required: false })
  @ApiQuery({ name: 'publishedOnly', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async list(
    @Query('locale') locale?: string,
    @Query('slotPrefix') slotPrefix?: string,
    @Query('publishedOnly') publishedOnly?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.cms.list({
      locale: locale || undefined,
      slotPrefix: slotPrefix || undefined,
      publishedOnly: publishedOnly === 'true',
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    });
    return {
      success: true,
      data: result.data.map((e) => CmsContentResponseDto.from(e)),
      meta: result.meta,
    };
  }

  @Get('content/:id')
  @ApiOperation({ summary: 'گرفتن یک سند CMS با id' })
  async getOne(@Param('id') id: string) {
    const e = await this.cms.getById(id);
    return { success: true, data: CmsContentResponseDto.from(e) };
  }

  @Get('slot/*')
  @ApiOperation({ summary: 'گرفتن سند با slot (حتی منتشر نشده)' })
  async getBySlot(@Param('*') wildcard: string, @Query('locale') locale?: string) {
    const slot = wildcard.replace(/^\/+/, '');
    const e = await this.cms.getBySlot(slot, locale ?? 'fa');
    return { success: true, data: CmsContentResponseDto.from(e) };
  }

  @Post('content')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'ایجاد یا به‌روزرسانی محتوای یک slot' })
  async upsert(@Body() dto: UpsertCmsContentDto, @Req() req: any) {
    const entity = await this.cms.upsert({
      slot: dto.slot,
      locale: dto.locale,
      document: dto.document,
      publish: dto.publish,
      userId: req.user?.userId ?? null,
    });
    return { success: true, data: CmsContentResponseDto.from(entity) };
  }

  @Patch('content/:id')
  @ApiOperation({ summary: 'ویرایش سند (document و/یا وضعیت انتشار)' })
  async patch(@Param('id') id: string, @Body() dto: PatchCmsContentDto, @Req() req: any) {
    const entity = await this.cms.patch(id, {
      document: dto.document,
      publish: dto.publish,
      userId: req.user?.userId ?? null,
    });
    return { success: true, data: CmsContentResponseDto.from(entity) };
  }

  @Post('content/:id/publish')
  @ApiOperation({ summary: 'انتشار سند' })
  async publish(@Param('id') id: string, @Req() req: any) {
    const e = await this.cms.publish(id, req.user?.userId ?? null);
    return { success: true, data: CmsContentResponseDto.from(e) };
  }

  @Post('content/:id/unpublish')
  @ApiOperation({ summary: 'لغو انتشار سند' })
  async unpublish(@Param('id') id: string) {
    const e = await this.cms.unpublish(id);
    return { success: true, data: CmsContentResponseDto.from(e) };
  }

  @Delete('content/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'حذف سند' })
  async remove(@Param('id') id: string) {
    await this.cms.delete(id);
    return { success: true };
  }

  @Post('media')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'آپلود تصویر رسانه‌ی CMS' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        slot: { type: 'string', example: 'landing' },
      },
      required: ['file'],
    },
  })
  async uploadMedia(@Req() req: any) {
    // Fastify multipart (FileInterceptor from @nestjs/platform-express is not
    // compatible with Fastify; parse the stream just like StorageController does).
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException('درخواست باید multipart/form-data باشد');
    }
    const data = await req.file({
      limits: { fileSize: 10 * 1024 * 1024 /* 10MB */, files: 1 },
    });
    if (!data) {
      throw new BadRequestException('فایلی ارسال نشده است. فیلد file الزامی است.');
    }
    const chunks: Buffer[] = [];
    for await (const chunk of data.file) chunks.push(chunk as Buffer);
    const buffer = Buffer.concat(chunks);

    // `slot` is sent as a multipart text field
    let slot: string | undefined;
    if (data.fields?.slot) {
      const f = data.fields.slot as unknown;
      slot = typeof f === 'string' ? f : (f as { value?: string }).value;
    }

    const result = await this.cms.uploadMedia({
      buffer,
      originalName: data.filename,
      mimeType: data.mimetype,
      slot,
    });
    return { success: true, data: CmsMediaResponseDto.from(result) };
  }
}
