import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PublicMarketplaceService } from '../../application/services/public-marketplace.service.js';

@ApiTags('public-marketplace')
@Controller('public/marketplace')
export class PublicMarketplaceController {
  constructor(private readonly publicMarketplaceService: PublicMarketplaceService) {}

  @Get('products')
  @ApiOperation({ summary: 'Public list of active products' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'vendorId', required: false })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  @ApiQuery({ name: 'locale', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchProducts(
    @Query('q') q?: string,
    @Query('category') category?: string,
    @Query('vendorId') vendorId?: string,
    @Query('type') type?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('locale') locale?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.publicMarketplaceService.searchProducts(
      {
        query: q,
        category,
        vendorId,
        type,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        locale,
      },
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 24,
    );
  }

  @Get('products/:id')
  @ApiOperation({ summary: 'Public product detail' })
  async getProduct(@Param('id') id: string, @Query('locale') locale?: string) {
    return this.publicMarketplaceService.getProduct(id, locale ?? 'fa');
  }

  @Get('vendors')
  @ApiOperation({ summary: 'Public list of active vendors' })
  @ApiQuery({ name: 'q', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async searchVendors(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.publicMarketplaceService.searchVendors(
      { query: q },
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 24,
    );
  }

  @Get('vendors/:id')
  @ApiOperation({ summary: 'Public vendor detail' })
  async getVendor(@Param('id') id: string) {
    return this.publicMarketplaceService.getVendor(id);
  }

  @Get('categories')
  @ApiOperation({ summary: 'Public list of product categories with counts' })
  async listCategories() {
    return this.publicMarketplaceService.listCategories();
  }
}
