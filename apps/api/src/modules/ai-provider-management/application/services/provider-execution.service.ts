import { Injectable, Logger } from '@nestjs/common';
import { ProviderRegistryService } from './provider-registry.service.js';
import { CredentialService } from './credential.service.js';
import { RoutingEngineService, RoutingRequest } from './routing-engine.service.js';
import { FailoverService } from './failover.service.js';
import { ProviderHttpClient } from '../../infrastructure/http/provider-http.client.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatExecutionRequest {
  messages: ChatMessage[];
  systemPrompt?: string;
  modelId?: string;
  providerId?: string;
  capability?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface EmbeddingExecutionRequest {
  input: string | string[];
  modelId?: string;
  providerId?: string;
  capability?: string;
}

export interface ChatExecutionResult {
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  providerId: string;
  providerName: string;
}

export interface EmbeddingExecutionResult {
  embeddings: number[][];
  model: string;
  providerId: string;
  providerName: string;
  totalTokens?: number;
}

@Injectable()
export class ProviderExecutionService {
  private readonly logger = new Logger(ProviderExecutionService.name);

  constructor(
    private readonly registry: ProviderRegistryService,
    private readonly credentials: CredentialService,
    private readonly routing: RoutingEngineService,
    private readonly failover: FailoverService,
    private readonly http: ProviderHttpClient,
  ) {}

  async chat(request: ChatExecutionRequest): Promise<ChatExecutionResult> {
    const { messages, systemPrompt, temperature, maxTokens } = request;
    const routingReq: RoutingRequest = {
      capability: request.capability ?? 'chat',
      preferredProviderId: request.providerId,
      preferredModelId: request.modelId,
    };

    const { provider, model } = await this.routing.routeWithFallback(routingReq);
    const apiKey = await this.credentials.getApiKey(provider.id);
    if (!apiKey) throw new Error(`No API key available for provider ${provider.name}`);

    const baseUrl = provider.baseUrl ?? this.defaultBaseUrl(provider.providerType);
    if (!baseUrl) throw new Error(`No base URL for provider ${provider.name}`);

    const modelId = model?.modelId ?? model?.id ?? request.modelId ?? 'gpt-4o-mini';
    const fullMessages = systemPrompt
      ? [{ role: 'system' as const, content: systemPrompt }, ...messages]
      : messages;

    const body: Record<string, unknown> = {
      model: modelId,
      messages: fullMessages,
      temperature: temperature ?? 0.7,
      max_tokens: maxTokens ?? 2000,
    };

    let chatResult: ChatExecutionResult | null = null;

    const result = await this.failover.executeWithRetry(provider.id, async () => {
      const res = await this.http.request(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body,
        timeout: 30000,
      });

      if (!res.ok) {
        throw new Error(`Chat completion failed: HTTP ${res.status}`);
      }

      const data = res.data as any;
      const choice = data?.choices?.[0];
      const content = choice?.message?.content || choice?.message?.reasoning || '';
      if (!content) throw new Error('Empty response from AI');

      chatResult = {
        content,
        promptTokens: data.usage?.prompt_tokens ?? 0,
        completionTokens: data.usage?.completion_tokens ?? 0,
        totalTokens: data.usage?.total_tokens ?? 0,
        model: data.model ?? modelId,
        providerId: provider.id,
        providerName: provider.name,
      };
      return chatResult;
    });

    if (!result.success) {
      throw new Error(`Chat execution failed after ${result.attempts} attempts: ${result.error}`);
    }

    if (!chatResult) {
      throw new Error('Chat execution completed without response payload');
    }

    return chatResult;
  }

  async embed(request: EmbeddingExecutionRequest): Promise<EmbeddingExecutionResult> {
    const routingReq: RoutingRequest = {
      capability: request.capability ?? 'embedding',
      preferredProviderId: request.providerId,
      preferredModelId: request.modelId,
    };

    const { provider, model } = await this.routing.route(routingReq);
    const apiKey = await this.credentials.getApiKey(provider.id);
    if (!apiKey) throw new Error(`No API key available for provider ${provider.name}`);

    const baseUrl = provider.baseUrl ?? this.defaultBaseUrl(provider.providerType);
    if (!baseUrl) throw new Error(`No base URL for provider ${provider.name}`);

    const modelId = model?.modelId ?? model?.id ?? request.modelId ?? 'text-embedding-3-small';
    const input = request.input;

    const body: Record<string, unknown> = {
      input,
      model: modelId,
    };

    const endpoint = Array.isArray(input) ? '/embeddings' : '/embeddings';

    let embeddingResult: EmbeddingExecutionResult | null = null;

    const result = await this.failover.executeWithRetry(provider.id, async () => {
      const res = await this.http.request(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body,
        timeout: 60000,
      });

      if (!res.ok) {
        throw new Error(`Embedding failed: HTTP ${res.status}`);
      }

      const data = res.data as any;
      const embeddings = (data?.data ?? []).map((item: any) => item.embedding ?? []);
      embeddingResult = {
        embeddings,
        model: data.model ?? modelId,
        providerId: provider.id,
        providerName: provider.name,
        totalTokens: data.usage?.total_tokens,
      };
      return embeddingResult;
    });

    if (!result.success) {
      throw new Error(
        `Embedding execution failed after ${result.attempts} attempts: ${result.error}`,
      );
    }

    if (!embeddingResult) {
      throw new Error('Embedding execution completed without response payload');
    }

    return embeddingResult;
  }

  async *chatStream(request: ChatExecutionRequest): AsyncGenerator<string> {
    const result = await this.chat(request);
    for (const word of result.content.split(' ')) {
      yield word + ' ';
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  private defaultBaseUrl(providerType: string): string | null {
    const urls: Record<string, string> = {
      openai: 'https://api.openai.com/v1',
      anthropic: 'https://api.anthropic.com/v1',
      gemini: 'https://generativelanguage.googleapis.com/v1beta',
      mistral: 'https://api.mistral.ai/v1',
      groq: 'https://api.groq.com/openai/v1',
      openrouter: 'https://openrouter.ai/api/v1',
      together: 'https://api.together.xyz/v1',
      deepseek: 'https://api.deepseek.com/v1',
      cohere: 'https://api.cohere.ai/v1',
      voyageai: 'https://api.voyageai.com/v1',
      ollama: 'http://localhost:11434/v1',
      xai: 'https://api.x.ai/v1',
    };
    return urls[providerType] ?? null;
  }
}
