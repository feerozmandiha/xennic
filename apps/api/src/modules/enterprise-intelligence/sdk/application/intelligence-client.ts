import { Injectable, Logger } from '@nestjs/common';
import { ContextApi } from './context-api.js';
import { MemoryApi } from './memory-api.js';
import { PromptApi } from './prompt-api.js';
import { ToolApi } from './tool-api.js';
import { SkillApi } from './skill-api.js';
import { ReasoningApi } from './reasoning-api.js';
import { PolicyApi } from './policy-api.js';
import { GatewayApi } from './gateway-api.js';
import { EvaluationApi } from './evaluation-api.js';

@Injectable()
export class IntelligenceClient {
  private readonly logger = new Logger(IntelligenceClient.name);

  constructor(
    readonly context: ContextApi,
    readonly memory: MemoryApi,
    readonly prompt: PromptApi,
    readonly tool: ToolApi,
    readonly skill: SkillApi,
    readonly reasoning: ReasoningApi,
    readonly policy: PolicyApi,
    readonly gateway: GatewayApi,
    readonly evaluation: EvaluationApi,
  ) {}

  async executeWorkflow(
    skillId: string,
    input: Record<string, unknown>,
    context?: { scope: string; scopeId: string },
  ): Promise<unknown> {
    this.logger.debug(`executeWorkflow(skillId=${skillId})`);

    if (context) {
      const ctx = await this.context.getContext(
        context.scope as never,
        context.scopeId,
      );
      input = { ...input, _context: ctx };
    }

    const allowed = await this.policy.evaluate('execute', `skill:${skillId}`, {
      userId: 'sdk',
    } as never);
    if (!allowed.allowed) {
      throw new Error(`Policy denied execution of skill ${skillId}`);
    }

    return this.skill.execute(skillId, input);
  }

  async evaluateAndReason(
    promptId: string,
    input: Record<string, unknown>,
  ): Promise<{ plan: unknown; response: unknown }> {
    this.logger.debug(`evaluateAndReason(promptId=${promptId})`);

    const plan = await this.reasoning.plan(
      `Evaluate prompt ${promptId}`,
      [{ description: 'Evaluate prompt', input }],
    );

    const executedPlan = await this.reasoning.execute(plan.id);

    const result = { evaluated: true, promptId };
    return { plan: executedPlan, response: result };
  }
}
