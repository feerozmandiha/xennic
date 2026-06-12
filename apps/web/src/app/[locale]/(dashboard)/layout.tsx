import { Sidebar }        from '@/components/layout/sidebar';
import { Topbar }         from '@/components/layout/topbar';
import { AuthGuard }      from '@/components/layout/auth-guard';
import { ToastContainer } from '@/components/providers/toast-provider';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex h-dvh overflow-hidden bg-[hsl(var(--background))]">
        <Sidebar />

        <div className="flex flex-col flex-1 overflow-hidden min-w-0">
          <Topbar />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-7xl p-4 lg:p-6">
              {children}
            </div>
          </main>
        </div>
      </div>

      <ToastContainer />
    </AuthGuard>
  );
}
