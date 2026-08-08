import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LandingCmsService } from '../../application/services/landing-cms.service.js';

@ApiTags('landing')
@Controller('landing')
export class LandingPublicController {
  constructor(private readonly svc: LandingCmsService) {}

  @Get('content')
  @ApiOperation({ summary: 'محتوای منتشرشده صفحه فرود (عمومی)' })
  @ApiQuery({ name: 'locale', required: false, example: 'fa' })
  async getContent(@Query('locale') locale?: string) {
    return { success: true, data: await this.svc.getPublished(locale ?? 'fa') };
  }
}
