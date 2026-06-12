import { Injectable, Logger } from '@nestjs/common';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LlmResponse {
  content:          string;
  promptTokens:     number;
  completionTokens: number;
  totalTokens:      number;
  model:            string;
  provider:         string;
}

// ═══════════════════════════════════════════════════════════════════════
//  AI Configuration — همه تنظیمات از .env خوانده می‌شود
//
//  متغیرهای .env:
//    AI_PROVIDER   = groq | openai | xai | anthropic | ollama | together
//    AI_API_KEY    = sk-... | gsk_... | xai-...
//    AI_MODEL      = llama-3.1-8b-instant | gpt-4o-mini | grok-3 | ...
//    AI_BASE_URL   = https://api.groq.com/openai/v1  (اختیاری)
//    AI_MAX_TOKENS = 2000  (اختیاری، پیش‌فرض 2000)
//    AI_TEMPERATURE = 0.7  (اختیاری، پیش‌فرض 0.7)
//
//  Provider defaults (اگر AI_BASE_URL تنظیم نشده):
//    groq      → https://api.groq.com/openai/v1
//    openai    → https://api.openai.com/v1
//    xai       → https://api.x.ai/v1
//    together  → https://api.together.xyz/v1
//    openrouter→ https://openrouter.ai/api/v1
//    mistral   → https://api.mistral.ai/v1
//    ollama    → http://localhost:11434/v1
// ═══════════════════════════════════════════════════════════════════════

const PROVIDER_DEFAULTS: Record<string, { url: string; model: string }> = {
  groq:       { url: 'https://api.groq.com/openai/v1',      model: 'llama-3.1-8b-instant' },
  openai:     { url: 'https://api.openai.com/v1',           model: 'gpt-4o-mini' },
  xai:        { url: 'https://api.x.ai/v1',                 model: 'grok-3' },
  grok:       { url: 'https://api.x.ai/v1',                 model: 'grok-3' },
  together:   { url: 'https://api.together.xyz/v1',         model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo' },
  openrouter: { url: 'https://openrouter.ai/api/v1',        model: 'meta-llama/llama-3.3-70b-instruct:free' },
  mistral:    { url: 'https://api.mistral.ai/v1',           model: 'mistral-small-latest' },
  anthropic:  { url: 'https://api.anthropic.com/v1',        model: 'claude-3-haiku-20240307' },
  ollama:     { url: 'http://localhost:11434/v1',            model: 'llama3.2' },
};

function getConfig() {
  const provider = (process.env['AI_PROVIDER'] ?? 'mock').toLowerCase();
  const apiKey   = process.env['AI_API_KEY'] ?? process.env['GROQ_API_KEY'] ?? '';
  const def      = PROVIDER_DEFAULTS[provider] ?? PROVIDER_DEFAULTS['openai'];
  const baseURL  = process.env['AI_BASE_URL']   || def?.url || "";
  const model    = process.env['AI_MODEL']       || def?.model || "llama-3.3-70b-versatile";
  const maxTok   = parseInt(process.env['AI_MAX_TOKENS']  ?? '2000', 10);
  const temp     = parseFloat(process.env['AI_TEMPERATURE'] ?? '0.7');
  return { provider, apiKey, baseURL, model, maxTok, temp };
}

// ── System Prompt تخصصی مهندسی برق ──────────────────────────────────────────

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

  get systemPrompt(): string { return SYSTEM_PROMPT; }

  // ── Chat ──────────────────────────────────────────────────────────────────

  async chat(messages: ChatMessage[]): Promise<LlmResponse> {
    const cfg = getConfig();

    if (!cfg.apiKey || cfg.provider === 'mock') {
      this.logger.warn('AI_API_KEY not set — using mock response');
      return this._mock(messages);
    }

    this.logger.log(`AI call: provider=${cfg.provider}, model=${cfg.model}`);

    try {
      const res = await this._callOpenAI(cfg, messages);
      this.logger.log(`✅ AI OK: ${res.totalTokens} tokens, model=${res.model}`);
      return res;
    } catch (err) {
      const msg = (err as Error).message;
      this.logger.error(`AI failed: ${msg}`);

      // Rate limit → retry once after 2s
      if (msg.includes('429') || msg.includes('403') || msg.includes('rate')) {
        this.logger.warn('Rate limited — retrying in 2s...');
        await new Promise(r => setTimeout(r, 2000));
        try {
          const res = await this._callOpenAI(cfg, messages);
          this.logger.log(`✅ AI retry OK: ${res.totalTokens} tokens`);
          return res;
        } catch (err2) {
          this.logger.error(`AI retry failed: ${(err2 as Error).message}`);
        }
      }

      return this._mock(messages);
    }
  }

  // ── OpenAI-compatible call ────────────────────────────────────────────────

  private async _callOpenAI(
    cfg: ReturnType<typeof getConfig>,
    messages: ChatMessage[],
  ): Promise<LlmResponse> {
    const body = {
      model:       cfg.model,
      messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      temperature: cfg.temp,
      max_tokens:  cfg.maxTok,
    };

    const res = await fetch(`${cfg.baseURL}/chat/completions`, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${cfg.apiKey}`,
      },
      body:   JSON.stringify(body),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status}: ${errText.slice(0, 150)}`);
    }

    const data   = await res.json() as any;
    const choice = data.choices?.[0];
    const content = choice?.message?.content || choice?.message?.reasoning || '';

    if (!content) throw new Error('Empty response from AI');

    return {
      content,
      promptTokens:     data.usage?.prompt_tokens     ?? 0,
      completionTokens: data.usage?.completion_tokens ?? 0,
      totalTokens:      data.usage?.total_tokens      ?? 0,
      model:            data.model ?? cfg.model,
      provider:         cfg.provider,
    };
  }

  // ── Stream ────────────────────────────────────────────────────────────────

  async *chatStream(messages: ChatMessage[]): AsyncGenerator<string> {
    const result = await this.chat(messages);
    for (const word of result.content.split(' ')) {
      yield word + ' ';
      await new Promise(r => setTimeout(r, 15));
    }
  }

  // ── Mock ──────────────────────────────────────────────────────────────────

  private _mock(messages: ChatMessage[]): LlmResponse {
    const q = messages.at(-1)?.content ?? '';
    return {
      content:          this._smartMock(q),
      promptTokens:     0,
      completionTokens: 0,
      totalTokens:      0,
      model:            'mock',
      provider:         'mock',
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

    return `## Xennic AI\n\n⚠️ سرویس AI در حال حاضر در دسترس نیست.\n\nلطفاً \`AI_API_KEY\` را در \`.env\` تنظیم کنید:\n\`\`\`\nAI_PROVIDER=groq\nAI_API_KEY=gsk_...\nAI_MODEL=llama-3.1-8b-instant\n\`\`\``;
  }
}
