import { Injectable, Logger } from '@nestjs/common';
import { EmbeddingGateway } from '../../domain/interfaces/embedding-gateway.interface.js';
import { ProviderExecutionService } from '../../../ai-provider-management/application/services/provider-execution.service.js';

@Injectable()
export class EmbeddingGatewayService implements EmbeddingGateway {
  private readonly logger = new Logger(EmbeddingGatewayService.name);

  constructor(private readonly execution: ProviderExecutionService) {}

  async embedText(text: string): Promise<number[]> {
    const result = await this.execution.embed({ input: text, capability: 'embedding' });
    return result.embeddings[0] ?? [];
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) return [];
    const result = await this.execution.embed({ input: texts, capability: 'embedding' });
    return result.embeddings;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const result = await this.execution.embed({ input: 'test', capability: 'embedding' });
      return result.embeddings.length > 0;
    } catch {
      return false;
    }
  }
}
