import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  SelectionRationale,
  type SelectionType,
  type Candidate,
} from '../domain/selection-rationale.vo.js';
import type { IExplainabilityRepository } from '../domain/explainability-repository.interface.js';

export interface SelectionComparison {
  selectionType: SelectionType;
  selections: SelectionRationale[];
  differences: string[];
}

@Injectable()
export class RationaleService {
  private readonly logger = new Logger(RationaleService.name);

  constructor(
    @Inject('IExplainabilityRepository')
    private readonly repository: IExplainabilityRepository,
  ) {}

  async recordSelection(
    executionId: string,
    type: SelectionType,
    selected: string,
    candidates: Candidate[],
    criteria: string[],
    scores: Record<string, number>,
    reason: string,
  ): Promise<SelectionRationale> {
    const entity = SelectionRationale.create({
      executionId,
      selectionType: type,
      selectedId: selected,
      candidates,
      criteria,
      scores,
      winnerReason: reason,
    });

    await this.repository.saveRationale(entity);
    this.logger.log(
      `Selection rationale recorded: ${type} → ${selected} for execution ${executionId}`,
    );
    return entity;
  }

  async getRationale(executionId: string, type?: SelectionType): Promise<SelectionRationale[]> {
    return this.repository.getRationale(executionId, type);
  }

  async compareRationales(executionId: string, type: SelectionType): Promise<SelectionComparison> {
    const selections = await this.repository.getRationale(executionId, type);

    const differences: string[] = [];
    if (selections.length > 1) {
      for (let i = 1; i < selections.length; i++) {
        const prev = selections[i - 1]!;
        const curr = selections[i]!;
        if (prev.selectedId !== curr.selectedId) {
          differences.push(
            `Selection changed from "${prev.selectedId}" to "${curr.selectedId}" at ${curr.timestamp.toISOString()}`,
          );
        }
        for (const criterion of prev.criteria) {
          const prevScore = prev.scores[criterion];
          const currScore = curr.scores[criterion];
          if (prevScore !== undefined && currScore !== undefined && prevScore !== currScore) {
            differences.push(
              `Score for "${criterion}" changed from ${prevScore} to ${currScore} at ${curr.timestamp.toISOString()}`,
            );
          }
        }
      }
    }

    return {
      selectionType: type,
      selections,
      differences,
    };
  }
}
