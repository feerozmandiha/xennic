import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { AdminService } from '../../application/services/admin.service.js';

/**
 * AdminCheckController — endpoint عمومی (فقط JWT، بدون AdminGuard)
 * برای بررسی اینکه آیا کاربر ادمین است یا نه
 */
@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('admin')
export class AdminCheckController {
  constructor(private readonly svc: AdminService) {}

  @Get('check')
  @ApiOperation({ summary: 'بررسی وضعیت ادمین کاربر جاری' })
  async checkAdmin(@Req() req: any) {
    const result = await this.svc.checkIsAdmin(req.user.userId);
    return { success: true, data: result };
  }
}
