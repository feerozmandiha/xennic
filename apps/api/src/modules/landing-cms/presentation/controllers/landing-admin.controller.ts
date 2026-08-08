import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  BadRequestException,
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
import { PublishLandingContentDto, UpdateLandingContentDto } from '../dtos/landing-cms.dto.js';
import { LandingCmsService } from '../../application/services/landing-cms.service.js';

const MAX_ASSET_SIZE = 10 * 1024 * 1024;

@ApiTags('admin/landing-cms')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/landing')
export class LandingAdminController {
  constructor(private readonly svc: LandingCmsService) {}

  @Get('content')
  @ApiOperation({ summary: 'پیش‌نویس محتوای صفحه فرود' })
  @ApiQuery({ name: 'locale', required: false })
  async getDraft(@Query('locale') locale?: string) {
    return { success: true, data: await this.svc.getDraft(locale ?? 'fa') };
  }

  @Put('content')
  @ApiOperation({ summary: 'ذخیره پیش‌نویس' })
  async saveDraft(@Body() body: UpdateLandingContentDto, @Req() req: any) {
    const data = await this.svc.saveDraft(
      body.content,
      req.user?.userId,
      body.locale ?? 'fa',
      body.versionNote,
    );
    return { success: true, data };
  }

  @Post('publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'انتشار / بازگرداندن از انتشار' })
  async publish(@Body() body: PublishLandingContentDto, @Req() req: any) {
    return {
      success: true,
      data: await this.svc.setPublished(
        body.published ?? true,
        req.user?.userId,
        'fa',
        body.versionNote,
      ),
    };
  }

  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'بازنشانی به پیش‌فرض' })
  async reset() {
    return { success: true, data: await this.svc.reset('fa') };
  }

  // ── آپلود asset با بهره‌گیری از storage/MinIO موجود ──
  @Post('assets')
  @HttpCode(HttpStatus.CREATED)
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'آپلود تصویر (لوگو، فاوآیکون، پس‌زمینه)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        purpose: { type: 'string', example: 'logo' },
      },
      required: ['file'],
    },
  })
  async uploadAsset(@Req() req: any) {
    if (!req.isMultipart || !req.isMultipart()) {
      throw new BadRequestException('درخواست باید multipart/form-data باشد');
    }

    let buffer: Buffer;
    let originalName: string;
    let mimeType: string;
    let purpose: string | undefined;

    try {
      const data = await req.file({ limits: { fileSize: MAX_ASSET_SIZE, files: 1 } });
      if (!data) throw new BadRequestException('فایلی ارسال نشده (فیلد: file)');
      originalName = data.filename;
      mimeType = data.mimetype;
      purpose = data.fields?.purpose?.value as string | undefined;
      const chunks: Buffer[] = [];
      for await (const chunk of data.file) chunks.push(chunk as Buffer);
      buffer = Buffer.concat(chunks);
      if ((data.file as any).truncated)
        throw new BadRequestException('حداکثر حجم تصویر ۱۰ مگابایت است');
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      throw new BadRequestException(`آپلود ناموفق: ${(err as Error).message}`);
    }

    const asset = await this.svc.uploadAsset({
      buffer,
      originalName,
      mimeType,
      uploadedBy: req.user?.userId,
      purpose,
    });
    return { success: true, data: asset };
  }
}
