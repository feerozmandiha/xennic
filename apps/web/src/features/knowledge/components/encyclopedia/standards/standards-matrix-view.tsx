'use client';

import { useState } from 'react';
import { BookOpen, Filter, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { STANDARDS_REGISTRY, StandardDef } from '@/features/knowledge/lib/standards-data';
import { StandardBadge } from './standard-badge';

const CATEGORY_LABEL: Record<string, string> = {
  foundation: 'الکتریک پایه',
  cable: 'کابل',
  transformer: 'ترانسفورماتور',
  short_circuit: 'اتصال کوتاه',
  grounding: 'زمین',
  protection: 'حفاظت',
  motor: 'موتور',
  power_quality: 'کیفیت توان',
};

export function StandardsMatrixView({
  onSelectStandard,
}: {
  onSelectStandard?: (s: StandardDef) => void;
}) {
  const [search, setSearch] = useState('');
  const [orgFilter, setOrgFilter] = useState<string>('all');
  const [catFilter, setCatFilter] = useState<string>('all');

  const filtered = STANDARDS_REGISTRY.filter((s) => {
    const matchSearch =
      !search ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.titleFa.includes(search) ||
      s.titleEn.toLowerCase().includes(search.toLowerCase());
    const matchOrg = orgFilter === 'all' || s.organization === orgFilter;
    const matchCat = catFilter === 'all' || s.category.includes(catFilter);
    return matchSearch && matchOrg && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-gradient-to-br from-primary/5 to-accent/5 p-5">
        <h3 className="font-bold text-base flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          ماتریس استانداردهای مهندسی برق
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          نگاشت محاسبات، تجهیزات و مقالات به استانداردهای IEC / IEEE / NEC
        </p>
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو: IEC 60364, IEEE 80, ترانسفورماتور..."
              className="w-full h-9 pr-9 pl-3 rounded-xl border bg-background/80 text-sm outline-none"
            />
          </div>
          <select
            value={orgFilter}
            onChange={(e) => setOrgFilter(e.target.value)}
            className="h-9 rounded-xl border bg-background px-3 text-sm"
          >
            <option value="all">همه سازمان‌ها</option>
            <option value="IEC">IEC</option>
            <option value="IEEE">IEEE</option>
            <option value="NEC">NEC</option>
            <option value="NEMA">NEMA</option>
          </select>
          <select
            value={catFilter}
            onChange={(e) => setCatFilter(e.target.value)}
            className="h-9 rounded-xl border bg-background px-3 text-sm"
          >
            <option value="all">همه دسته‌ها</option>
            {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((std) => (
          <Card
            key={std.code}
            className="hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
            onClick={() => onSelectStandard?.(std)}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <StandardBadge code={std.code} organization={std.organization} size="sm" />
                  <span className="text-xs text-muted-foreground font-normal">
                    {std.year ?? ''}
                  </span>
                </span>
                <Badge variant="outline" className="text-[10px]">
                  {std.organization}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <h4 className="font-semibold text-sm leading-tight group-hover:text-primary">
                {std.titleFa}
              </h4>
              <p className="text-[11px] text-muted-foreground line-clamp-2">{std.descriptionFa}</p>
              <div className="flex flex-wrap gap-1">
                {std.category.map((cat) => (
                  <Badge key={cat} variant="secondary" className="text-[10px]">
                    {CATEGORY_LABEL[cat] ?? cat}
                  </Badge>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Filter className="h-3 w-3" />
                {std.relatedCalculations.length} محاسبه مرتبط
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-10 text-sm text-muted-foreground">استانداردی یافت نشد</div>
      )}
    </div>
  );
}
