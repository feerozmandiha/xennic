export interface JwtPayload {
  sub: string;        // user_id
  email: string;
  workspaceId?: string;
  roles: string[];
  iat?: number;
  exp?: number;
}

export class JwtPayloadVO {
  private constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly workspaceId: string | undefined,
    public readonly roles: string[],
  ) {}

  static create(userId: string, email: string, roles: string[] = [], workspaceId?: string): JwtPayloadVO {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required for JWT payload');
    }
    if (!email || !email.includes('@')) {
      throw new Error('Valid email is required for JWT payload');
    }
    return new JwtPayloadVO(userId, email, workspaceId, roles);
  }

  toJSON(): JwtPayload {
    return {
      sub: this.userId,
      email: this.email,
      workspaceId: this.workspaceId,
      roles: this.roles,
    };
  }
}