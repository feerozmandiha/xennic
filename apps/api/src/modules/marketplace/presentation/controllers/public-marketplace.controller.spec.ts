import { Test } from '@nestjs/testing';
import { PublicMarketplaceController } from './public-marketplace.controller.js';
import { PublicMarketplaceService } from '../../application/services/public-marketplace.service.js';

describe('PublicMarketplaceController', () => {
  let controller: PublicMarketplaceController;

  const service = {
    searchProducts: jest.fn(),
    getProduct: jest.fn(),
    searchVendors: jest.fn(),
    getVendor: jest.fn(),
    listCategories: jest.fn(),
    suggest: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [PublicMarketplaceController],
      providers: [{ provide: PublicMarketplaceService, useValue: service }],
    }).compile();

    controller = module.get(PublicMarketplaceController);
    jest.clearAllMocks();
  });

  it('searchProducts parses pagination and price filters', async () => {
    service.searchProducts.mockResolvedValue({ data: [], meta: {} });

    await controller.searchProducts(
      'cable',
      'cable',
      undefined,
      undefined,
      '100',
      '500',
      'fa',
      '2',
      '12',
    );

    expect(service.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        query: 'cable',
        category: 'cable',
        minPrice: 100,
        maxPrice: 500,
        locale: 'fa',
      }),
      2,
      12,
    );
  });

  it('searchProducts defaults pagination when not provided', async () => {
    service.searchProducts.mockResolvedValue({ data: [], meta: {} });

    await controller.searchProducts();

    expect(service.searchProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        minPrice: undefined,
        maxPrice: undefined,
      }),
      1,
      24,
    );
  });

  it('getProduct defaults locale to fa', async () => {
    service.getProduct.mockResolvedValue({ id: 'p1' });

    await controller.getProduct('p1');

    expect(service.getProduct).toHaveBeenCalledWith('p1', 'fa');
  });

  it('getProduct forwards locale', async () => {
    service.getProduct.mockResolvedValue({ id: 'p1' });

    await controller.getProduct('p1', 'en');

    expect(service.getProduct).toHaveBeenCalledWith('p1', 'en');
  });

  it('searchVendors parses pagination', async () => {
    service.searchVendors.mockResolvedValue({ data: [], meta: {} });

    await controller.searchVendors('siemens', '2', '10');

    expect(service.searchVendors).toHaveBeenCalledWith({ query: 'siemens' }, 2, 10);
  });

  it('listCategories delegates', async () => {
    service.listCategories.mockResolvedValue([{ category: 'cable', count: 1 }]);

    await expect(controller.listCategories()).resolves.toEqual([{ category: 'cable', count: 1 }]);
  });

  it('suggest parses resultParams JSON and forwards defaults', async () => {
    service.suggest.mockResolvedValue({ data: [], category: 'cable', meta: {} });

    await controller.suggest('CABLE-001', encodeURIComponent(JSON.stringify({ size: 35 })));

    expect(service.suggest).toHaveBeenCalledWith('CABLE-001', { size: 35 }, 'fa', 10);
  });

  it('suggest tolerates an invalid resultParams payload', async () => {
    service.suggest.mockResolvedValue({ data: [], category: null, meta: {} });

    await controller.suggest('CABLE-001', 'not-json%zz');

    expect(service.suggest).toHaveBeenCalledWith('CABLE-001', {}, 'fa', 10);
  });
});
