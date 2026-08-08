// Root layout — باید html و body داشته باشد (Next.js requirement)
// locale layout اصلی در app/[locale]/layout.tsx است ولی html/body را اینجا نگه می‌داریم
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="min-h-screen bg-[hsl(var(--background))] font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
