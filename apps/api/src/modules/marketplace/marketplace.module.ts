import { Module } from '@nestjs/common';
import { VendorsController } from './presentation/controllers/vendors.controller.js';
import { ProductsController } from './presentation/controllers/products.controller.js';
import { OrdersController } from './presentation/controllers/orders.controller.js';
import { PublicMarketplaceController } from './presentation/controllers/public-marketplace.controller.js';
import { MarketplacePaymentCallbackController } from './presentation/controllers/marketplace-payment-callback.controller.js';
import { VendorService } from './application/services/vendor.service.js';
import { ProductService } from './application/services/product.service.js';
import { OrderService } from './application/services/order.service.js';
import { PublicMarketplaceService } from './application/services/public-marketplace.service.js';
import { MarketplaceRepository } from './infrastructure/repositories/marketplace.repository.js';
import { ZarinpalGateway } from '../billing/infrastructure/gateways/zarinpal.gateway.js';

@Module({
  controllers: [
    VendorsController,
    ProductsController,
    OrdersController,
    PublicMarketplaceController,
    MarketplacePaymentCallbackController,
  ],
  providers: [
    VendorService,
    ProductService,
    OrderService,
    PublicMarketplaceService,
    { provide: 'IMarketplaceRepository', useClass: MarketplaceRepository },
    // درگاه پرداخت مشترک (همان زرین‌پال بیلینگ) برای تسویه‌ی سفارش‌های بازارگاه
    { provide: 'MARKETPLACE_PAYMENT_GATEWAY', useClass: ZarinpalGateway },
  ],
  exports: [],
})
export class MarketplaceModule {}
