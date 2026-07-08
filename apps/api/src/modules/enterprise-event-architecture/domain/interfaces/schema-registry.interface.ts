export const ISCHEMA_REGISTRY = 'ISchemaRegistry' as const;

export type CompatibilityMode = 'BACKWARD' | 'FORWARD' | 'FULL' | 'NONE';

export interface EventSchema {
  eventType: string;
  version: number;
  properties: Record<string, SchemaProperty>;
  required: string[];
  description?: string;
  createdAt: string;
}

export interface SchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null';
  description?: string;
  optional?: boolean;
  properties?: Record<string, SchemaProperty>;
  items?: SchemaProperty;
}

export interface SchemaCompatibilityResult {
  compatible: boolean;
  errors: string[];
  mode: CompatibilityMode;
}

export interface ISchemaRegistry {
  register(eventType: string, schema: EventSchema): Promise<void>;
  getSchema(eventType: string, version?: number): Promise<EventSchema | null>;
  getLatestVersion(eventType: string): Promise<number>;
  getAllVersions(eventType: string): Promise<EventSchema[]>;
  checkCompatibility(
    eventType: string,
    newSchema: EventSchema,
    mode: CompatibilityMode,
  ): Promise<SchemaCompatibilityResult>;
}
