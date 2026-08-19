'use client';

import { useState } from 'react';
<<<<<<< ours
import { BookOpen, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KnowledgeClient } from '../components/knowledge-client';
import { KnowledgeIntelligenceDashboard } from './knowledge-intelligence-dashboard';

type AdminTab = 'articles' | 'intelligence';

const TABS: Array<{
  id: AdminTab;
  label: string;
=======
import {
  Activity,
  BookOpen,
  Boxes,
  BrainCircuit,
  FileText,
  FolderTree,
  Network,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { KnowledgeClient } from '../components/knowledge-client';
import { KnowledgeIntelligenceDashboard } from './knowledge-intelligence-dashboard';
import { KnowledgeGraphExplorer } from './knowledge-graph-explorer';
import { KnowledgeClusterWorkbench } from './knowledge-cluster-workbench';
import { KnowledgeOntologyWorkspace } from './knowledge-ontology-workspace';

type KnowledgeArea = 'articles' | 'quality' | 'graph' | 'clusters' | 'ontology';

const areas: Array<{
  id: KnowledgeArea;
  title: string;
  shortTitle: string;
>>>>>>> theirs
  description: string;
  icon: typeof BookOpen;
}> = [
  {
    id: 'articles',
<<<<<<< ours
    label: 'مقالات',
    description: 'تولید و مدیریت محتوای دانشنامه',
    icon: BookOpen,
  },
  {
    id: 'intelligence',
    label: 'هوش دانش',
    description: 'کیفیت، ارتباطات و سلامت گراف دانش',
    icon: BrainCircuit,
=======
    title: 'محتوا و چرخه انتشار',
    shortTitle: 'محتوا',
    description: 'مقاله‌ها، بازبینی، نسخه‌ها، طبقه‌بندی و استانداردها',
    icon: FileText,
  },
  {
    id: 'quality',
    title: 'کیفیت و سنجه‌ها',
    shortTitle: 'کیفیت',
    description: 'کامل‌بودن، تازگی، اعتماد، اعتبار و پیوستگی',
    icon: Activity,
  },
  {
    id: 'graph',
    title: 'کاوشگر گراف',
    shortTitle: 'گراف',
    description: 'جست‌وجو، مسیرها، منشأ، ارجاع‌ها، وابستگی و تعارض',
    icon: Network,
  },
  {
    id: 'clusters',
    title: 'خوشه‌ها و تکرار',
    shortTitle: 'خوشه‌ها',
    description: 'گروه‌بندی معنایی و تحلیل محتوای تکراری',
    icon: Boxes,
  },
  {
    id: 'ontology',
    title: 'هستی‌شناسی و دامنه',
    shortTitle: 'هستی‌شناسی',
    description: 'دفتر مدل‌های مفهومی، سلسله‌مراتب و طبقه‌بندی گره',
    icon: FolderTree,
>>>>>>> theirs
  },
];

export function KnowledgeAdminConsole() {
<<<<<<< ours
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
=======
  const [activeArea, setActiveArea] = useState<KnowledgeArea>('articles');
  const currentArea = areas.find((area) => area.id === activeArea) ?? areas[0];
  const CurrentAreaIcon = currentArea.icon;

  return (
    <div className="min-h-screen bg-muted/20" dir="rtl">
      <div className="border-b bg-background">
        <div className="container mx-auto max-w-[1600px] px-4 py-6 lg:px-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-600/15">
                <BrainCircuit className="size-6" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">مرکز دانش</h1>
                  <Badge variant="secondary" className="gap-1.5">
                    <span className="size-1.5 rounded-full bg-emerald-500" />
                    فضای کاری ایزوله
                  </Badge>
                </div>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  محیط یکپارچه مدیریت محتوا و هوشمندی معنایی؛ از نگارش و انتشار تا ردیابی منشأ، سنجش
                  کیفیت و سازمان‌دهی دانش دامنه.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                دسترسی مبتنی بر مجوز
              </span>
              <span className="flex items-center gap-1.5 rounded-full border bg-background px-3 py-1.5">
                <Sparkles className="size-3.5 text-violet-600" />
                تحلیل معنایی فعال
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-20 border-b bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <nav
          className="container mx-auto flex max-w-[1600px] gap-1 overflow-x-auto px-4 py-2 lg:px-6"
          aria-label="بخش‌های مرکز دانش"
        >
          {areas.map((area) => {
            const Icon = area.icon;
            const active = area.id === activeArea;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => setActiveArea(area.id)}
                className={`group min-w-max rounded-xl px-3 py-2.5 text-start transition sm:px-4 ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <Icon className="size-4" />
                  <span className="sm:hidden">{area.shortTitle}</span>
                  <span className="hidden sm:inline">{area.title}</span>
                </span>
                <span
                  className={`mt-1 hidden text-[11px] lg:block ${active ? 'text-primary-foreground/75' : 'text-muted-foreground'}`}
                >
                  {area.description}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <main className="container mx-auto max-w-[1600px] px-4 py-5 lg:px-6 lg:py-7">
        <div className="mb-5 flex items-center gap-3 lg:hidden">
          <CurrentAreaIcon className="size-5 text-primary" />
          <div>
            <h2 className="font-bold">{currentArea.title}</h2>
            <p className="text-xs text-muted-foreground">{currentArea.description}</p>
          </div>
        </div>

        {activeArea === 'articles' ? <KnowledgeClient /> : null}
        {activeArea === 'quality' ? <KnowledgeIntelligenceDashboard /> : null}
        {activeArea === 'graph' ? <KnowledgeGraphExplorer /> : null}
        {activeArea === 'clusters' ? <KnowledgeClusterWorkbench /> : null}
        {activeArea === 'ontology' ? <KnowledgeOntologyWorkspace /> : null}
      </main>
>>>>>>> theirs
    </div>
  );
}
