import { Module } from '@nestjs/common';
import { VendorsController } from './presentation/controllers/vendors.controller.js';
import { ProductsController } from './presentation/controllers/products.controller.js';
import { OrdersController } from './presentation/controllers/orders.controller.js';
import { VendorService } from './application/services/vendor.service.js';
import { ProductService } from './application/services/product.service.js';
import { OrderService } from './application/services/order.service.js';
import { MarketplaceRepository } from './infrastructure/repositories/marketplace.repository.js';

@Module({
  controllers: [VendorsController, ProductsController, OrdersController],
  providers: [
    VendorService,
    ProductService,
    OrderService,
    { provide: 'IMarketplaceRepository', useClass: MarketplaceRepository },
  ],
  exports: [],
})
export class MarketplaceModule {}
