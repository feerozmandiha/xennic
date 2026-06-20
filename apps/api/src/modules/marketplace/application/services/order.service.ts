import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IMarketplaceRepository } from '../../domain/interfaces/marketplace.repository.interface.js';
import { OrderEntity } from '../../domain/entities/order.entity.js';
import type { CreateOrderDto, UpdateOrderStatusDto } from '../../presentation/dtos/order.dto.js';

@Injectable()
export class OrderService {
  constructor(
    @Inject('IMarketplaceRepository')
    private readonly repo: IMarketplaceRepository,
  ) {}

  async findAll(workspaceId: string, status?: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    const result = await this.repo.searchOrders({ workspaceId, status, offset, limit });
    return {
      data: result.data,
      meta: { page, limit, total: result.total, totalPages: Math.ceil(result.total / limit) },
    };
  }

  async findById(id: string, workspaceId: string): Promise<OrderEntity> {
    const entity = await this.repo.findOrderById(id);
    if (!entity || entity.workspaceId !== workspaceId) {
      throw new NotFoundException('Order not found');
    }
    return entity;
  }

  async create(dto: CreateOrderDto, workspaceId: string, userId: string): Promise<OrderEntity> {
    const items = await Promise.all(
      dto.items.map(async (item) => {
        const product = await this.repo.findProductById(item.productId);
        if (!product) throw new NotFoundException(`Product ${item.productId} not found`);
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.unitPrice * item.quantity,
        };
      }),
    );

    const entity = OrderEntity.create({
      workspaceId,
      userId,
      currency: dto.currency,
      items,
    });
    await this.repo.saveOrder(entity);
    return entity;
  }

  async updateStatus(id: string, workspaceId: string, dto: UpdateOrderStatusDto): Promise<OrderEntity> {
    const entity = await this.findById(id, workspaceId);
    entity.updateStatus(dto.status);
    await this.repo.saveOrder(entity);
    return entity;
  }
}
