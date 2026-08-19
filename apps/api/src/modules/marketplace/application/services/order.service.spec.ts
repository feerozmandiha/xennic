import { Test } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { ProductEntity } from '../../domain/entities/product.entity.js';
import { OrderEntity } from '../../domain/entities/order.entity.js';

const WS_ID = 'ws-123';
const USER_ID = 'user-456';

function makeProduct(overrides: Record<string, any> = {}): ProductEntity {
  return ProductEntity.reconstitute({
    id: 'prod-1',
    vendorId: 'vendor-1',
    type: 'physical',
    category: 'cable',
    specifications: null,
    sku: 'SKU-1',
    price: 250,
    currency: 'USD',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    ...overrides,
  });
}

function makeOrder(overrides: Record<string, any> = {}): OrderEntity {
  return OrderEntity.reconstitute({
    id: 'order-1',
    workspaceId: WS_ID,
    userId: USER_ID,
    status: 'pending',
    currency: 'USD',
    totalAmount: 250,
    items: [{ productId: 'prod-1', quantity: 1, unitPrice: 250, totalPrice: 250 }],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

describe('OrderService', () => {
  let service: OrderService;

  const repo = {
    findProductById: jest.fn(),
    saveOrder: jest.fn(),
    findOrderById: jest.fn(),
    findOrderByAuthority: jest.fn(),
    searchOrders: jest.fn(),
  };

  const gateway = {
    name: 'zarinpal',
    requestPayment: jest.fn(),
    verifyPayment: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: 'IMarketplaceRepository', useValue: repo },
        { provide: 'MARKETPLACE_PAYMENT_GATEWAY', useValue: gateway },
      ],
    }).compile();

    service = module.get(OrderService);
    jest.clearAllMocks();
  });

  it('uses server-side product price and ignores client unitPrice', async () => {
    repo.findProductById.mockResolvedValue(makeProduct());

    const order = await service.create(
      { currency: 'USD', items: [{ productId: 'prod-1', quantity: 3, unitPrice: 1 }] },
      WS_ID,
      USER_ID,
    );

    expect(repo.saveOrder).toHaveBeenCalledTimes(1);
    expect(order.items[0]).toEqual({
      productId: 'prod-1',
      quantity: 3,
      unitPrice: 250,
      totalPrice: 750,
    });
    expect(order.totalAmount).toBe(750);
  });

  it('rejects a missing product', async () => {
    repo.findProductById.mockResolvedValue(null);

    await expect(
      service.create({ items: [{ productId: 'missing', quantity: 1 }] }, WS_ID, USER_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects an inactive product', async () => {
    repo.findProductById.mockResolvedValue(makeProduct({ status: 'inactive' }));

    await expect(
      service.create({ items: [{ productId: 'prod-1', quantity: 1 }] }, WS_ID, USER_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects a soft-deleted product', async () => {
    repo.findProductById.mockResolvedValue(makeProduct({ deletedAt: new Date() }));

    await expect(
      service.create({ items: [{ productId: 'prod-1', quantity: 1 }] }, WS_ID, USER_ID),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sums totals across multiple items', async () => {
    repo.findProductById.mockImplementation((id: string) => {
      if (id === 'prod-1') return Promise.resolve(makeProduct({ price: 100 }));
      return Promise.resolve(makeProduct({ id: 'prod-2', price: 50 }));
    });

    const order = await service.create(
      {
        items: [
          { productId: 'prod-1', quantity: 2 },
          { productId: 'prod-2', quantity: 1 },
        ],
      },
      WS_ID,
      USER_ID,
    );

    expect(order.totalAmount).toBe(250);
  });

  // ── Payment ──────────────────────────────────────────

  it('requestPayment stores authority and returns the redirect URL', async () => {
    repo.findOrderById.mockResolvedValue(makeOrder());
    gateway.requestPayment.mockResolvedValue({
      success: true,
      authority: 'auth-1',
      redirectUrl: 'https://gw/StartPay/auth-1',
    });

    const res = await service.requestPayment('order-1', WS_ID, 'https://cb');

    expect(gateway.requestPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: 'order-1',
        currency: 'IRR',
        callbackUrl: 'https://cb',
      }),
    );
    expect(repo.saveOrder).toHaveBeenCalled();
    expect(res).toEqual({ redirectUrl: 'https://gw/StartPay/auth-1', authority: 'auth-1' });
  });

  it('requestPayment throws when the gateway fails', async () => {
    repo.findOrderById.mockResolvedValue(makeOrder());
    gateway.requestPayment.mockResolvedValue({ success: false, authority: '', message: 'boom' });

    await expect(service.requestPayment('order-1', WS_ID, 'https://cb')).rejects.toThrow(
      /Payment gateway error/,
    );
  });

  it('requestPayment rejects an already paid order', async () => {
    repo.findOrderById.mockResolvedValue(makeOrder({ paidAt: new Date(), status: 'paid' }));

    await expect(service.requestPayment('order-1', WS_ID, 'https://cb')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('verifyPayment marks the order as paid with the gateway reference', async () => {
    const order = makeOrder({ authority: 'auth-1' });
    repo.findOrderByAuthority.mockResolvedValue(order);
    gateway.verifyPayment.mockResolvedValue({
      success: true,
      referenceId: 'REF-1',
      message: 'ok',
    });

    const verified = await service.verifyPayment('auth-1');

    expect(verified.status).toBe('paid');
    expect(verified.gatewayReference).toBe('REF-1');
    expect(verified.paidAt).not.toBeNull();
    expect(repo.saveOrder).toHaveBeenCalled();
  });

  it('verifyPayment is idempotent for a paid order', async () => {
    repo.findOrderByAuthority.mockResolvedValue(
      makeOrder({ authority: 'auth-1', status: 'paid', paidAt: new Date() }),
    );

    const verified = await service.verifyPayment('auth-1');

    expect(gateway.verifyPayment).not.toHaveBeenCalled();
    expect(verified.status).toBe('paid');
  });

  it('verifyPayment throws when the gateway verification fails', async () => {
    repo.findOrderByAuthority.mockResolvedValue(makeOrder({ authority: 'auth-1' }));
    gateway.verifyPayment.mockResolvedValue({ success: false, referenceId: '', message: 'nok' });

    await expect(service.verifyPayment('auth-1')).rejects.toThrow(/verification failed/);
  });
});
