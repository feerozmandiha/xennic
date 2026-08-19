import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import type { IMarketplaceRepository } from '../../domain/interfaces/marketplace.repository.interface.js';
import type { IPaymentGateway } from '../../../billing/infrastructure/gateways/payment-gateway.interface.js';
import { OrderEntity } from '../../domain/entities/order.entity.js';
import type { CreateOrderDto, UpdateOrderStatusDto } from '../../presentation/dtos/order.dto.js';

@Injectable()
export class OrderService {
  constructor(
    @Inject('IMarketplaceRepository')
    private readonly repo: IMarketplaceRepository,
    @Inject('MARKETPLACE_PAYMENT_GATEWAY')
    private readonly paymentGateway: IPaymentGateway,
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
        if (!product || product.deletedAt || product.status !== 'active') {
          throw new NotFoundException(`Product ${item.productId} not found or unavailable`);
        }
        // قیمت از سمت سرور خوانده می‌شود تا امکان دستکاری قیمت توسط کلاینت وجود نداشته باشد.
        const unitPrice = product.price;
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
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

  async updateStatus(
    id: string,
    workspaceId: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderEntity> {
    const entity = await this.findById(id, workspaceId);
    entity.updateStatus(dto.status);
    await this.repo.saveOrder(entity);
    return entity;
  }

  // ── Payment ───────────────────────────────────────────────

  async requestPayment(
    orderId: string,
    workspaceId: string,
    callbackUrl: string,
  ): Promise<{ redirectUrl: string; authority: string }> {
    const order = await this.findById(orderId, workspaceId);
    if (order.isPaid() || order.status !== 'pending') {
      throw new ConflictException('Order is not payable');
    }

    const result = await this.paymentGateway.requestPayment({
      amount: this._toGatewayAmount(order),
      currency: 'IRR',
      description: `Marketplace order #${order.id}`,
      callbackUrl,
      orderId: order.id,
      metadata: { orderId: order.id },
    });

    if (!result.success) {
      throw new Error(`Payment gateway error: ${result.message}`);
    }

    order.setAuthority(result.authority);
    await this.repo.saveOrder(order);

    return { redirectUrl: result.redirectUrl!, authority: result.authority };
  }

  async verifyPayment(authority: string): Promise<OrderEntity> {
    const order = await this.repo.findOrderByAuthority(authority);
    if (!order) throw new NotFoundException('Order not found for this authority');
    if (order.isPaid()) return order; // idempotent

    const verification = await this.paymentGateway.verifyPayment(
      authority,
      this._toGatewayAmount(order),
    );
    if (!verification.success) {
      throw new Error(`Payment verification failed: ${verification.message}`);
    }

    order.markPaid(verification.referenceId);
    await this.repo.saveOrder(order);
    return order;
  }

  private _toGatewayAmount(order: OrderEntity): number {
    // سفارش‌های بازارگاه به دلار هستند؛ درگاه زرین‌پال مبلغ را به ریال نیاز دارد.
    const rate = Number(process.env.MARKETPLACE_USD_TO_IRR_RATE ?? 500000);
    return Math.round(order.totalAmount * rate);
  }
}
