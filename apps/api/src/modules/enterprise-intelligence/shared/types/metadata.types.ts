export interface Metadata {
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;
}

export interface Versioned {
  version: number;
}

export interface Named {
  name: string;
  description: string;
}

export interface Auditable {
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string | null;
}
