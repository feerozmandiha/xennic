import { Injectable } from '@nestjs/common';
import { prisma } from '@xennic/database';
import { CommentEntity } from '../../domain/entities/comment.entity.js';
import * as crypto from 'crypto';

@Injectable()
export class CommentsRepository {
  private map(r: any): CommentEntity {
    return new CommentEntity(
      r.id, r.article_id, r.user_id,
      r.author_name ?? 'کاربر',
      r.author_avatar ?? null,
      r.content, r.parent_id ?? null,
      r.likes ?? 0,
      typeof r.liked_by === 'string' ? JSON.parse(r.liked_by) : (r.liked_by ?? []),
      r.is_edited ?? false,
      new Date(r.created_at), new Date(r.updated_at),
    );
  }

  async findByArticle(articleId: string): Promise<CommentEntity[]> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT c.*,
          u.first_name || ' ' || u.last_name AS author_name,
          u.avatar_file_id AS author_avatar
        FROM article_comments c
        JOIN users u ON u.id = c.user_id
        WHERE c.article_id = ${articleId} AND c.deleted_at IS NULL
        ORDER BY c.created_at ASC
      `;
      return rows.map(r => this.map(r));
    } catch {
      return [];
    }
  }

  async findById(id: string): Promise<CommentEntity | null> {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT c.*,
        u.first_name || ' ' || u.last_name AS author_name,
        u.avatar_file_id AS author_avatar
      FROM article_comments c
      JOIN users u ON u.id = c.user_id
      WHERE c.id = ${id} AND c.deleted_at IS NULL
      LIMIT 1
    `;
    return rows.length ? this.map(rows[0]) : null;
  }

  async create(data: {
    articleId: string; userId: string; content: string; parentId?: string | null;
  }): Promise<CommentEntity> {
    const id = crypto.randomUUID();
    await prisma.$executeRaw`
      INSERT INTO article_comments (id, article_id, user_id, parent_id, content)
      VALUES (${id}, ${data.articleId}, ${data.userId}, ${data.parentId ?? null}, ${data.content})
    `;
    return (await this.findById(id))!;
  }

  async update(id: string, content: string): Promise<CommentEntity> {
    await prisma.$executeRaw`
      UPDATE article_comments SET content = ${content}, is_edited = true, updated_at = NOW()
      WHERE id = ${id}
    `;
    return (await this.findById(id))!;
  }

  async softDelete(id: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE article_comments SET deleted_at = NOW() WHERE id = ${id}
    `;
  }

  async toggleLike(id: string, userId: string): Promise<{ likes: number; liked: boolean }> {
    const comment = await this.findById(id);
    if (!comment) throw new Error('Comment not found');

    const likedBy = comment.likedBy;
    const index = likedBy.indexOf(userId);
    let liked: boolean;

    if (index > -1) {
      likedBy.splice(index, 1);
      liked = false;
    } else {
      likedBy.push(userId);
      liked = true;
    }

    await prisma.$executeRaw`
      UPDATE article_comments
      SET likes = ${likedBy.length}, liked_by = ${JSON.stringify(likedBy)}::json
      WHERE id = ${id}
    `;

    return { likes: likedBy.length, liked };
  }
}
