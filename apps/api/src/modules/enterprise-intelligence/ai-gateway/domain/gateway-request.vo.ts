export interface Message {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
}

export interface GatewayOptions {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  stream?: boolean;
  stop?: string[];
  presencePenalty?: number;
  frequencyPenalty?: number;
  seed?: number;
  tools?: unknown[];
  toolChoice?: 'auto' | 'none' | { type: 'function'; function: { name: string } };
  responseFormat?: { type: 'text' | 'json_object' };
  user?: string;
}

export class GatewayRequest {
  public readonly model: string;
  public readonly messages: Message[] | null;
  public readonly prompt: string | null;
  public readonly options: GatewayOptions;

  private constructor(
    model: string,
    messages: Message[] | null,
    prompt: string | null,
    options: GatewayOptions,
  ) {
    this.model = model;
    this.messages = messages;
    this.prompt = prompt;
    this.options = options;
  }

  static create(
    model: string,
    messages: Message[] | null = null,
    prompt: string | null = null,
    options: GatewayOptions = {},
  ): GatewayRequest {
    if (!messages && !prompt) {
      throw new Error('Either messages or prompt must be provided');
    }

    return new GatewayRequest(model, messages, prompt, options);
  }

  withModel(model: string): GatewayRequest {
    return new GatewayRequest(model, this.messages, this.prompt, this.options);
  }

  withOptions(options: GatewayOptions): GatewayRequest {
    return new GatewayRequest(this.model, this.messages, this.prompt, { ...this.options, ...options });
  }
}
