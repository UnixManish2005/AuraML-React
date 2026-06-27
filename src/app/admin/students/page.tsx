// ============================================================
// ADMIN STUDENTS PAGE
// ============================================================

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/helpers";
import StudentsTable from "@/components/admin/students-table";

async function getStudents() {
  return db.user.findMany({
    where: { role: "STUDENT" },
    include: {
      studentProfile: {
        include: { batchStudents: { include: { batch: { select: { name: true } } } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export const metadata = { title: "Students" };

export default async function StudentsPage() {
  await requireAdmin();
  const students = await getStudents();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Students</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all enrolled students</p>
        </div>
      </div>
      <StudentsTable students={students} />
    </div>
  );
}
