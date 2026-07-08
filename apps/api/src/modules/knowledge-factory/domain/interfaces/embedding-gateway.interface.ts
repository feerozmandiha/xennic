export interface EmbeddingGateway {
  embedText(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  isHealthy(): Promise<boolean>;
}
