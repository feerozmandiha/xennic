import { randomUUID } from 'node:crypto';

export type ProductStatus = 'active' | 'inactive' | 'archived';

export class ProductEntity {
  constructor(
    public readonly id: string,
    private _vendorId: string,
    private _type: string,
    private _category: string | null,
    private _specifications: Record<string, any> | null,
    private _sku: string,
    private _price: number,
    private _currency: string,
    private _status: ProductStatus,
    private _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
  ) {}

  static create(data: {
    vendorId: string; type: string; category?: string;
    specifications?: Record<string, any>; sku?: string;
    price: number; currency?: string;
  }): ProductEntity {
    return new ProductEntity(
      randomUUID(),
      data.vendorId,
      data.type,
      data.category ?? null,
      data.specifications ?? null,
      data.sku ?? `SKU-${Date.now()}`,
      data.price,
      data.currency ?? 'USD',
      'active',
      new Date(),
      new Date(),
      null,
    );
  }

  static reconstitute(data: {
    id: string; vendorId: string; type: string; category?: string | null;
    specifications?: Record<string, any> | null; sku: string;
    price: number; currency: string; status: string;
    createdAt: Date; updatedAt: Date; deletedAt: Date | null;
  }): ProductEntity {
    return new ProductEntity(
      data.id, data.vendorId, data.type,
      data.category ?? null, data.specifications ?? null,
      data.sku, data.price, data.currency, data.status as ProductStatus,
      data.createdAt, data.updatedAt, data.deletedAt,
    );
  }

  get vendorId(): string { return this._vendorId; }
  get type(): string { return this._type; }
  get category(): string | null { return this._category; }
  get specifications(): Record<string, any> | null { return this._specifications; }
  get sku(): string { return this._sku; }
  get price(): number { return this._price; }
  get currency(): string { return this._currency; }
  get status(): ProductStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }
  get deletedAt(): Date | null { return this._deletedAt; }

  update(data: {
    type?: string; category?: string; specifications?: Record<string, any>;
    price?: number; currency?: string; status?: ProductStatus;
  }): void {
    if (data.type !== undefined) this._type = data.type;
    if (data.category !== undefined) this._category = data.category;
    if (data.specifications !== undefined) this._specifications = data.specifications;
    if (data.price !== undefined) this._price = data.price;
    if (data.currency !== undefined) this._currency = data.currency;
    if (data.status !== undefined) this._status = data.status;
    this._updatedAt = new Date();
  }

  softDelete(): void {
    this._status = 'archived';
    this._deletedAt = new Date();
    this._updatedAt = new Date();
  }
}
