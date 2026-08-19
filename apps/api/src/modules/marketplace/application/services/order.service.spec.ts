import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { ProductEntity } from '../../domain/entities/product.entity.js';

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

describe('OrderService', () => {
  let service: OrderService;

  const repo = {
    findProductById: jest.fn(),
    saveOrder: jest.fn(),
    findOrderById: jest.fn(),
    searchOrders: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [OrderService, { provide: 'IMarketplaceRepository', useValue: repo }],
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
});
