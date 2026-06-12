import { Injectable } from '@nestjs/common';
import { prisma }     from '@xennic/database';
import { ArticleEntity } from '../../domain/entities/article.entity.js';
import { randomUUID } from 'node:crypto';

@Injectable()
export class ArticlesRepository {

  private _map(r: any): ArticleEntity {
    return new ArticleEntity(
      r.id, r.title, r.title_en ?? r.title, r.slug,
      r.summary ?? '', r.content ?? '',
      r.category ?? 'general', JSON.parse(r.tags ?? '[]'),
      r.status ?? 'published', r.author_id ?? '',
      r.author_name ?? 'تیم Xennic', r.cover_image ?? null,
      r.read_minutes ?? 5, r.view_count ?? 0, r.like_count ?? 0,
      new Date(r.created_at), new Date(r.updated_at),
      r.published_at ? new Date(r.published_at) : null,
    );
  }

  async findAll(opts: {
    page: number; limit: number;
    category?: string; search?: string; status?: string;
  }): Promise<{ data: ArticleEntity[]; total: number }> {
    const { page, limit, category, search, status = 'published' } = opts;
    const offset = (page - 1) * limit;

    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "articles"
        WHERE status = ${status}
          ${category ? prisma.$queryRaw`AND category = ${category}` : prisma.$queryRaw``}
          ${search   ? prisma.$queryRaw`AND (title ILIKE ${'%'+search+'%'} OR summary ILIKE ${'%'+search+'%'})` : prisma.$queryRaw``}
        ORDER BY published_at DESC NULLS LAST, created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
      const [{ count }] = await prisma.$queryRaw<any[]>`
        SELECT COUNT(*) FROM "articles" WHERE status = ${status}
      `;
      return { data: rows.map(r => this._map(r)), total: Number(count) };
    } catch {
      return { data: this._seeds(), total: this._seeds().length };
    }
  }

  async findBySlug(slug: string): Promise<ArticleEntity | null> {
    try {
      const rows = await prisma.$queryRaw<any[]>`
        SELECT * FROM "articles" WHERE slug = ${slug} LIMIT 1
      `;
      if (!rows.length) return this._seeds().find(a => a.slug === slug) ?? null;
      await prisma.$executeRaw`
        UPDATE "articles" SET view_count = view_count + 1 WHERE slug = ${slug}
      `;
      return this._map(rows[0]);
    } catch {
      return this._seeds().find(a => a.slug === slug) ?? null;
    }
  }

  async create(data: Partial<ArticleEntity> & { title: string; content: string; authorId: string }): Promise<ArticleEntity> {
    const id  = randomUUID();
    const now = new Date();
    const slug = data.title.toLowerCase()
      .replace(/[\s\u0600-\u06FF]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-').slice(0, 80) + '-' + Date.now();

    try {
      await prisma.$executeRaw`
        INSERT INTO "articles"
          (id, title, title_en, slug, summary, content, category, tags,
           status, author_id, read_minutes, view_count, like_count, created_at, updated_at, published_at)
        VALUES
          (${id}, ${data.title}, ${data.titleEn ?? data.title}, ${slug},
           ${data.summary ?? ''}, ${data.content}, ${data.category ?? 'general'},
           ${JSON.stringify(data.tags ?? [])}, ${data.status ?? 'draft'},
           ${data.authorId}, ${data.readMinutes ?? 5}, 0, 0, ${now}, ${now},
           ${data.status === 'published' ? now : null})
      `;
    } catch { /* جدول هنوز ساخته نشده — seed mode */ }

    return new ArticleEntity(
      id, data.title, data.titleEn ?? data.title, slug,
      data.summary ?? '', data.content, data.category ?? 'general',
      data.tags ?? [], data.status ?? 'draft', data.authorId,
      data.authorName ?? 'کاربر', null, data.readMinutes ?? 5, 0, 0,
      now, now, data.status === 'published' ? now : null,
    );
  }

  async likeArticle(slug: string): Promise<void> {
    try {
      await prisma.$executeRaw`
        UPDATE "articles" SET like_count = like_count + 1 WHERE slug = ${slug}
      `;
    } catch { /* ignore */ }
  }

  // ── Seed data — نمایش اگر جدول هنوز ساخته نشده ───────────────────────────
  private _seeds(): ArticleEntity[] {
    const now = new Date('2025-01-01');
    return [
      new ArticleEntity(
        '1', 'محاسبه سایز کابل بر اساس IEC 60364', 'Cable Sizing per IEC 60364',
        'cable-sizing-iec-60364',
        'راهنمای جامع انتخاب سطح مقطع کابل با در نظر گرفتن جریان مجاز، افت ولتاژ و اتصال کوتاه',
        `# محاسبه سایز کابل — IEC 60364-5-52

## مقدمه
انتخاب صحیح سطح مقطع کابل یکی از مهم‌ترین مراحل طراحی تأسیسات برقی است.

## مراحل محاسبه

### ۱. جریان بار (Ib)
\`\`\`
Ib = P / (√3 × V × cosφ)    [سه‌فاز]
Ib = P / (V × cosφ)          [تک‌فاز]
\`\`\`

### ۲. جریان مجاز (Iz)
جریان مجاز کابل باید شرط زیر را برآورده کند:
\`\`\`
Iz ≥ In ≥ Ib
\`\`\`

### ۳. ضرایب تصحیح
- **دما**: Ct = √[(T_max - T_amb)/(T_max - T_ref)]
- **گروه‌بندی**: از جدول IEC 60364-5-52 Table B.52.17
- **نوع نصب**: از جدول B.52.1

### ۴. افت ولتاژ
\`\`\`
ΔV% = (√3 × I × L × (R·cosφ + X·sinφ)) / Vn × 100
\`\`\`
حد مجاز: ۴٪ (IEC 60364-5-52)

### ۵. کنترل اتصال کوتاه
\`\`\`
S_min = I_k × √t / k
k = 115 (مس-PVC) | 143 (مس-XLPE)
\`\`\`

## نتیجه‌گیری
از ماژول **CABLE-001** در Xennic برای محاسبه خودکار استفاده کنید.`,
        'cable', ['کابل', 'IEC 60364', 'سایزینگ', 'افت ولتاژ'], 'published',
        'system', 'تیم Xennic', null, 8, 245, 34, now, now, now,
      ),
      new ArticleEntity(
        '2', 'آنالیز هارمونیک و کیفیت توان — IEEE 519', 'Harmonic Analysis — IEEE 519-2022',
        'harmonic-analysis-ieee-519',
        'بررسی کامل THD، TDD و حدود مجاز استاندارد IEEE 519-2022 برای سیستم‌های قدرت',
        `# آنالیز هارمونیک — IEEE 519-2022

## تعریف هارمونیک
هارمونیک‌ها اجزای فرکانسی چندگانه فرکانس اصلی هستند که توسط بارهای غیرخطی تولید می‌شوند.

## شاخص‌های کیفیت توان

### THD (Total Harmonic Distortion)
\`\`\`
THD_I = √(ΣIₙ²) / I₁ × 100%    n = 2, 3, 4, ...
\`\`\`

### TDD (Total Demand Distortion)
\`\`\`
TDD = √(ΣIₙ²) / IL × 100%
\`\`\`
IL = جریان تقاضای بار در نقطه اتصال مشترک (PCC)

## حدود مجاز IEEE 519-2022

| نسبت Isc/IL | THD_I (%) |
|---|---|
| <20 | 5.0 |
| 20–50 | 8.0 |
| 50–100 | 12.0 |
| >1000 | 20.0 |

## راه‌حل‌ها
1. **فیلتر پسیو**: ارزان، اما تنظیم ثابت
2. **فیلتر فعال (APF)**: انعطاف‌پذیر، هزینه بالاتر
3. **درایو VFD با فیلتر ورودی**: موثر برای موتورها

از ماژول **PQ-001** (THD) و **PQ-005** (Passive Filter) استفاده کنید.`,
        'power_quality', ['هارمونیک', 'THD', 'TDD', 'IEEE 519', 'کیفیت توان'], 'published',
        'system', 'تیم Xennic', null, 10, 189, 27, now, now, now,
      ),
      new ArticleEntity(
        '3', 'طراحی سیستم زمین الکتریکی — IEC 60364-5-54', 'Grounding System Design',
        'grounding-design-iec-60364',
        'اصول طراحی سیستم زمین، انواع سیستم‌های زمین TN/TT/IT و محاسبه مقاومت الکترود',
        `# طراحی سیستم زمین — IEC 60364-5-54

## اهمیت سیستم زمین
سیستم زمین مناسب تضمین می‌کند:
- ایمنی افراد در برابر برق‌گرفتگی
- حفاظت تجهیزات
- عملکرد صحیح حفاظت

## انواع سیستم‌های زمین

### TN-S (جداگانه)
- هادی PE و N جداگانه در سراسر سیستم
- بهترین گزینه برای تأسیسات جدید

### TN-C-S (ترکیبی)
- PEN مشترک تا یک نقطه، سپس جداگانه
- رایج در ساختمان‌های مسکونی ایران

### TT (زمین مستقل)
- نوترال از شبکه، PE از زمین محلی
- الزامی با RCD

### IT (ایزوله)
- بدون اتصال مستقیم به زمین
- بیمارستان، معدن

## محاسبه مقاومت میل‌زمین

فرمول Dwight:
\`\`\`
R = (ρ/2πL) × [ln(4L/d) - 1]
ρ = مقاومت ویژه خاک (Ω·m)
L = طول میل (m)
d = قطر میل (m)
\`\`\`

## حدود مجاز
- مصارف عمومی: R ≤ 10 Ω
- مراکز حساس: R ≤ 1 Ω
- صاعقه‌گیر: R ≤ 10 Ω

از ماژول **GND-001** برای محاسبه خودکار استفاده کنید.`,
        'grounding', ['زمین', 'IEC 60364', 'TN-S', 'TT', 'میل‌زمین'], 'published',
        'system', 'تیم Xennic', null, 12, 156, 21, now, now, now,
      ),
    ];
  }
}
