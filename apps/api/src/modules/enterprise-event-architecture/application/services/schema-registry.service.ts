import { Injectable, Logger } from '@nestjs/common';
import type {
  ISchemaRegistry,
  EventSchema,
  SchemaCompatibilityResult,
  CompatibilityMode,
} from '../../domain/interfaces/schema-registry.interface.js';

@Injectable()
export class SchemaRegistryService implements ISchemaRegistry {
  private readonly logger = new Logger(SchemaRegistryService.name);
  private readonly schemas = new Map<string, EventSchema[]>();

  async register(eventType: string, schema: EventSchema): Promise<void> {
    const existing = this.schemas.get(eventType) ?? [];
    const latest = existing[existing.length - 1];
    if (latest && latest.version >= schema.version) {
      throw new Error(
        `Schema version ${schema.version} for ${eventType} is not newer than latest ${latest.version}`,
      );
    }
    existing.push(schema);
    this.schemas.set(eventType, existing);
    this.logger.log(`Registered schema ${eventType} v${schema.version}`);
  }

  async getSchema(eventType: string, version?: number): Promise<EventSchema | null> {
    const versions = this.schemas.get(eventType);
    if (!versions || versions.length === 0) return null;
    if (version === undefined) return versions[versions.length - 1] ?? null;
    return versions.find(v => v.version === version) ?? null;
  }

  async getLatestVersion(eventType: string): Promise<number> {
    const schema = await this.getSchema(eventType);
    return schema?.version ?? 0;
  }

  async getAllVersions(eventType: string): Promise<EventSchema[]> {
    return this.schemas.get(eventType) ?? [];
  }

  async checkCompatibility(
    eventType: string,
    newSchema: EventSchema,
    mode: CompatibilityMode,
  ): Promise<SchemaCompatibilityResult> {
    const errors: string[] = [];
    const latest = await this.getSchema(eventType);

    if (!latest || mode === 'NONE') {
      return { compatible: true, errors: [], mode };
    }

    if (mode === 'BACKWARD' || mode === 'FULL') {
      for (const required of latest.required) {
        if (!newSchema.required.includes(required)) {
          errors.push(`BACKWARD: Required field "${required}" removed in new schema`);
        }
      }
      for (const [key, prop] of Object.entries(latest.properties)) {
        const newProp = newSchema.properties[key];
        if (!newProp) {
          if (!prop.optional) {
            errors.push(`BACKWARD: Non-optional field "${key}" missing in new schema`);
          }
        } else if (prop.type !== newProp.type) {
          errors.push(`BACKWARD: Field "${key}" type changed from ${prop.type} to ${newProp.type}`);
        }
      }
    }

    if (mode === 'FORWARD' || mode === 'FULL') {
      for (const required of newSchema.required) {
        if (!latest.properties[required]) {
          errors.push(`FORWARD: New required field "${required}" not in previous schema`);
        }
      }
    }

    return { compatible: errors.length === 0, errors, mode };
  }
}
