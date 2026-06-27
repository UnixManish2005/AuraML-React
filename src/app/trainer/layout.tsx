// ============================================================
// TRAINER LAYOUT
// ============================================================
// File: src/app/trainer/layout.tsx

import { requireTrainer } from "@/lib/auth/helpers";
import TrainerSidebar from "@/components/trainer/sidebar";
import AdminHeader from "@/components/admin/header";

export default async function TrainerLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTrainer();
  return (
    <div className="min-h-screen bg-background flex">
      <TrainerSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
        <AdminHeader user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
