export class CommentEntity {
  constructor(
    public readonly id: string,
    public readonly articleId: string,
    public readonly userId: string,
    public readonly authorName: string,
    public readonly authorAvatar: string | null,
    public readonly content: string,
    public readonly parentId: string | null,
    public readonly likes: number,
    public readonly likedBy: string[],
    public readonly isEdited: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public replies?: CommentEntity[],
  ) {}
}
