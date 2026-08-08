'use client';

import { useState } from 'react';
import { Search, Cpu, Zap, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  EQUIPMENT_REGISTRY,
  EQUIPMENT_CATEGORIES,
  EquipmentDef,
} from '@/features/knowledge/lib/equipment-registry';
import { StandardBadge } from '../standards/standard-badge';

export function EquipmentDirectory({
  onSelectEquipment,
}: {
  onSelectEquipment?: (eq: EquipmentDef) => void;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');

  const filtered = EQUIPMENT_REGISTRY.filter((eq) => {
    const matchSearch =
      !search ||
      eq.nameFa.includes(search) ||
      eq.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      eq.tags.some((t) => t.includes(search));
    const matchCat = category === 'all' || eq.category === category;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="جستجوی تجهیزات... مثل ترانسفورماتور، کابل"
            className="w-full h-10 pr-10 pl-3 rounded-xl border bg-background text-sm outline-none focus:border-primary"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="h-10 rounded-xl border bg-background px-3 text-sm"
        >
          <option value="all">همه دسته‌ها</option>
          {Object.entries(EQUIPMENT_CATEGORIES).map(([key, cat]) => (
            <option key={key} value={key}>
              {cat.icon} {cat.fa}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((eq) => (
          <Card
            key={eq.id}
            className="hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => onSelectEquipment?.(eq)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-lg group-hover:bg-primary/10 transition-colors">
                  {eq.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                    {eq.nameFa}
                  </h4>
                  <p className="text-[11px] text-muted-foreground">{eq.nameEn}</p>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {eq.descriptionFa}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {eq.standards.slice(0, 2).map((code) => (
                      <StandardBadge key={code} code={code} size="xs" />
                    ))}
                    {eq.standards.length > 2 && (
                      <Badge variant="secondary" className="text-[10px]">
                        +{eq.standards.length - 2}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-muted-foreground">
                    <Settings className="h-3 w-3" />
                    {eq.calculations.length} محاسبه
                    <span className="mx-1">·</span>
                    <Cpu className="h-3 w-3" />
                    {EQUIPMENT_CATEGORIES[eq.category].fa}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-sm text-muted-foreground">
          <Zap className="h-8 w-8 mx-auto opacity-20 mb-2" />
          تجهیزاتی با این فیلتر یافت نشد
        </div>
      )}
    </div>
  );
}
