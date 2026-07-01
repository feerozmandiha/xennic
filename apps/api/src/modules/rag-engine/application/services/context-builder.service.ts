import { Injectable } from '@nestjs/common';
import type { IContextBuilder } from '../../domain/interfaces/context-builder.interface.js';
import type {
  RetrievalChunk,
  RagContext,
  ContextNode,
  TierLevel,
  KnowledgeTier,
} from '../../domain/types/rag.types.js';

const TIER_MAP: Record<KnowledgeTier, TierLevel> = {
  platinum: 1,
  gold: 2,
  silver: 3,
  bronze: 4,
};

const TOKEN_BUDGET = 4000;

@Injectable()
export class ContextBuilder implements IContextBuilder {
  async build(chunks: RetrievalChunk[], maxTokens = TOKEN_BUDGET): Promise<RagContext> {
    const nodes = this.prioritizeByTier(chunks);
    const deduplicated = this.deduplicate(nodes);

    const selected: ContextNode[] = [];
    let totalTokens = 0;

    for (const node of deduplicated) {
      const tokens = this.estimateTokens(node.content);
      if (totalTokens + tokens > maxTokens) break;
      selected.push(node);
      totalTokens += tokens;
    }

    const tierDistribution: Record<string, number> = {};
    for (const node of selected) {
      const key = `${node.tier}`;
      tierDistribution[key] = (tierDistribution[key] ?? 0) + 1;
    }

    return {
      nodes: selected,
      totalTokens,
      tierDistribution,
      deduplicated: true,
    };
  }

  prioritizeByTier(chunks: RetrievalChunk[]): ContextNode[] {
    const nodes = chunks.map((c) => ({
      content: c.content,
      tier: this.getTierLevel(c.metadata.tier),
      chunkId: c.chunkId,
      tokenCount: this.estimateTokens(c.content),
      knowledgeObjectId: c.knowledgeObjectId,
      sourceTier: c.metadata.tier,
    }));
    return nodes.sort((a, b) => a.tier - b.tier || b.tokenCount - a.tokenCount);
  }

  deduplicate(nodes: ContextNode[]): ContextNode[] {
    const seen = new Set<string>();
    return nodes.filter((node) => {
      const key = `${node.knowledgeObjectId}:${node.chunkId}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  getTierLevel(tier: string): TierLevel {
    return TIER_MAP[tier as KnowledgeTier] ?? 4;
  }
}
