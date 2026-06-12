import { ToastContainer } from '@/components/providers/toast-provider';

// layout مستقل برای پنل ادمین — بدون Sidebar و Topbar داشبورد
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[hsl(var(--background))]">
      {children}
      <ToastContainer />
    </div>
  );
}
