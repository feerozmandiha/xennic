import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PublicMarketplaceService } from './public-marketplace.service.js';

describe('PublicMarketplaceService', () => {
  let service: PublicMarketplaceService;

  const repo = {
    searchPublicProducts: jest.fn(),
    findPublicProductById: jest.fn(),
    suggestPublicProducts: jest.fn(),
    searchPublicVendors: jest.fn(),
    findPublicVendorById: jest.fn(),
    listCategories: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [PublicMarketplaceService, { provide: 'IMarketplaceRepository', useValue: repo }],
    }).compile();

    service = module.get(PublicMarketplaceService);
    jest.clearAllMocks();
  });

  it('searchProducts computes offset and pagination meta', async () => {
    repo.searchPublicProducts.mockResolvedValue({ data: [{ id: 'p1' }], total: 25 });

    const res = await service.searchProducts({ query: 'cable', locale: 'fa' }, 2, 10);

    expect(repo.searchPublicProducts).toHaveBeenCalledWith(
      expect.objectContaining({ query: 'cable', locale: 'fa', offset: 10, limit: 10 }),
    );
    expect(res).toEqual({
      data: [{ id: 'p1' }],
      meta: { page: 2, limit: 10, total: 25, totalPages: 3 },
    });
  });

  it('getProduct returns the record when found', async () => {
    repo.findPublicProductById.mockResolvedValue({ id: 'p1', title: 'کابل' });

    await expect(service.getProduct('p1', 'fa')).resolves.toEqual({ id: 'p1', title: 'کابل' });
    expect(repo.findPublicProductById).toHaveBeenCalledWith('p1', 'fa');
  });

  it('getProduct throws NotFoundException when missing', async () => {
    repo.findPublicProductById.mockResolvedValue(null);

    await expect(service.getProduct('missing', 'fa')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('searchVendors computes pagination meta', async () => {
    repo.searchPublicVendors.mockResolvedValue({ data: [{ id: 'v1' }], total: 1 });

    const res = await service.searchVendors({ query: 'siemens' }, 1, 24);

    expect(res.meta).toEqual({ page: 1, limit: 24, total: 1, totalPages: 1 });
  });

  it('getVendor throws NotFoundException when missing', async () => {
    repo.findPublicVendorById.mockResolvedValue(null);

    await expect(service.getVendor('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('listCategories delegates to the repository', async () => {
    repo.listCategories.mockResolvedValue([{ category: 'cable', count: 3 }]);

    await expect(service.listCategories()).resolves.toEqual([{ category: 'cable', count: 3 }]);
  });

  it('suggest maps a known calc type to category and returns ranked products', async () => {
    repo.suggestPublicProducts.mockResolvedValue({ data: [{ id: 'p1' }, { id: 'p2' }], total: 2 });

    const res = await service.suggest('CABLE-001', { recommended_cable_size: 35 }, 'fa', 6);

    expect(repo.suggestPublicProducts).toHaveBeenCalledWith({
      category: 'cable',
      specs: { recommended_cable_size: 35 },
      locale: 'fa',
      limit: 6,
    });
    expect(res.category).toBe('cable');
    expect(res.data).toEqual([{ id: 'p1' }, { id: 'p2' }]);
    expect(res.meta).toEqual({ page: 1, limit: 6, total: 2, totalPages: 1 });
  });

  it('suggest returns empty result for unknown calc type without hitting the repository', async () => {
    const res = await service.suggest('UNKNOWN-999', {}, 'fa', 6);

    expect(repo.suggestPublicProducts).not.toHaveBeenCalled();
    expect(res).toEqual({
      data: [],
      category: null,
      meta: { page: 1, limit: 6, total: 0, totalPages: 0 },
    });
  });
});
