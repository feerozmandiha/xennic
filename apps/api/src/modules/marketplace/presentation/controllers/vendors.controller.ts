import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VendorService } from '../../application/services/vendor.service.js';
import { CreateVendorDto, UpdateVendorDto } from '../dtos/vendor.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';

@ApiTags('Vendors')
@Controller('vendors')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class VendorsController {
  constructor(private readonly vendorService: VendorService) {}

  @Get()
  @ApiOperation({ summary: 'List all vendors' })
  async findAll(@Query('q') q?: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    return this.vendorService.findAll(q, page ? parseInt(page, 10) : 1, limit ? parseInt(limit, 10) : 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vendor by ID' })
  async findById(@Param('id') id: string) {
    return this.vendorService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a vendor' })
  async create(@Body() dto: CreateVendorDto) {
    return this.vendorService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a vendor' })
  async update(@Param('id') id: string, @Body() dto: UpdateVendorDto) {
    return this.vendorService.update(id, dto);
  }
}
