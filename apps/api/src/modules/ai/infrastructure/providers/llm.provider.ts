import { Injectable, Logger } from '@nestjs/common';
import { ProviderExecutionService } from '../../../ai-provider-management/application/services/provider-execution.service.js';
import type { ChatMessage as ExecChatMessage } from '../../../ai-provider-management/application/services/provider-execution.service.js';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmResponse {
  content: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  model: string;
  provider: string;
}

const SYSTEM_PROMPT = `You are Xennic AI, an expert electrical engineering assistant.

## Expertise
- Power systems, load flow, short circuit analysis
- Cable sizing per IEC 60364-5-52, NEC, BS 7671
- Transformers per IEC 60076 / IEEE C57.110
- Power quality: THD, TDD, harmonics per IEEE 519-2022
- Protection coordination per IEC 60947
- Solar PV, wind, energy storage systems
- Motors, VFD, soft starters
- Grounding per IEC 62305, IEEE 80

## Response Rules
- Reply in the same language as the user (Persian/Farsi or English)
- Show formulas: e.g. THD_I = sqrt(I2^2 + I3^2 + ...) / I1 x 100%
- Always cite standards: IEC, IEEE, NEMA
- For Persian: use proper Farsi engineering terms
- Reference Xennic modules: BASIC-001..005, CABLE-001..004, TRF-001..004, PQ-001..006`;

@Injectable()
export class LlmProvider {
  private readonly logger = new Logger(LlmProvider.name);

  constructor(private readonly execution: ProviderExecutionService) {}

  get systemPrompt(): string {
    return SYSTEM_PROMPT;
  }

  async chat(messages: ChatMessage[]): Promise<LlmResponse> {
    try {
      const result = await this.execution.chat({
        messages: messages as ExecChatMessage[],
        systemPrompt: SYSTEM_PROMPT,
      });
      this.logger.log(
        `AI call: provider=${result.providerName}, model=${result.model}, tokens=${result.totalTokens}`,
      );
      return {
        content: result.content,
        promptTokens: result.promptTokens,
        completionTokens: result.completionTokens,
        totalTokens: result.totalTokens,
        model: result.model,
        provider: result.providerName,
      };
    } catch (err) {
      this.logger.error(`AI execution failed: ${(err as Error).message}`);
      return this._mock(messages);
    }
  }

  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
    const result = await this.chat(messages);
    for (const word of result.content.split(' ')) {
      yield word + ' ';
      await new Promise((r) => setTimeout(r, 15));
    }
  }

  private _mock(messages: ChatMessage[]): LlmResponse {
    const q = messages.at(-1)?.content ?? '';
    return {
      content: this._smartMock(q),
      promptTokens: 0,
      completionTokens: 0,
      totalTokens: 0,
      model: 'mock',
      provider: 'mock',
    };
  }

  private _smartMock(q: string): string {
    const lq = q.toLowerCase();

    if (lq.includes('thd') || lq.includes('هارمونیک') || lq.includes('کیفیت توان')) {
      return `## THD — Total Harmonic Distortion\n\n**IEEE 519-2022:**\n| نسبت Isc/IL | حد مجاز |\n|---|---|\n| <20 | 5% |\n| 20–50 | 8% |\n| >100 | 15% |\n\nفرمول: \`THD_I = √(ΣIₙ²) / I₁ × 100%\`\n\nاز ماژول **PQ-001** در Xennic استفاده کنید.`;
    }
    if (lq.includes('cable') || lq.includes('کابل')) {
      return `## Cable Sizing — IEC 60364-5-52\n\n1. \`I_b = P / (√3 × V × cosφ)\`\n2. ضرایب تصحیح: دما، نصب، گروه‌بندی\n3. افت ولتاژ ≤ 4%\n\nاز ماژول **CABLE-001** استفاده کنید.`;
    }

    return `## Xennic AI\n\n⚠️ سرویس AI در حال حاضر در دسترس نیست.\n\nلطفاً یک ارائه‌دهنده AI از پنل مدیریت اضافه کنید.`;
  }
}
