import { Controller, Get, Query, Res, Logger, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { BillingService } from '../../application/services/billing.service.js';

@ApiTags('billing')
@Controller('billing')
export class BillingCallbackController {
  private readonly logger = new Logger(BillingCallbackController.name);

  constructor(private readonly billingService: BillingService) {}

  @Get('callback')
  @ApiOperation({
    summary: 'Zarinpal payment callback',
    description: 'Public endpoint called by Zarinpal after payment. Redirects user to frontend success/failure page.',
  })
  @ApiQuery({ name: 'Authority', required: false, description: 'Zarinpal authority code' })
  @ApiQuery({ name: 'Status', required: false, description: 'Zarinpal payment status (OK/NOK)' })
  @ApiResponse({ status: 302, description: 'Redirect to frontend billing page' })
  async handleCallback(
    @Query('Authority') authority?: string,
    @Query('Status') status?: string,
    @Res() res?: any,
  ) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';

    if (!authority || status !== 'OK') {
      this.logger.warn(`Zarinpal callback with invalid params: Authority=${authority}, Status=${status}`);
      return res!.redirect(HttpStatus.FOUND, `${frontendUrl}/fa/billing/checkout?payment=failed`);
    }

    try {
      const { payment } = await this.billingService.verifyByAuthority(authority);
      this.logger.log(`Payment ${payment.id} verified successfully via callback`);
      return res!.redirect(HttpStatus.FOUND, `${frontendUrl}/fa/billing/checkout?payment=success&ref=${payment.gatewayReference}`);
    } catch (err) {
      this.logger.error(`Callback verification failed for authority ${authority}: ${(err as Error).message}`);
      return res!.redirect(HttpStatus.FOUND, `${frontendUrl}/fa/billing/checkout?payment=failed`);
    }
  }
}
