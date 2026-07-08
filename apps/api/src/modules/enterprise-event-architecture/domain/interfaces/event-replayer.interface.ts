export const IEVENT_REPLAYER = 'IEventReplayer' as const;

export interface ReplayRequest {
  eventType?: string;
  correlationId?: string;
  workspaceId?: string;
  fromDate?: string;
  toDate?: string;
  maxEvents?: number;
}

export interface ReplayResult {
  replayedCount: number;
  failedCount: number;
  errors: Array<{ eventId: string; error: string }>;
  durationMs: number;
}

export interface IEventReplayer {
  replay(request: ReplayRequest): Promise<ReplayResult>;
  getReplayHistory(limit?: number): Promise<ReplayHistoryEntry[]>;
}

export interface ReplayHistoryEntry {
  id: string;
  request: ReplayRequest;
  result: ReplayResult;
  triggeredBy: string;
  timestamp: string;
}
