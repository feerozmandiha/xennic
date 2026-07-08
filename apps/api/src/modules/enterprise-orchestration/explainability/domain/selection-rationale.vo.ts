import { randomUUID } from 'node:crypto';

export type SelectionType = 'tool' | 'skill' | 'provider' | 'plan';

export interface Candidate {
  id: string;
  name: string;
  scores: Record<string, number>;
  totalScore: number;
}

export interface SelectionRationaleOptions {
  executionId: string;
  selectionType: SelectionType;
  selectedId: string;
  candidates: Candidate[];
  criteria: string[];
  scores: Record<string, number>;
  winnerReason: string;
}

export interface SelectionRationaleReconstituteOptions {
  id: string;
  executionId: string;
  selectionType: SelectionType;
  selectedId: string;
  candidates: Candidate[];
  criteria: string[];
  scores: Record<string, number>;
  winnerReason: string;
  timestamp: Date;
}

export class SelectionRationale {
  public readonly id: string;
  public readonly executionId: string;
  public readonly selectionType: SelectionType;
  public readonly selectedId: string;
  public readonly candidates: Candidate[];
  public readonly criteria: string[];
  public readonly scores: Record<string, number>;
  public readonly winnerReason: string;
  public readonly timestamp: Date;

  private constructor(
    id: string,
    executionId: string,
    selectionType: SelectionType,
    selectedId: string,
    candidates: Candidate[],
    criteria: string[],
    scores: Record<string, number>,
    winnerReason: string,
    timestamp: Date,
  ) {
    this.id = id;
    this.executionId = executionId;
    this.selectionType = selectionType;
    this.selectedId = selectedId;
    this.candidates = candidates;
    this.criteria = criteria;
    this.scores = scores;
    this.winnerReason = winnerReason;
    this.timestamp = timestamp;
  }

  static create(opts: SelectionRationaleOptions): SelectionRationale {
    return new SelectionRationale(
      randomUUID(),
      opts.executionId,
      opts.selectionType,
      opts.selectedId,
      opts.candidates,
      opts.criteria,
      opts.scores,
      opts.winnerReason,
      new Date(),
    );
  }

  static reconstitute(opts: SelectionRationaleReconstituteOptions): SelectionRationale {
    return new SelectionRationale(
      opts.id,
      opts.executionId,
      opts.selectionType,
      opts.selectedId,
      opts.candidates,
      opts.criteria,
      opts.scores,
      opts.winnerReason,
      opts.timestamp,
    );
  }
}
