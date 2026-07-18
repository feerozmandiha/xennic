import { Injectable, Logger } from '@nestjs/common';
import { GatewayRequest, type Message } from '../../ai-gateway/domain/gateway-request.vo.js';
import type { GatewayResponse } from '../../ai-gateway/domain/gateway-response.vo.js';
import {
  AIGatewayService,
  type RoutingPreferences,
} from '../../ai-gateway/application/ai-gateway.service.js';
import { GatewayTelemetryService } from '../../ai-gateway/application/gateway-telemetry.service.js';
import { ProviderCapability } from '../../ai-gateway/domain/provider.enum.js';

export interface ChatOptions {
  preferences?: RoutingPreferences;
  retry?: boolean;
}

export interface CompleteOptions {
  preferences?: RoutingPreferences;
  retry?: boolean;
}

export interface EmbedOptions {
  preferences?: RoutingPreferences;
}

@Injectable()
export class GatewayApi {
  private readonly logger = new Logger(GatewayApi.name);

  constructor(
    private readonly gateway: AIGatewayService,
    private readonly telemetry: GatewayTelemetryService,
  ) {}

  async chat(model: string, messages: Message[], options?: ChatOptions): Promise<GatewayResponse> {
    this.logger.debug(`chat(model=${model})`);
    const request = GatewayRequest.create(model, messages, null, {});
    return this.gateway.chat(request, options);
  }

  async complete(
    model: string,
    prompt: string,
    options?: CompleteOptions,
  ): Promise<GatewayResponse> {
    this.logger.debug(`complete(model=${model})`);
    const messages: Message[] = [{ role: 'user', content: prompt }];
    const request = GatewayRequest.create(model, messages, null, {});
    return this.gateway.complete(request, options);
  }

  async embed(model: string, input: string, options?: EmbedOptions): Promise<number[]> {
    this.logger.debug(`embed(model=${model})`);
    return this.gateway.embed(input, options);
  }

  async getModels(_capability?: ProviderCapability): Promise<string[]> {
    return [];
  }

  async getStats(): Promise<Record<string, unknown>> {
    return {};
  }
}
