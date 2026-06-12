import { Injectable, NotFoundException } from '@nestjs/common';
import { ArticlesRepository } from '../../infrastructure/repositories/articles.repository.js';

@Injectable()
export class ArticlesService {
  constructor(private readonly repo: ArticlesRepository) {}

  async findAll(opts: { page: number; limit: number; category?: string; search?: string }) {
    return this.repo.findAll({ ...opts, status: 'published' });
  }

  async findBySlug(slug: string) {
    const article = await this.repo.findBySlug(slug);
    if (!article) throw new NotFoundException(`مقاله "${slug}" یافت نشد`);
    return article;
  }

  async create(data: any, userId: string) {
    return this.repo.create({ ...data, authorId: userId });
  }

  async like(slug: string) {
    await this.repo.likeArticle(slug);
    return { success: true };
  }
}
