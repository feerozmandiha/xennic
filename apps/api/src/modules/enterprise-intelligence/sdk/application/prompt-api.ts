import { Injectable, Logger } from '@nestjs/common';
import type { PromptEntity } from '../../prompt-governance/domain/prompt.entity.js';
import type { } from '../../prompt-governance/domain/prompt-policy.entity.js';
import { PromptRegistryService } from '../../prompt-governance/application/prompt-registry.service.js';
import { PromptTemplateService } from '../../prompt-governance/application/prompt-template.service.js';
import { PromptPolicyService } from '../../prompt-governance/application/prompt-policy.service.js';
import { PromptAuditService } from '../../prompt-governance/application/prompt-audit.service.js';

export interface RegisterPromptOptions {
  variables?: string[];
  tags?: string[];
  description?: string;
}

export interface CreateVersionOptions {
  updatedBy: string;
}

@Injectable()
export class PromptApi {
  private readonly logger = new Logger(PromptApi.name);

  constructor(
    private readonly registry: PromptRegistryService,
    private readonly template: PromptTemplateService,
    private readonly policy: PromptPolicyService,
    private readonly audit: PromptAuditService,
  ) {}

  async register(
    name: string,
    content: string,
    options?: RegisterPromptOptions,
  ): Promise<PromptEntity> {
    this.logger.debug(`register(name=${name})`);
    return this.registry.register(
      name,
      content,
      options?.variables ?? [],
      options?.tags ?? [],
      'sdk',
      options?.description ?? '',
    );
  }

  async get(id: string): Promise<PromptEntity> {
    return this.registry.get(id);
  }

  async getByName(name: string, version?: number): Promise<PromptEntity | null> {
    return this.registry.getByName(name, version);
  }

  async render(
    templateId: string,
    variables: Record<string, string>,
  ): Promise<string> {
    return this.template.render(templateId, variables);
  }

  async createVersion(id: string, content: string, updatedBy: string): Promise<PromptEntity> {
    return this.registry.createVersion(id, content, updatedBy);
  }

  async evaluate(
    promptId: string,
    action: string,
    context?: Record<string, unknown>,
  ): Promise<{ allowed: boolean; matchedRules: import('../../prompt-governance/domain/prompt-policy.entity.js').PolicyRule[] }> {
    return this.policy.evaluate(promptId, action, context);
  }

  async getAuditTrail(promptId: string): Promise<import('../../prompt-governance/application/prompt-audit.service.js').AuditEntry[]> {
    const result = await this.audit.getAuditTrail(promptId);
    return result.items;
  }
}
