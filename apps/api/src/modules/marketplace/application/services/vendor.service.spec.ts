import { Test } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { VendorService } from './vendor.service.js';
import { VendorEntity } from '../../domain/entities/vendor.entity.js';

function makeVendor(overrides: Record<string, any> = {}): VendorEntity {
  return VendorEntity.reconstitute({
    id: 'vendor-1',
    name: 'Siemens',
    slug: 'siemens',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });
}

describe('VendorService', () => {
  let service: VendorService;

  const repo = {
    findVendorById: jest.fn(),
    findVendorBySlug: jest.fn(),
    searchVendors: jest.fn(),
    saveVendor: jest.fn(),
    countVendorProducts: jest.fn(),
    deleteVendor: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [VendorService, { provide: 'IMarketplaceRepository', useValue: repo }],
    }).compile();

    service = module.get(VendorService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('derives the slug from the name and persists the vendor', async () => {
      repo.findVendorBySlug.mockResolvedValue(null);

      const vendor = await service.create({ name: 'ABB Power Systems' });

      expect(vendor.slug).toBe('abb-power-systems');
      expect(repo.findVendorBySlug).toHaveBeenCalledWith('abb-power-systems');
      expect(repo.saveVendor).toHaveBeenCalledWith(vendor);
    });

    it('checks uniqueness against the same slug it will store', async () => {
      repo.findVendorBySlug.mockResolvedValue(null);

      const vendor = await service.create({ name: 'Schneider   Electric!' });

      expect(repo.findVendorBySlug).toHaveBeenCalledWith(vendor.slug);
      expect(vendor.slug).toBe('schneider-electric');
    });

    it('honours an explicitly provided slug', async () => {
      repo.findVendorBySlug.mockResolvedValue(null);

      const vendor = await service.create({ name: 'ABB', slug: 'ABB Group' });

      expect(vendor.slug).toBe('abb-group');
    });

    it('rejects a duplicate slug', async () => {
      repo.findVendorBySlug.mockResolvedValue(makeVendor());

      await expect(service.create({ name: 'Siemens' })).rejects.toThrow(ConflictException);
      expect(repo.saveVendor).not.toHaveBeenCalled();
    });

    it('rejects a name that produces an empty slug', async () => {
      await expect(service.create({ name: 'زیمنس' })).rejects.toThrow(ConflictException);
      expect(repo.saveVendor).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('updates name and status', async () => {
      repo.findVendorById.mockResolvedValue(makeVendor());

      const vendor = await service.update('vendor-1', { name: 'Siemens AG', status: 'suspended' });

      expect(vendor.name).toBe('Siemens AG');
      expect(vendor.status).toBe('suspended');
      expect(repo.saveVendor).toHaveBeenCalledWith(vendor);
    });

    it('throws for an unknown vendor', async () => {
      repo.findVendorById.mockResolvedValue(null);

      await expect(service.update('ghost', { name: 'x' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deletes a vendor that owns no products', async () => {
      repo.findVendorById.mockResolvedValue(makeVendor());
      repo.countVendorProducts.mockResolvedValue(0);

      await service.remove('vendor-1');

      expect(repo.countVendorProducts).toHaveBeenCalledWith('vendor-1', true);
      expect(repo.deleteVendor).toHaveBeenCalledWith('vendor-1');
    });

    it('refuses to delete a vendor that still owns products', async () => {
      repo.findVendorById.mockResolvedValue(makeVendor());
      repo.countVendorProducts.mockResolvedValue(3);

      await expect(service.remove('vendor-1')).rejects.toThrow(ConflictException);
      expect(repo.deleteVendor).not.toHaveBeenCalled();
    });

    it('throws for an unknown vendor', async () => {
      repo.findVendorById.mockResolvedValue(null);

      await expect(service.remove('ghost')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('maps pagination to repository offsets', async () => {
      repo.searchVendors.mockResolvedValue({ data: [], total: 5 });

      const result = await service.findAll('sie', 2, 2);

      expect(repo.searchVendors).toHaveBeenCalledWith({ query: 'sie', offset: 2, limit: 2 });
      expect(result.meta).toEqual({ page: 2, limit: 2, total: 5, totalPages: 3 });
    });
  });
});

describe('VendorEntity.slugify', () => {
  it.each([
    ['Siemens', 'siemens'],
    ['  ABB  Group ', 'abb-group'],
    ['Schneider Electric!', 'schneider-electric'],
    ['A -- B', 'a-b'],
    ['---', ''],
  ])('slugifies %p → %p', (input, expected) => {
    expect(VendorEntity.slugify(input)).toBe(expected);
  });
});
