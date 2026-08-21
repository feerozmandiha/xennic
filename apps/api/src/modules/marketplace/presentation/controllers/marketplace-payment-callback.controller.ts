import { Controller, Get, Query, Res, Logger, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OrderService } from '../../application/services/order.service.js';

@ApiTags('marketplace')
@Controller('marketplace')
export class MarketplacePaymentCallbackController {
  private readonly logger = new Logger(MarketplacePaymentCallbackController.name);

  constructor(private readonly orderService: OrderService) {}

  @Get('payment/callback')
  @ApiOperation({
    summary: 'Zarinpal payment callback for marketplace orders',
    description:
      'Public endpoint called by the gateway after payment. Redirects to the storefront.',
  })
  @ApiQuery({ name: 'Authority', required: false })
  @ApiQuery({ name: 'Status', required: false })
  async handleCallback(
    @Query('Authority') authority?: string,
    @Query('Status') status?: string,
    @Res() res?: any,
  ) {
    const frontendUrl = process.env.FRONTEND_URL ?? 'http://localhost:3001';

    if (!authority || status !== 'OK') {
      this.logger.warn(
        `Marketplace payment callback with invalid params: Authority=${authority}, Status=${status}`,
      );
      return res!.redirect(
        HttpStatus.FOUND,
        `${frontendUrl}/fa/marketplace/checkout?payment=failed`,
      );
    }

    try {
      const order = await this.orderService.verifyPayment(authority);
      this.logger.log(`Order ${order.id} paid successfully via callback`);
      return res!.redirect(
        HttpStatus.FOUND,
        `${frontendUrl}/fa/marketplace/checkout?payment=success&order=${order.id}`,
      );
    } catch (err) {
      this.logger.error(
        `Marketplace payment verification failed for authority ${authority}: ${(err as Error).message}`,
      );
      return res!.redirect(
        HttpStatus.FOUND,
        `${frontendUrl}/fa/marketplace/checkout?payment=failed`,
      );
    }
  }
}
