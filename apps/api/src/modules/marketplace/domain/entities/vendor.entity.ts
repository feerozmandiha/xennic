import { randomUUID } from 'node:crypto';

export type VendorStatus = 'active' | 'inactive' | 'suspended';

export class VendorEntity {
  constructor(
    public readonly id: string,
    private _name: string,
    private _slug: string,
    private _status: VendorStatus,
    private _createdAt: Date,
    private _updatedAt: Date,
  ) {}

  static create(data: { name: string; slug?: string }): VendorEntity {
    const slug = data.slug ?? data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9\-]/g, '');
    return new VendorEntity(
      randomUUID(),
      data.name,
      slug,
      'active',
      new Date(),
      new Date(),
    );
  }

  static reconstitute(data: {
    id: string; name: string; slug: string; status: string;
    createdAt: Date; updatedAt: Date;
  }): VendorEntity {
    return new VendorEntity(
      data.id, data.name, data.slug,
      data.status as VendorStatus,
      data.createdAt, data.updatedAt,
    );
  }

  get name(): string { return this._name; }
  get slug(): string { return this._slug; }
  get status(): VendorStatus { return this._status; }
  get createdAt(): Date { return this._createdAt; }
  get updatedAt(): Date { return this._updatedAt; }

  update(data: { name?: string; status?: VendorStatus }): void {
    if (data.name !== undefined) this._name = data.name;
    if (data.status !== undefined) this._status = data.status;
    this._updatedAt = new Date();
  }
}
