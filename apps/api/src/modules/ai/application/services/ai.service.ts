import {
  Injectable, Inject, NotFoundException,
  ForbiddenException, BadRequestException, Logger,
} from '@nestjs/common';
import type { IAiRepository }        from '../../domain/interfaces/ai.repository.interface.js';
import { ConversationEntity }         from '../../domain/entities/conversation.entity.js';
import { LlmProvider }                from '../../infrastructure/providers/llm.provider.js';
import type { ChatMessage }           from '../../infrastructure/providers/llm.provider.js';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    @Inject('IAiRepository')
    private readonly repo: IAiRepository,
    private readonly llm:  LlmProvider,
  ) {}

  // ── Agents ────────────────────────────────────────────────────────────────

  async getAgents() {
    return this.repo.findActiveAgents();
  }

  // ── Conversations ─────────────────────────────────────────────────────────

  async listConversations(workspaceId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    return this.repo.findConversationsByWorkspace(workspaceId, limit, offset);
  }

  async createConversation(
    workspaceId: string,
    agentSlug:   string,
    title?:      string,
  ): Promise<ConversationEntity> {
    const agent = await this.repo.findAgentBySlug(agentSlug);
    if (!agent) {
      throw new NotFoundException(`Agent "${agentSlug}" not found`);
    }

    const conv = ConversationEntity.create(workspaceId, agent.id, title);
    await this.repo.createConversation(conv);

    // System prompt ذخیره می‌شود
    await this.repo.saveMessage({
      id:             crypto.randomUUID(),
      conversationId: conv.id,
      role:           'system',
      content:        this.llm.systemPrompt,
      metadata:       { type: 'system_prompt' },
      createdAt:      new Date(),
    });

    return conv;
  }

  async getConversation(id: string, workspaceId: string): Promise<ConversationEntity> {
    const conv = await this.repo.findConversation(id);
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.workspaceId !== workspaceId) throw new ForbiddenException('Access denied');
    return conv;
  }

  async deleteConversation(id: string, workspaceId: string): Promise<void> {
    const conv = await this.repo.findConversation(id);
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.workspaceId !== workspaceId) throw new ForbiddenException('Access denied');
    await this.repo.deleteConversation(id);
  }

  // ── Send Message ──────────────────────────────────────────────────────────

  async sendMessage(
    conversationId: string,
    workspaceId:    string,
    userId:         string,
    content:        string,
  ): Promise<{ userMsgId: string; assistantMsgId: string; reply: string; tokens: number }> {
    if (!content.trim()) throw new BadRequestException('Message cannot be empty');

    const conv = await this.getConversation(conversationId, workspaceId);

    // ذخیره پیام کاربر
    const userMsgId = crypto.randomUUID();
    await this.repo.saveMessage({
      id: userMsgId, conversationId, role: 'user',
      content: content.trim(), metadata: {}, createdAt: new Date(),
    });

    // ساخت context (آخرین 20 پیام، بدون system)
    const messages = await this.repo.findMessages(conversationId);
    const context: ChatMessage[] = messages
      .filter(m => m.role !== 'system')
      .slice(-20)
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

    // فراخوانی LLM
    let llmResult;
    try {
      llmResult = await this.llm.chat(context);
      this.logger.log(
        `AI response: provider=${llmResult.provider}, model=${llmResult.model}, tokens=${llmResult.totalTokens}`,
      );
    } catch (err) {
      this.logger.error('LLM call failed', err);
      throw new BadRequestException('AI service temporarily unavailable');
    }

    // ذخیره پاسخ assistant
    const assistantMsgId = crypto.randomUUID();
    await this.repo.saveMessage({
      id:             assistantMsgId,
      conversationId,
      role:           'assistant',
      content:        llmResult.content,
      metadata:       {
        model:    llmResult.model,
        provider: llmResult.provider,
        tokens:   llmResult.totalTokens,
      },
      createdAt: new Date(),
    });

    // Auto-title: اگر اولین پیام کاربر است
    const userMessages = messages.filter(m => m.role === 'user');
    if (!conv.title && userMessages.length === 0) {
      const shortTitle = content.slice(0, 60).trim();
      await this.repo.updateConversationTitle(conversationId, shortTitle);
    }

    // ثبت usage
    await this.repo.recordUsage({
      workspaceId,
      userId,
      agentId:          conv.agentId,
      provider:         llmResult.provider,
      model:            llmResult.model,
      promptTokens:     llmResult.promptTokens,
      completionTokens: llmResult.completionTokens,
      totalTokens:      llmResult.totalTokens,
      cost:             llmResult.totalTokens * 0.000002,
    });

    return {
      userMsgId,
      assistantMsgId,
      reply:  llmResult.content,
      tokens: llmResult.totalTokens,
    };
  }

  // ── Validate Calculation ────────────────────────────────────────────────

  async validateCalculation(
    type: string,
    inputs: Record<string, any>,
    result?: Record<string, any>,
  ): Promise<{
    verified: boolean;
    confidence: 'high' | 'medium' | 'low';
    summary: string;
    warnings: string[];
    recommendations: string[];
    standards: string[];
    details: string;
  }> {
    const inputStr = JSON.stringify(inputs, null, 2);
    const resultStr = result ? JSON.stringify(result, null, 2) : 'N/A (result not provided)';

    const prompt = `You are an expert electrical engineering validator. Review the following calculation:

## Calculation Type
${type}

## Input Parameters
\`\`\`json
${inputStr}
\`\`\`

## Calculated Result
\`\`\`json
${resultStr}
\`\`\`

## Task
Validate this engineering calculation. Respond with a JSON object (no markdown, pure JSON):
{
  "verified": boolean,        // true if the result seems correct
  "confidence": "high"|"medium"|"low",
  "summary": "string",        // brief 1-2 sentence assessment in Persian
  "warnings": ["string"],     // potential issues or assumptions
  "recommendations": ["string"], // suggestions in Persian
  "standards": ["string"],    // applicable standards (e.g. "IEC 60364-5-52")
  "details": "string"         // detailed technical analysis in Persian
}`;

    const messages: ChatMessage[] = [{ role: 'user', content: prompt }];
    const llmResult = await this.llm.chat(messages);

    return this._parseValidationResponse(llmResult.content);
  }

  private _parseValidationResponse(content: string) {
    try {
      const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        verified:        !!parsed.verified,
        confidence:      (['high', 'medium', 'low'].includes(parsed.confidence) ? parsed.confidence : 'low') as 'high' | 'medium' | 'low',
        summary:         parsed.summary ?? '',
        warnings:        Array.isArray(parsed.warnings) ? parsed.warnings : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
        standards:       Array.isArray(parsed.standards) ? parsed.standards : [],
        details:         parsed.details ?? content,
      };
    } catch {
      return {
        verified:        false,
        confidence:      'low' as const,
        summary:         'AI validation completed',
        warnings:        [],
        recommendations: [],
        standards:       [],
        details:         content,
      };
    }
  }

  // ── Usage ─────────────────────────────────────────────────────────────────

  async getUsageStats(workspaceId: string) {
    return this.repo.getUsageStats(workspaceId, new Date());
  }
}
