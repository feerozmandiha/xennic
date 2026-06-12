// Root layout — فقط برای import CSS جهانی
// locale layout اصلی در app/[locale]/layout.tsx است
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
