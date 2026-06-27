// ============================================================
// ADMIN LAYOUT - Sidebar + Header
// ============================================================

import { requireAdmin } from "@/lib/auth/helpers";
import AdminSidebar from "@/components/admin/sidebar";
import AdminHeader from "@/components/admin/header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireAdmin();

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[280px]">
        <AdminHeader user={user} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
