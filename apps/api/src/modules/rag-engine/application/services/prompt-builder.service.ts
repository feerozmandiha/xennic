import { Injectable } from '@nestjs/common';
import type { IPromptBuilder } from '../../domain/interfaces/prompt-builder.interface.js';
import type { RagQuery, RagContext, RagPrompt } from '../../domain/types/rag.types.js';

@Injectable()
export class PromptBuilder implements IPromptBuilder {
  async build(query: RagQuery, context: RagContext): Promise<RagPrompt> {
    const system = this.buildSystemContext();
    const constraints = this.buildConstraints(query);
    const evidence = this.buildEvidenceSection(context);
    const knowledge = this.buildKnowledgeSection(context);
    const outputRules = this.buildOutputRules();

    const fullPrompt = [
      system,
      constraints,
      evidence,
      knowledge,
      `## User Question\n\n${query.question}`,
      outputRules,
    ].join('\n\n');

    const prompt: RagPrompt = {
      system,
      constraints,
      evidence,
      knowledge,
      question: query.question,
      outputRules,
      fullPrompt,
    };

    return this.sanitizePrompt(prompt);
  }

  buildSystemContext(): string {
    return [
      '## System Context',
      '',
      'You are an Engineering Evidence Engine for the Xennic platform.',
      'You provide answers based exclusively on retrieved engineering knowledge.',
      'Every claim must be supported by at least one citation.',
      'You never rely on your pre-training knowledge for engineering claims.',
      'If evidence is insufficient, state that clearly.',
    ].join('\n');
  }

  buildConstraints(query: RagQuery): string {
    const lines: string[] = ['## Engineering Constraints', ''];
    if (query.filters?.tiers?.length) {
      lines.push(`- Only use sources with tiers: ${query.filters.tiers.join(', ')}`);
    }
    if (query.filters?.languages?.length) {
      lines.push(`- Only use sources in languages: ${query.filters.languages.join(', ')}`);
    }
    if (query.filters?.versionStatus) {
      lines.push(`- Only use sources with status: ${query.filters.versionStatus}`);
    }
    if (query.filters?.minAuthorityScore !== undefined) {
      lines.push(`- Minimum authority score: ${query.filters.minAuthorityScore}`);
    }
    lines.push('- Prioritize higher-tier sources (Platinum > Gold > Silver > Bronze)');
    lines.push('- If multiple sources conflict, explain the conflict and why you chose the preferred source');
    return lines.join('\n');
  }

  buildEvidenceSection(context: RagContext): string {
    const lines: string[] = ['## Evidence', ''];
    for (const node of context.nodes) {
      lines.push(`- [Tier ${node.tier} - ${node.sourceTier}] ${node.chunkId}: ${node.content.slice(0, 200)}`);
    }
    return lines.join('\n');
  }

  buildKnowledgeSection(context: RagContext): string {
    const lines: string[] = ['## Retrieved Knowledge', ''];
    for (const node of context.nodes) {
      lines.push(`### Chunk: ${node.chunkId} (Knowledge Object: ${node.knowledgeObjectId})`);
      lines.push('');
      lines.push(node.content);
      lines.push('');
    }
    lines.push(`---\nTotal tokens: ${context.totalTokens}`);
    return lines.join('\n');
  }

  buildOutputRules(): string {
    return [
      '## Output Rules',
      '',
      '1. Answer the question using only the evidence provided above.',
      '2. For each claim, include a citation in the format [Source: XID, Section, Page].',
      '3. If evidence is insufficient, say "Insufficient evidence" and explain what is missing.',
      '4. Do NOT use your pre-training knowledge to supplement missing evidence.',
      '5. If sources disagree, present both positions and explain which is preferred and why.',
      '6. Your output will be validated for citation completeness.',
    ].join('\n');
  }

  sanitizePrompt(prompt: RagPrompt): RagPrompt {
    return {
      ...prompt,
      fullPrompt: prompt.fullPrompt.replace(/system|constraints|evidence|knowledge|outputRules/gi, '[REDACTED]'),
    };
  }
}
