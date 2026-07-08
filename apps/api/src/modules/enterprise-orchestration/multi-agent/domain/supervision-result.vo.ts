export class SupervisionResult {
  public readonly taskId: string;
  public readonly supervisorId: string;
  public readonly approved: boolean;
  public readonly feedback: string | null;
  public readonly confidence: number;
  public readonly timestamp: Date;

  private constructor(
    taskId: string,
    supervisorId: string,
    approved: boolean,
    feedback: string | null,
    confidence: number,
    timestamp: Date,
  ) {
    this.taskId = taskId;
    this.supervisorId = supervisorId;
    this.approved = approved;
    this.feedback = feedback;
    this.confidence = confidence;
    this.timestamp = timestamp;
  }

  static create(
    taskId: string,
    supervisorId: string,
    approved: boolean,
    feedback: string | null,
    confidence: number,
  ): SupervisionResult {
    return new SupervisionResult(taskId, supervisorId, approved, feedback, confidence, new Date());
  }
}
