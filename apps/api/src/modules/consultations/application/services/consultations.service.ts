import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ConsultationsRepository } from '../../infrastructure/repositories/consultations.repository.js';
import { LlmProvider }             from '../../../ai/infrastructure/providers/llm.provider.js';
import { SubscriptionService }     from '../../../subscription/application/services/subscription.service.js';

@Injectable()
export class ConsultationsService {
  constructor(
    private readonly repo: ConsultationsRepository,
    private readonly llm:  LlmProvider,
    private readonly subscriptionService: SubscriptionService,
  ) {}

  async findAll(workspaceId: string, page = 1, limit = 20, status?: string) {
    return this.repo.findByWorkspace(workspaceId, page, limit, status);
  }

  async findById(id: string) {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('مشاوره یافت نشد');
    return c;
  }

  async create(workspaceId: string, userId: string, userName: string, dto: {
    title: string; description: string;
    category: string; priority?: string; tags?: string[];
  }) {
    // plan check — only Pro/Enterprise can create consultations
    const planSlug = await this.subscriptionService.getActivePlanSlug(workspaceId);
    if (planSlug === 'free') {
      throw new ForbiddenException('ارسال مشاوره نیاز به پلن Pro دارد');
    }

    return this.repo.create({
      workspaceId, userId, userName,
      title:       dto.title,
      description: dto.description,
      category:    dto.category,
      priority:    dto.priority ?? 'normal',
      tags:        dto.tags    ?? [],
    });
  }

  // پاسخ خودکار با Groq AI
  async aiAutoReply(id: string): Promise<string> {
    const c = await this.findById(id);
    const prompt = `سوال مهندسی برق:
عنوان: ${c.title}
توضیحات: ${c.description}
دسته‌بندی: ${c.category}

لطفاً پاسخ تخصصی مهندسی برق با ذکر استانداردهای مرتبط (IEC/IEEE) ارائه دهید.`;

    const resp = await this.llm.chat([{ role: 'user', content: prompt }]);
    await this.repo.addReply(id, {
      authorId:   'ai-assistant',
      authorName: 'Xennic AI',
      isExpert:   true,
      content:    resp.content,
    });
    return resp.content;
  }

  async addReply(id: string, userId: string, userName: string, content: string, isExpert = false) {
    const c = await this.repo.findById(id);
    if (!c) throw new NotFoundException('مشاوره یافت نشد');
    return this.repo.addReply(id, { authorId: userId, authorName: userName, isExpert, content });
  }

  async updateStatus(id: string, status: string) {
    await this.repo.updateStatus(id, status);
    return { success: true };
  }
}
