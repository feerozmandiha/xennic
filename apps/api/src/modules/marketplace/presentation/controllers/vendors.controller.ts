import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VendorService } from '../../application/services/vendor.service.js';
import { CreateVendorDto, UpdateVendorDto } from '../dtos/vendor.dto.js';
import { toVendorResponse, toVendorResponseList } from '../mappers/marketplace.mapper.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';

@ApiTags('Vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class VendorsController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @ApiOperation({ summary: 'List all vendors' })
  async findAll(
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.vendorService.findAll(
      q,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );

    return { data: toVendorResponseList(result.data), meta: result.meta };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  async findById(@Param('id') id: string) {
    const entity = await this.vendorService.findById(id);
    return toVendorResponse(entity);
  }

  @Post()
  @ApiOperation({ summary: 'Create a vendor' })
  async create(@Body() dto: CreateVendorDto) {
    const entity = await this.vendorService.create(dto);
    return toVendorResponse(entity);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  async update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    const entity = await this.vendorService.update(id, dto);
    return toVendorResponse(entity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a vendor (rejected while it still owns products)' })
  async remove(@Param('id') id: string) {
    await this.vendorService.remove(id);
    return { success: true };
  }
}
