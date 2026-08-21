import type { VendorEntity } from '../entities/vendor.entity.js';
import type { ProductEntity } from '../entities/product.entity.js';
import type { OrderEntity } from '../entities/order.entity.js';
import type { ProductTranslation } from '../value-objects/product-translation.vo.js';
import type { ProductImage, ProductImageJson } from '../value-objects/product-image.vo.js';

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

// ── Public storefront (anonymous, read-only) ────────────────────────────

export interface PublicProductSearchParams {
  query?: string;
  vendorId?: string;
  type?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  locale?: string;
  offset?: number;
  limit?: number;
}

export interface PublicProductRecord {
  id: string;
  sku: string;
  type: string;
  category: string | null;
  specifications: Record<string, any> | null;
  price: number;
  currency: string;
  status: string;
  vendorId: string;
  vendorName: string;
  vendorSlug: string;
  title: string;
  description: string | null;
  locale: string;
  /** آلبوم تصاویر — مرتب، با تصویر شاخص در ابتدا. */
  images: ProductImageJson[];
  primaryImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PublicVendorSearchParams {
  query?: string;
  offset?: number;
  limit?: number;
}

export interface PublicVendorRecord {
  id: string;
  name: string;
  slug: string;
  status: string;
  productCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface IMarketplaceRepository {
  // Vendors
  findVendorById(id: string): Promise<VendorEntity | null>;
  findVendorBySlug(slug: string): Promise<VendorEntity | null>;
  searchVendors(params: VendorSearchParams): Promise<SearchResult<VendorEntity>>;
  saveVendor(entity: VendorEntity): Promise<void>;
  countVendorProducts(vendorId: string, includeDeleted?: boolean): Promise<number>;
  deleteVendor(id: string): Promise<void>;

  // Products
  findProductById(id: string): Promise<ProductEntity | null>;
  findProductBySku(sku: string): Promise<ProductEntity | null>;
  searchProducts(params: ProductSearchParams): Promise<SearchResult<ProductEntity>>;
  suggestProducts(params: {
    category: string;
    specs: Record<string, any>;
    offset?: number;
    limit?: number;
  }): Promise<SearchResult<ProductEntity>>;
  saveProduct(entity: ProductEntity): Promise<void>;
  deleteProduct(id: string): Promise<void>;

  // Product translations (fa / en)
  findProductTranslations(productId: string): Promise<ProductTranslation[]>;
  upsertProductTranslation(productId: string, translation: ProductTranslation): Promise<void>;
  deleteProductTranslation(productId: string, locale: string): Promise<boolean>;

  // Product images (album)
  findProductImages(productId: string): Promise<ProductImage[]>;
  saveProductImages(productId: string, images: ProductImage[]): Promise<void>;
  deleteProductImage(productId: string, imageId: string): Promise<boolean>;

  // Orders
  findOrderById(id: string): Promise<OrderEntity | null>;
  findOrderByAuthority(authority: string): Promise<OrderEntity | null>;
  searchOrders(params: OrderSearchParams): Promise<SearchResult<OrderEntity>>;
  saveOrder(entity: OrderEntity): Promise<void>;

  // Public storefront (anonymous, read-only)
  searchPublicProducts(
    params: PublicProductSearchParams,
  ): Promise<SearchResult<PublicProductRecord>>;
  findPublicProductById(id: string, locale: string): Promise<PublicProductRecord | null>;
  suggestPublicProducts(params: {
    category: string;
    specs: Record<string, any>;
    locale?: string;
    limit?: number;
  }): Promise<SearchResult<PublicProductRecord>>;
  searchPublicVendors(params: PublicVendorSearchParams): Promise<SearchResult<PublicVendorRecord>>;
  findPublicVendorById(id: string): Promise<PublicVendorRecord | null>;
  listCategories(): Promise<CategoryCount[]>;
}
