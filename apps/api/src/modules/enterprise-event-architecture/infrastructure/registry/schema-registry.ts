import { Injectable } from '@nestjs/common';
import { SchemaRegistryService } from '../../application/services/schema-registry.service.js';

@Injectable()
export class SchemaRegistryImpl {
  constructor(public readonly delegate: SchemaRegistryService) {}
}
