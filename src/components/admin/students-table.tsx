// ============================================================
// STUDENTS TABLE - Full CRUD
// ============================================================

"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Upload, MoreHorizontal, Edit, Trash2, Ban, UserCheck, Download } from "lucide-react";
import { toast } from "sonner";
import { formatDate, initials, getUserStatusColor, cn } from "@/lib/utils";
import AddStudentModal from "./add-student-modal";

interface Student {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  studentProfile: {
    college: string | null;
    totalPoints: number;
    batchStudents: Array<{ batch: { name: string } }>;
  } | null;
}

interface StudentsTableProps {
  students: Student[];
}

export default function StudentsTable({ students: initialStudents }: StudentsTableProps) {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [addOpen, setAddOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = useMemo(() =>
    students.filter((s) => {
      const matchSearch = !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
      return matchSearch && matchStatus;
    }),
    [students, search, statusFilter]
  );

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  async function handleStatusChange(id: string, status: string) {
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status } : s));
      toast.success(`Student ${status.toLowerCase()}`);
    } catch {
      toast.error("Action failed");
    }
    setOpenMenu(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this student? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setStudents((prev) => prev.filter((s) => s.id !== id));
      toast.success("Student deleted");
    } catch {
      toast.error("Delete failed");
    }
    setOpenMenu(null);
  }

  function exportCSV() {
    const rows = [
      ["Name", "Email", "Phone", "College", "Status", "Points", "Batch", "Enrolled"],
      ...filtered.map((s) => [
        s.name || "", s.email, s.phone || "",
        s.studentProfile?.college || "",
        s.status,
        s.studentProfile?.totalPoints || 0,
        s.studentProfile?.batchStudents?.[0]?.batch?.name || "",
        formatDate(s.createdAt),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "students.csv"; a.click();
  }

  return (
    <div className="bg-card border border-border rounded-xl">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-4 border-b border-border">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="SUSPENDED">Suspended</option>
        </select>

        <div className="ml-auto flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <Upload className="w-4 h-4" /> Import
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 px-4 py-2 text-xs text-muted-foreground border-b border-border bg-muted/20">
        <span>{filtered.length} total students</span>
        <span className="text-emerald-500">{students.filter((s) => s.status === "ACTIVE").length} active</span>
        <span className="text-red-500">{students.filter((s) => s.status === "SUSPENDED").length} suspended</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                <input type="checkbox" className="rounded" onChange={(e) => {
                  setSelected(e.target.checked ? paginated.map((s) => s.id) : []);
                }} />
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Student</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">College</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Batch</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Points</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Enrolled</th>
              <th className="w-12 px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground text-sm">
                  No students found
                </td>
              </tr>
            ) : (
              paginated.map((student) => (
                <tr key={student.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded"
                      checked={selected.includes(student.id)}
                      onChange={(e) => setSelected(prev =>
                        e.target.checked ? [...prev, student.id] : prev.filter((id) => id !== student.id)
                      )}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {initials(student.name || "S")}
                      </div>
                      <div>
                        <div className="text-sm font-medium">{student.name}</div>
                        <div className="text-xs text-muted-foreground">{student.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {student.studentProfile?.college || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm hidden lg:table-cell">
                    {student.studentProfile?.batchStudents?.[0]?.batch?.name || (
                      <span className="text-muted-foreground">Unassigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", getUserStatusColor(student.status))}>
                      {student.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium hidden lg:table-cell">
                    {student.studentProfile?.totalPoints || 0}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {formatDate(student.createdAt)}
                  </td>
                  <td className="px-4 py-3 relative">
                    <button
                      onClick={() => setOpenMenu(openMenu === student.id ? null : student.id)}
                      className="p-1.5 rounded-lg hover:bg-muted transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    {openMenu === student.id && (
                      <div className="absolute right-4 top-full mt-1 w-48 bg-card border border-border rounded-xl shadow-xl z-10 py-1">
                        <button className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors">
                          <Edit className="w-3.5 h-3.5" /> Edit Student
                        </button>
                        {student.status !== "SUSPENDED" ? (
                          <button onClick={() => handleStatusChange(student.id, "SUSPENDED")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-amber-600 hover:bg-muted transition-colors">
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </button>
                        ) : (
                          <button onClick={() => handleStatusChange(student.id, "ACTIVE")} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-muted transition-colors">
                            <UserCheck className="w-3.5 h-3.5" /> Activate
                          </button>
                        )}
                        <button onClick={() => handleDelete(student.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-muted transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted disabled:opacity-50">Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className={cn("px-3 py-1.5 text-xs border rounded-lg transition-colors", p === page ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-xs border border-border rounded-lg hover:bg-muted disabled:opacity-50">Next</button>
          </div>
        </div>
      )}

      {addOpen && <AddStudentModal onClose={() => setAddOpen(false)} onAdd={(s) => { setStudents((prev) => [s as unknown as Student, ...prev]); setAddOpen(false); }} />}
    </div>
  );
}
