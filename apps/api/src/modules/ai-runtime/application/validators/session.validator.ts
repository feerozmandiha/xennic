import type { AgentSession } from '../../domain/types/session.types.js';

export class SessionValidator {
  validate(session: AgentSession): string[] {
    const errors: string[] = [];

    if (!session.agentId) {
      errors.push('Session must have an agentId');
    }

    if (!session.workspaceId) {
      errors.push('Session must have a workspaceId');
    }

    if (!session.userId) {
      errors.push('Session must have a userId');
    }

    if (session.expiresAt <= session.createdAt) {
      errors.push('Session expiry must be after creation date');
    }

    return errors;
  }

  isActive(session: AgentSession): boolean {
    return !session.isExpired() && session.status !== 'expired';
  }
}
