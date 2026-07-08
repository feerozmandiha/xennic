import { Injectable, Logger } from '@nestjs/common';
import type { GatewayRequest, Message } from '../domain/gateway-request.vo.js';
import { GatewayResponse } from '../domain/gateway-response.vo.js';
import { ProviderExecutionService, type ChatMessage } from '../../../ai-provider-management/application/services/provider-execution.service.js';
import { GatewayTelemetryService } from './gateway-telemetry.service.js';

export interface RoutingPreferences {
  preferredProvider?: string;
  preferredModel?: string;
  capability?: string;
}

@Injectable()
export class AIGatewayService {
  private readonly logger = new Logger(AIGatewayService.name);

  constructor(
    private readonly executionService: ProviderExecutionService,
    private readonly telemetryService: GatewayTelemetryService,
  ) {}

  private mapMessages(messages: Message[] | null, prompt: string | null): ChatMessage[] {
    const msgs = messages ?? (prompt
      ? [{ role: 'user' as const, content: prompt }]
      : [{ role: 'user' as const, content: '' }]);
    return msgs.map(m => ({
      role: m.role === 'tool' ? 'user' as const : m.role as 'system' | 'user' | 'assistant',
      content: m.content,
    }));
  }

  async chat(
    request: GatewayRequest,
    options?: { preferences?: RoutingPreferences; retry?: boolean },
  ): Promise<GatewayResponse> {
    const messages = this.mapMessages(request.messages, request.prompt);

    const start = Date.now();
    try {
      const result = await this.executionService.chat({
        messages,
        modelId: request.model,
        temperature: request.options.temperature,
        maxTokens: request.options.maxTokens,
        providerId: options?.preferences?.preferredProvider,
      });

      const latency = Date.now() - start;
      this.telemetryService.recordCall(
        result.providerName,
        result.model,
        latency,
        { promptTokens: result.promptTokens, completionTokens: result.completionTokens },
        true,
      );

      return GatewayResponse.create(
        result.content,
        { promptTokens: result.promptTokens, completionTokens: result.completionTokens, totalTokens: result.totalTokens },
        latency,
        result.providerName,
        result.model,
        'stop',
      );
    } catch (error) {
      const latency = Date.now() - start;
      this.telemetryService.recordCall('unknown', request.model, latency, { promptTokens: 0, completionTokens: 0 }, false);
      throw error;
    }
  }

  async complete(
    request: GatewayRequest,
    options?: { preferences?: RoutingPreferences; retry?: boolean },
  ): Promise<GatewayResponse> {
    const messages = this.mapMessages(request.messages, request.prompt);

    const start = Date.now();
    try {
      const result = await this.executionService.chat({
        messages,
        modelId: request.model,
        temperature: request.options.temperature,
        maxTokens: request.options.maxTokens,
        providerId: options?.preferences?.preferredProvider,
      });

      const latency = Date.now() - start;
      this.telemetryService.recordCall(
        result.providerName,
        result.model,
        latency,
        { promptTokens: result.promptTokens, completionTokens: result.completionTokens },
        true,
      );

      return GatewayResponse.create(
        result.content,
        { promptTokens: result.promptTokens, completionTokens: result.completionTokens, totalTokens: result.totalTokens },
        latency,
        result.providerName,
        result.model,
        'stop',
      );
    } catch (error) {
      const latency = Date.now() - start;
      this.telemetryService.recordCall('unknown', request.model, latency, { promptTokens: 0, completionTokens: 0 }, false);
      throw error;
    }
  }

  async embed(
    input: string,
    _options?: { preferences?: RoutingPreferences },
  ): Promise<number[]> {
    const start = Date.now();
    try {
      const result = await this.executionService.embed({ input });
      const latency = Date.now() - start;
      this.telemetryService.recordCall(
        result.providerName,
        result.model,
        latency,
        { promptTokens: typeof input === 'string' ? input.length : 0, completionTokens: result.embeddings.length },
        true,
      );
      return result.embeddings[0] ?? [];
    } catch (error) {
      const latency = Date.now() - start;
      this.telemetryService.recordCall('unknown', 'embedding', latency, { promptTokens: 0, completionTokens: 0 }, false);
      throw error;
    }
  }

  async stream(
    request: GatewayRequest,
    options?: { preferences?: RoutingPreferences },
  ): Promise<AsyncIterable<GatewayResponse>> {
    const messages = this.mapMessages(request.messages, request.prompt);

    const result = await this.executionService.chat({
      messages,
      modelId: request.model,
      temperature: request.options.temperature,
      maxTokens: request.options.maxTokens,
      providerId: options?.preferences?.preferredProvider,
    });

    return {
      [Symbol.asyncIterator]: () => {
        let yielded = false;
        return {
          async next(): Promise<IteratorResult<GatewayResponse>> {
            if (yielded) return { done: true, value: undefined as any };
            yielded = true;
            return {
              done: false,
              value: GatewayResponse.create(
                result.content,
                { promptTokens: result.promptTokens, completionTokens: result.completionTokens, totalTokens: result.totalTokens },
                0,
                result.providerName,
                result.model,
                'stop',
              ),
            };
          },
        };
      },
    };
  }
}
