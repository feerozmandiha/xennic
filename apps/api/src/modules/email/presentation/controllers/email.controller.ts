import { Controller, Post, Body, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';
import { SuperAdminOnly } from '../../../../common/decorators/super-admin-only.decorator.js';
import { EmailService } from '../../application/services/email.service.js';
import { SendTestEmailDto } from '../dtos/email.dto.js';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('test')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @SuperAdminOnly()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Send a test email (admin only)' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  async sendTest(@Body() dto: SendTestEmailDto) {
    await this.emailService.sendRaw(
      dto.to,
      'Test Email from Xennic',
      '<h1>Test</h1><p>If you receive this, email is working.</p>',
    );
    return { success: true, message: 'Test email sent' };
  }
}
