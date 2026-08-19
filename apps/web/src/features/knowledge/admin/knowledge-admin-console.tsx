'use client';

import { useState } from 'react';
import { BookOpen, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KnowledgeClient } from '../components/knowledge-client';
import { KnowledgeIntelligenceDashboard } from './knowledge-intelligence-dashboard';

type AdminTab = 'articles' | 'intelligence';

const TABS: Array<{
  id: AdminTab;
  label: string;
  description: string;
  icon: typeof BookOpen;
}> = [
  {
    id: 'articles',
    label: 'مقالات',
    description: 'تولید و مدیریت محتوای دانشنامه',
    icon: BookOpen,
  },
  {
    id: 'intelligence',
    label: 'هوش دانش',
    description: 'کیفیت، ارتباطات و سلامت گراف دانش',
    icon: BrainCircuit,
  },
];

export function KnowledgeAdminConsole() {
  const [activeTab, setActiveTab] = useState<AdminTab>('articles');

  return (
    <div>
      <div
        role="tablist"
        aria-label="بخش‌های مدیریت دانشنامه"
        className="mb-6 grid w-full max-w-2xl grid-cols-2 gap-1 rounded-[var(--radius-lg)] border border-[hsl(var(--border))] bg-[hsl(var(--secondary)/0.5)] p-1"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`knowledge-${tab.id}-panel`}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex min-w-0 items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-start transition-all',
                selected
                  ? 'bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-[var(--shadow-xs)]'
                  : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius)]',
                  selected
                    ? 'bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                    : 'bg-[hsl(var(--muted)/0.6)]',
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold">{tab.label}</span>
                <span className="hidden truncate text-[11px] text-[hsl(var(--muted-foreground))] sm:block">
                  {tab.description}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <section
        id={`knowledge-${activeTab}-panel`}
        role="tabpanel"
        aria-label={TABS.find((tab) => tab.id === activeTab)?.label}
      >
        {activeTab === 'articles' ? <KnowledgeClient /> : <KnowledgeIntelligenceDashboard />}
      </section>
    </div>
  );
}
