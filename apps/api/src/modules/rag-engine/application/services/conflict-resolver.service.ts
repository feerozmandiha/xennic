import type {
  RetrievalChunk,
  ConflictResolution,
  Conflict,
} from '../../domain/types/rag.types.js';
import type { IConflictResolver } from '../../domain/interfaces/conflict-resolver.interface.js';

export class ConflictResolver implements IConflictResolver {
  resolve(
    conflictingChunks: RetrievalChunk[],
    claim: string,
  ): Promise<ConflictResolution> {
    if (conflictingChunks.length === 0) {
      return Promise.resolve({
        resolved: true,
        conflicts: [],
        preferredSource: '',
        explanation: 'No conflicts detected among the provided chunks.',
      });
    }

    const first = conflictingChunks[0]!;
    const allSameContent = conflictingChunks.every(
      (c) => c.content === first.content,
    );
    if (conflictingChunks.length === 1 || allSameContent) {
      return Promise.resolve({
        resolved: true,
        conflicts: [],
        preferredSource: first.metadata.xid,
        explanation: 'No conflicts detected among the provided chunks.',
      });
    }

    const scored = conflictingChunks
      .map((chunk) => ({
        chunk,
        priority: this.getPriorityScore(chunk),
      }))
      .sort((a, b) => {
        const diff = b.priority - a.priority;
        if (diff !== 0) return diff;
        return b.chunk.metadata.authorityScore - a.chunk.metadata.authorityScore;
      });

    const best = scored[0]!;
    const conflicts: Conflict[] = [
      {
        standards: conflictingChunks.map((c) => c.metadata.xid),
        conflictingClaims: [claim],
        resolution: `Selected source "${best.chunk.metadata.title}" (${best.chunk.metadata.xid}) with priority ${best.priority} over other conflicting sources.`,
      },
    ];

    return Promise.resolve({
      resolved: false,
      conflicts,
      preferredSource: best.chunk.metadata.xid,
      explanation: this.explainPriority(best.chunk),
    });
  }

  getPriorityScore(source: RetrievalChunk): number {
    const { tier, taxonomy } = source.metadata;
    const taxSet = new Set(taxonomy);

    if (tier === 'platinum' && taxSet.has('project-spec')) return 10;
    if (tier === 'gold' && taxSet.has('regulation')) return 8;
    if (tier === 'silver' && taxSet.has('standard')) return 6;
    if (tier === 'silver' && taxSet.has('manufacturer')) return 4;
    if (tier === 'bronze' && taxSet.has('academic')) return 2;

    return 0;
  }

  explainPriority(chunk: RetrievalChunk): string {
    const priority = this.getPriorityScore(chunk);
    const priorityName = this.getPriorityName(chunk);
    return `Preferred because it's a ${priorityName} (priority ${priority})`;
  }

  private getPriorityName(chunk: RetrievalChunk): string {
    const { tier, taxonomy } = chunk.metadata;
    const taxSet = new Set(taxonomy);

    if (tier === 'platinum' && taxSet.has('project-spec')) return 'Project Specification';
    if (tier === 'gold' && taxSet.has('regulation')) return 'National Regulation';
    if (tier === 'silver' && taxSet.has('standard')) return 'Tier 1 Standard';
    if (tier === 'silver' && taxSet.has('manufacturer')) return 'Manufacturer Documentation';
    if (tier === 'bronze' && taxSet.has('academic')) return 'Academic Source';

    return 'Unknown Source';
  }
}
