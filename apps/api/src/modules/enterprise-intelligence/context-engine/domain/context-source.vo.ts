export class ContextSource {
  public readonly name: string;
  public readonly priority: number;
  public readonly ttl: number;
  public readonly optional: boolean;

  constructor(name: string, priority: number, ttl: number, optional = true) {
    this.name = name;
    this.priority = priority;
    this.ttl = ttl;
    this.optional = optional;
  }
}
