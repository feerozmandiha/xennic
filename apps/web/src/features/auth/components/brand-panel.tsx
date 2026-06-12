import { getTranslations } from 'next-intl/server';

export async function BrandPanel() {
  const t = await getTranslations('auth');

  const features = [
    { icon: '⚡', text: t('feature1') },
    { icon: '🤖', text: t('feature2') },
    { icon: '☀️', text: t('feature3') },
    { icon: '📊', text: t('feature4') },
  ];

  return (
    <div className="hidden lg:flex w-[45%] shrink-0 flex-col justify-between p-10 bg-[hsl(var(--sidebar))] text-[hsl(var(--sidebar-foreground))]">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-[var(--radius)] bg-[hsl(var(--primary))] flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-sm">X</span>
        </div>
        <span className="text-lg font-bold">Xennic</span>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold leading-relaxed whitespace-pre-line">
          {t('brandTitle')}
        </h2>
        <ul className="space-y-5">
          {features.map((item) => (
            <li key={item.text} className="flex items-start gap-3 text-sm opacity-80">
              <span className="text-xl leading-none mt-0.5 shrink-0">{item.icon}</span>
              <span className="leading-relaxed">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <p className="text-[11px] opacity-30">
        © 2026 Xennic Platform — All rights reserved
      </p>
    </div>
  );
}
