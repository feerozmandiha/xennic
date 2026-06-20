import { Controller, Get, Post, Patch, Param, Body, Query, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrderService } from '../../application/services/order.service.js';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dtos/order.dto.js';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard.js';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class OrdersController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @ApiOperation({ summary: 'List orders (workspace-scoped)' })
  async findAll(
    @Req() req: any,
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.orderService.findAll(
      req.user.workspaceId,
      status,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  async findById(@Param('id') id: string, @Req() req: any) {
    return this.orderService.findById(id, req.user.workspaceId);
  }

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  async create(@Body() dto: CreateOrderDto, @Req() req: any) {
    return this.orderService.create(dto, req.user.workspaceId, req.user.userId);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Req() req: any) {
    return this.orderService.updateStatus(id, req.user.workspaceId, dto);
  }
}
