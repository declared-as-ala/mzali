import Sidebar from '@/components/admin/Sidebar';
import { ToastProvider } from '@/components/admin/Toast';

export const dynamic = 'force-dynamic';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </ToastProvider>
  );
}
