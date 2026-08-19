import { BadRequestException, Body, Controller, Get, Header, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminGuard } from '../../../admin/infrastructure/guards/admin.guard.js';
import { ThemeService } from '../../application/services/theme.service.js';
import type { ThemeTokens } from '../../domain/theme.types.js';

@ApiTags('theme')
@Controller('theme')
export class ThemeController {
  constructor(private readonly theme: ThemeService) {}

  @Get()
  @ApiOperation({ summary: 'دریافت تم فعلی' })
  async get() {
    return { success: true, data: await this.theme.getTheme() };
  }

  @Get('css')
  @Header('content-type', 'text/css; charset=utf-8')
  @ApiOperation({ summary: 'دریافت CSS Variables تم' })
  async css() {
    return this.theme.getCss();
  }

  @Put()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'به‌روزرسانی تم (فقط ادمین)' })
  async update(@Body() body: Partial<ThemeTokens>) {
    try {
      const data = await this.theme.updateTheme(body);
      return { success: true, data };
    } catch (e: any) {
      throw new BadRequestException(e?.message ?? 'خطا در ذخیره تم');
    }
  }

  @Put('reset')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'بازنشانی تم به پیش‌فرض' })
  async reset() {
    return { success: true, data: await this.theme.resetTheme() };
  }
}
