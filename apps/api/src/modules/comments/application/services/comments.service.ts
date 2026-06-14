import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { CommentsRepository } from '../../infrastructure/repositories/comments.repository.js';
import { CommentEntity } from '../../domain/entities/comment.entity.js';

@Injectable()
export class CommentsService {
  constructor(private readonly repo: CommentsRepository) {}

  async findByArticle(articleId: string): Promise<CommentEntity[]> {
    const comments = await this.repo.findByArticle(articleId);
    return this.buildTree(comments);
  }

  async create(dto: {
    articleId: string; userId: string; content: string; parentId?: string | null;
  }): Promise<CommentEntity> {
    if (dto.parentId) {
      const parent = await this.repo.findById(dto.parentId);
      if (!parent || parent.articleId !== dto.articleId) {
        throw new NotFoundException('نظر والد یافت نشد');
      }
    }
    return this.repo.create(dto);
  }

  async update(id: string, userId: string, content: string): Promise<CommentEntity> {
    const comment = await this.repo.findById(id);
    if (!comment) throw new NotFoundException('نظر یافت نشد');
    if (comment.userId !== userId) throw new ForbiddenException('شما نمی‌توانید نظر دیگران را ویرایش کنید');
    return this.repo.update(id, content);
  }

  async delete(id: string, userId: string, isAdmin: boolean): Promise<void> {
    const comment = await this.repo.findById(id);
    if (!comment) throw new NotFoundException('نظر یافت نشد');
    if (comment.userId !== userId && !isAdmin) {
      throw new ForbiddenException('شما نمی‌توانید نظر دیگران را حذف کنید');
    }
    await this.repo.softDelete(id);
  }

  async toggleLike(id: string, userId: string): Promise<{ likes: number; liked: boolean }> {
    const comment = await this.repo.findById(id);
    if (!comment) throw new NotFoundException('نظر یافت نشد');
    return this.repo.toggleLike(id, userId);
  }

  private buildTree(comments: CommentEntity[]): CommentEntity[] {
    const map = new Map<string, CommentEntity>();
    const roots: CommentEntity[] = [];

    for (const c of comments) {
      map.set(c.id, c);
      c.replies = [];
    }

    for (const c of comments) {
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.replies!.push(c);
      } else {
        roots.push(c);
      }
    }

    return roots;
  }
}
