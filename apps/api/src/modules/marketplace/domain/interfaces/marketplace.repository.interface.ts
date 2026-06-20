import type { VendorEntity } from '../entities/vendor.entity.js';
import type { ProductEntity } from '../entities/product.entity.js';
import type { OrderEntity, OrderItemData } from '../entities/order.entity.js';

export interface VendorSearchParams {
  query?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

export interface ProductSearchParams {
  query?: string;
  vendorId?: string;
  type?: string;
  category?: string;
  status?: string;
  offset?: number;
  limit?: number;
}

export interface OrderSearchParams {
  workspaceId: string;
  status?: string;
  userId?: string;
  offset?: number;
  limit?: number;
}

export interface SearchResult<T> {
  data: T[];
  total: number;
}

export interface IMarketplaceRepository {
  // Vendors
  findVendorById(id: string): Promise<VendorEntity | null>;
  findVendorBySlug(slug: string): Promise<VendorEntity | null>;
  searchVendors(params: VendorSearchParams): Promise<SearchResult<VendorEntity>>;
  saveVendor(entity: VendorEntity): Promise<void>;

  // Products
  findProductById(id: string): Promise<ProductEntity | null>;
  findProductBySku(sku: string): Promise<ProductEntity | null>;
  searchProducts(params: ProductSearchParams): Promise<SearchResult<ProductEntity>>;
  suggestProducts(params: { category: string; specs: Record<string, any>; offset?: number; limit?: number }): Promise<SearchResult<ProductEntity>>;
  saveProduct(entity: ProductEntity): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  // Orders
  findOrderById(id: string): Promise<OrderEntity | null>;
  searchOrders(params: OrderSearchParams): Promise<SearchResult<OrderEntity>>;
  saveOrder(entity: OrderEntity): Promise<void>;
}
