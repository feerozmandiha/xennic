export type ArticleStatus = 'draft' | 'published' | 'archived';
export type ArticleCategory =
  | 'cable' | 'transformer' | 'protection' | 'power_quality'
  | 'renewable' | 'grounding' | 'motor' | 'general';

export class ArticleEntity {
  constructor(
    public readonly id:          string,
    public          title:       string,
    public          titleEn:     string,
    public          slug:        string,
    public          summary:     string,
    public          content:     string,
    public          category:    ArticleCategory,
    public          tags:        string[],
    public          status:      ArticleStatus,
    public          authorId:    string,
    public          authorName:  string,
    public          coverImage:  string | null,
    public          readMinutes: number,
    public          viewCount:   number,
    public          likeCount:   number,
    public readonly createdAt:   Date,
    public          updatedAt:   Date,
    public          publishedAt: Date | null,
  ) {}
}
