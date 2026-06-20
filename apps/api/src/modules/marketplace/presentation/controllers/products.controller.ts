import { Controller, Get, Post, Patch, Delete, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductService } from '../../application/services/product.service.js';
import { CreateProductDto, UpdateProductDto } from '../dtos/product.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Search products' })
  async findAll(
    @Query('q') q?: string,
    @Query('vendorId') vendorId?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.productService.findAll(
      q, vendorId, type, category, status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Suggest products matching a calculation result' })
  async suggest(
    @Query('calculationType') calculationType: string,
    @Query('resultParams') resultParams?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const params = resultParams ? JSON.parse(decodeURIComponent(resultParams)) : {};
    return this.productService.suggest(
      calculationType, params,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  async findById(@Param('id') id: string) {
    return this.productService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product' })
  async create(@Body() dto: CreateProductDto) {
    return this.productService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.productService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a product' })
  async remove(@Param('id') id: string) {
    await this.productService.remove(id);
    return { success: true };
  }
}
