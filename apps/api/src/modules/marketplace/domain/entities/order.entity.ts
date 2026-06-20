import { randomUUID } from 'node:crypto';

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface OrderItemData {
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export class OrderEntity {
  constructor(
    public readonly id: string,
    private _workspaceId: string,
    private _userId: string,
    private _status: OrderStatus,
    private _currency: string,
    private _totalAmount: number,
    private _items: OrderItemData[],
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(data: {
    workspaceId: string; userId: string;
    currency?: string; items: OrderItemData[];
  }): OrderEntity {
    const totalAmount = data.items.reduce((sum, i) => sum + i.totalPrice, 0);
    return new OrderEntity(
      randomUUID(),
      data.workspaceId,
      data.userId,
      'pending',
      data.currency ?? 'USD',
      totalAmount,
      data.items,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string; workspaceId: string; userId: string;
    status: string; currency: string; totalAmount: number;
    items: OrderItemData[]; createdAt: Date; updatedAt: Date;
  }): OrderEntity {
    return new OrderEntity(
      data.id, data.workspaceId, data.userId,
      data.status as OrderStatus, data.currency,
      data.totalAmount, data.items,
      data.createdAt, data.updatedAt,
    );
  }

  get workspaceId(): string { return this._workspaceId; }
  get userId(): string { return this._userId; }
  get status(): OrderStatus { return this._status; }
  get currency(): string { return this._currency; }
  get totalAmount(): number { return this._totalAmount; }
  get items(): OrderItemData[] { return this._items; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  updateStatus(status: OrderStatus): void {
    this._status = status;
    this._updatedAt = new Date();
  }
}
