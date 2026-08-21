import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { StorageService } from '../../application/services/storage.service.js';

/**
 * تحویل عمومی تصویر — بدون احراز هویت.
 *
 * تنها فایل‌هایی سرو می‌شوند که در باکت `public` ذخیره شده‌اند و mime آن‌ها
 * `image/*` است. این مسیر برای نمایش تصویر محصولات در فروشگاه عمومی لازم است:
 * تگ `<img>` نه توکن می‌فرستد و نه می‌تواند به URL امضاشدهٔ یک‌ساعتهٔ MinIO
 * تکیه کند. اسناد و فایل‌های غیرتصویری از این مسیر قابل دریافت نیستند.
 */
@ApiTags('storage')
@Controller('storage/public')
export class StoragePublicController {
  constructor(private readonly storageService: StorageService) {}

  @Get('images/:id')
  @ApiOperation({ summary: 'Serve a public image inline (no authentication)' })
  @ApiParam({ name: 'id', description: 'File UUID' })
  @ApiResponse({ status: 200, description: 'Image bytes' })
  @ApiResponse({ status: 404, description: 'Not a public image' })
  async image(@Param('id') id: string, @Res() res: any) {
    const { buffer, file } = await this.storageService.downloadPublicImage(id);

    res
      .header('Content-Type', file.mimeType)
      .header('Content-Length', buffer.length.toString())
      .header('Content-Disposition', 'inline')
      .header('Cache-Control', 'public, max-age=86400, immutable')
      .send(buffer);
  }
}
