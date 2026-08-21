import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ProductService } from '../../application/services/product.service.js';
import {
  CreateProductDto,
  CreateProductImageDto,
  ReorderProductImagesDto,
  UpdateProductDto,
  UpdateProductImageDto,
  UpsertProductTranslationDto,
} from '../dtos/product.dto.js';
import {
  DEFAULT_PRODUCT_LOCALE,
  SUPPORTED_PRODUCT_LOCALES,
} from '../../domain/value-objects/product-translation.vo.js';
import { toProductResponse, toProductResponseList } from '../mappers/marketplace.mapper.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';

@ApiTags('Products')
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ProductsController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ApiOperation({ summary: 'Search products' })
  @ApiQuery({ name: 'locale', required: false, enum: SUPPORTED_PRODUCT_LOCALES })
  async findAll(
    @Query('q') q?: string,
    @Query('vendorId') vendorId?: string,
    @Query('type') type?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ) {
    const result = await this.productService.findAll(
      q,
      vendorId,
      type,
      category,
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );

    return {
      data: toProductResponseList(result.data, locale ?? DEFAULT_PRODUCT_LOCALE),
      meta: result.meta,
    };
  }

  @Get('suggest')
  @ApiOperation({ summary: 'Suggest products matching a calculation result' })
  async suggest(
    @Query('calculationType') calculationType: string,
    @Query('resultParams') resultParams?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
  ) {
    const params = resultParams ? JSON.parse(decodeURIComponent(resultParams)) : {};
    const result = await this.productService.suggest(
      calculationType,
      params,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );

    return {
      data: toProductResponseList(result.data, locale ?? DEFAULT_PRODUCT_LOCALE),
      meta: result.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get product by ID' })
  @ApiQuery({ name: 'locale', required: false, enum: SUPPORTED_PRODUCT_LOCALES })
  async findById(@Param('id') id: string, @Query('locale') locale?: string) {
    const entity = await this.productService.findById(id);
    return toProductResponse(entity, locale ?? DEFAULT_PRODUCT_LOCALE);
  }

  @Post()
  @ApiOperation({ summary: 'Create a product (optionally with fa/en translations)' })
  async create(@Body() dto: CreateProductDto) {
    const entity = await this.productService.create(dto);
    return toProductResponse(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product (sending `translations` replaces the whole set)' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    const entity = await this.productService.update(id, dto);
    return toProductResponse(entity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete a product' })
  async remove(@Param('id') id: string) {
    await this.productService.remove(id);
    return { success: true };
  }

  // ── Translations (fa / en) ─────────────────────────────────────────────

  @Get(':id/translations')
  @ApiOperation({ summary: 'List every translation of a product' })
  async listTranslations(@Param('id') id: string) {
    const translations = await this.productService.listTranslations(id);
    return translations.map((t) => t.toJSON());
  }

  @Get(':id/translations/:locale')
  @ApiOperation({ summary: 'Get a single product translation (exact locale match)' })
  @ApiParam({ name: 'locale', enum: SUPPORTED_PRODUCT_LOCALES })
  async getTranslation(@Param('id') id: string, @Param('locale') locale: string) {
    const translation = await this.productService.getTranslation(id, locale);
    return translation.toJSON();
  }

  @Put(':id/translations/:locale')
  @ApiOperation({ summary: 'Create or replace a product translation' })
  @ApiParam({ name: 'locale', enum: SUPPORTED_PRODUCT_LOCALES })
  async upsertTranslation(
    @Param('id') id: string,
    @Param('locale') locale: string,
    @Body() dto: UpsertProductTranslationDto,
  ) {
    const translation = await this.productService.upsertTranslation(id, locale, dto);
    return translation.toJSON();
  }

  @Delete(':id/translations/:locale')
  @ApiOperation({ summary: 'Delete a product translation' })
  @ApiParam({ name: 'locale', enum: SUPPORTED_PRODUCT_LOCALES })
  async removeTranslation(@Param('id') id: string, @Param('locale') locale: string) {
    await this.productService.removeTranslation(id, locale);
    return { success: true };
  }

  // ── Images / album ─────────────────────────────────────────────────────

  @Get(':id/images')
  @ApiOperation({ summary: 'List the product image album (ordered, primary first)' })
  async listImages(@Param('id') id: string) {
    const images = await this.productService.listImages(id);
    return images.map((image) => image.toJSON());
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add an image to the product album' })
  async addImage(@Param('id') id: string, @Body() dto: CreateProductImageDto) {
    const image = await this.productService.addImage(id, dto);
    return image.toJSON();
  }

  @Put(':id/images/order')
  @ApiOperation({ summary: 'Reorder the album — the first id becomes the primary image' })
  async reorderImages(@Param('id') id: string, @Body() dto: ReorderProductImagesDto) {
    const images = await this.productService.reorderImages(id, dto.imageIds);
    return images.map((image) => image.toJSON());
  }

  @Put(':id/images/:imageId/primary')
  @ApiOperation({ summary: 'Mark an image as the product primary image' })
  async setPrimaryImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    const image = await this.productService.setPrimaryImage(id, imageId);
    return image.toJSON();
  }

  @Patch(':id/images/:imageId')
  @ApiOperation({ summary: 'Update an album image (alt text, order, primary flag)' })
  async updateImage(
    @Param('id') id: string,
    @Param('imageId') imageId: string,
    @Body() dto: UpdateProductImageDto,
  ) {
    const image = await this.productService.updateImage(id, imageId, dto);
    return image.toJSON();
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Remove an image from the album' })
  async removeImage(@Param('id') id: string, @Param('imageId') imageId: string) {
    await this.productService.removeImage(id, imageId);
    return { success: true };
  }
}
