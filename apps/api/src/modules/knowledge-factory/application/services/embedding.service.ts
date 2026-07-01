import { Injectable, Logger } from '@nestjs/common';
import { LlmProvider } from '../../../ai/infrastructure/providers/llm.provider.js';
import type { DocumentChunk, EmbeddingResult } from '../../domain/chunk.types.js';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const EMBEDDING_DIMENSIONS = 1536;

@Injectable()
export class EmbeddingService {
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(private readonly llmProvider: LlmProvider) {}

  async generateEmbedding(text: string): Promise<number[]> {
    const provider = this._resolveEmbeddingProvider();
    const embedding = await this._callEmbeddingEndpoint(provider, text);
    return embedding;
  }

  async generateEmbeddingWithRetry(text: string, maxRetries = 3): Promise<number[]> {
    let lastError: Error | undefined;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await this.generateEmbedding(text);
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        this.logger.warn(`Embedding attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * 2 ** attempt, 30_000);
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }
    throw lastError ?? new Error('Embedding generation failed');
  }

  async generateEmbeddings(chunks: DocumentChunk[]): Promise<EmbeddingResult[]> {
    const results: EmbeddingResult[] = [];

    for (let i = 0; i < chunks.length; i += 20) {
      const batch = chunks.slice(i, i + 20);
      const batchResults = await Promise.allSettled(
        batch.map((chunk) => this.generateEmbeddingWithRetry(chunk.content)),
      );

      for (let j = 0; j < batch.length; j++) {
        const result = batchResults[j]!;
        if (result.status === 'fulfilled') {
          results.push({
            chunkId: batch[j]!.chunkId,
            embedding: result.value,
            dimensions: result.value.length,
          });
        } else {
          this.logger.error(`Failed to embed chunk ${batch[j]!.chunkId}: ${result.reason}`);
        }
      }
    }

    return results;
  }

  private _resolveEmbeddingProvider(): { baseURL: string; apiKey: string; model: string } {
    const baseURL = process.env['AI_BASE_URL'] ?? 'https://api.openai.com/v1';
    const apiKey = process.env['AI_API_KEY'] ?? '';
    const model = process.env['AI_EMBEDDING_MODEL'] ?? EMBEDDING_MODEL;
    return { baseURL, apiKey, model };
  }

  private async _callEmbeddingEndpoint(
    provider: { baseURL: string; apiKey: string; model: string },
    text: string,
  ): Promise<number[]> {
    if (!provider.apiKey) {
      return this._mockEmbedding(text);
    }

    const url = `${provider.baseURL.replace(/\/+$/, '')}/embeddings`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        input: text,
      }),
      signal: AbortSignal.timeout(15_000),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new Error(`Embedding HTTP ${response.status}: ${errorText.slice(0, 200)}`);
    }

    const data = (await response.json()) as {
      data: { embedding: number[] }[];
    };

    if (!data.data?.[0]?.embedding) {
      throw new Error('Invalid embedding response format');
    }

    return data.data[0].embedding;
  }

  private _mockEmbedding(text: string): number[] {
    const dims = EMBEDDING_DIMENSIONS;
    const hash = this._simpleHash(text);
    const embedding: number[] = [];

    for (let i = 0; i < dims; i++) {
      const val = Math.sin(hash * (i + 1)) * 0.5 + Math.cos(hash * (i + 13)) * 0.3;
      embedding.push(parseFloat(val.toFixed(6)));
    }

    return embedding;
  }

  private _simpleHash(text: string): number {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) / 2147483647;
  }
}
