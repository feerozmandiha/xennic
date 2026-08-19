import { CmsHeader } from '@/features/cms/components/cms-header';
import { CmsFooter } from '@/features/cms/components/cms-footer';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      <CmsHeader />
      <main className="pt-16">{children}</main>
      <CmsFooter />
    </div>
  );
}
