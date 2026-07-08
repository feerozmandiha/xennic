import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import type { PlanTask, TaskStatus } from '../domain/plan.entity.js';

export interface GoalAnalysis {
  complexity: 'low' | 'medium' | 'high';
  estimatedSteps: number;
  domains: string[];
}

export interface DecomposedTask {
  description: string;
  type: string;
  dependsOn: string[];
}

@Injectable()
export class DecompositionService {
  private readonly logger = new Logger(DecompositionService.name);

  decompose(goal: string, _context?: Record<string, unknown>): PlanTask[] {
    const fragments = this.splitGoal(goal);
    const tasks: PlanTask[] = [];

    for (const fragment of fragments) {
      const task: PlanTask = {
        id: randomUUID(),
        description: fragment.description,
        type: fragment.type,
        status: 'pending' as TaskStatus,
        dependsOn: fragment.dependsOn,
      };
      tasks.push(task);
    }

    this.logger.debug(`Decomposed goal into ${tasks.length} tasks`);
    return tasks;
  }

  analyzeGoal(goal: string): GoalAnalysis {
    const wordCount = goal.split(/\s+/).length;
    const complexity: 'low' | 'medium' | 'high' =
      wordCount < 10 ? 'low' : wordCount < 30 ? 'medium' : 'high';

    const domains = this.extractDomains(goal);
    const estimatedSteps = Math.max(1, Math.ceil(wordCount / 5));

    return { complexity, estimatedSteps, domains };
  }

  suggestNextTasks(goal: string, completed: string[]): string[] {
    const allTasks = this.decompose(goal);
    const completedSet = new Set(completed);

    return allTasks
      .filter(t => !completedSet.has(t.id) && t.dependsOn.every(d => completedSet.has(d)))
      .map(t => t.id);
  }

  private splitGoal(goal: string): DecomposedTask[] {
    const words = goal.split(/\s+/);
    if (words.length <= 3) {
      return [
        { description: goal, type: 'task', dependsOn: [] },
      ];
    }

    const midpoint = Math.ceil(words.length / 2);
    const firstPart = words.slice(0, midpoint).join(' ');
    const secondPart = words.slice(midpoint).join(' ');
    const firstId = randomUUID();

    return [
      { description: `Analyze: ${firstPart}`, type: 'analysis', dependsOn: [] },
      { description: `Plan: ${secondPart}`, type: 'planning', dependsOn: [firstId] },
      { description: `Execute: ${goal}`, type: 'execution', dependsOn: [firstId] },
    ];
  }

  private extractDomains(goal: string): string[] {
    const domainKeywords: Record<string, string[]> = {
      data: ['data', 'database', 'analytics', 'report'],
      infrastructure: ['deploy', 'infrastructure', 'server', 'cloud', 'network'],
      security: ['security', 'auth', 'encrypt', 'permission'],
      integration: ['api', 'integration', 'connect', 'sync'],
    };

    const found: string[] = [];
    const lower = goal.toLowerCase();

    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        found.push(domain);
      }
    }

    return found;
  }
}
