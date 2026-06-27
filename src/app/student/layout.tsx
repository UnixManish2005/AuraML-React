// ============================================================
// STUDENT PORTAL LAYOUT
// ============================================================

import { requireRole } from "@/lib/auth/helpers";
import StudentSidebar from "@/components/student/sidebar";
import StudentHeader from "@/components/student/header";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("STUDENT");

  return (
    <div className="min-h-screen bg-background flex">
      <StudentSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0 lg:ml-[260px]">
        <StudentHeader user={user} />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
