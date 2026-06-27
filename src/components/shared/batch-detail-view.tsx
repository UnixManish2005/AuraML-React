// ============================================================
// BATCH DETAIL VIEW — shared by admin + trainer
// ============================================================

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Calendar, Search, Trash2, UserPlus,
  ChevronLeft, Loader2, X, Check, BookOpen,
  User, Mail, BadgeCheck, AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate, getBatchStatusColor, cn } from "@/lib/utils";

// ---- Types ----
interface BatchStudent {
  id: string;
  joinedAt: string;
  isActive: boolean;
  student: {
    id: string;
    user: { id: string; name: string | null; email: string; status: string; image: string | null };
  };
}

interface BatchDetail {
  id: string;
  name: string;
  status: string;
  capacity: number;
  startDate: string;
  endDate: string;
  description: string | null;
  course: { id: string; title: string };
  trainer: { user: { name: string | null } };
  _count: { batchStudents: number };
}

interface StudentSearchResult {
  id: string;          // User.id
  name: string | null;
  email: string;
  status: string;
  studentProfile: { id: string } | null;  // Student.id
}

// ---- initials helper ----
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

// ---- Add Student Modal ----
function AddStudentModal({
  batchId,
  existingIds,
  onClose,
  onAdd,
}: {
  batchId: string;
  existingIds: Set<string>;
  onClose: () => void;
  onAdd: (bs: BatchStudent) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/admin/students?search=${encodeURIComponent(q)}&pageSize=20`
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      // API returns { users: [...] } — fall back to data[] for safety
      setResults(data.users || data.data || []);
    } catch (err) {
      console.error("[student search]", err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => search(query), 300);
    return () => clearTimeout(t);
  }, [query, search]);

  async function addStudent(student: StudentSearchResult) {
    if (!student.studentProfile) {
      toast.error("This user has no student profile yet");
      return;
    }
    setAdding(student.id);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.studentProfile.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "Server error"));
      onAdd(data.batchStudent);
      toast.success(`${student.name ?? student.email} added to batch`);
    } catch (err) {
      toast.error((err as Error).message || "Failed to add student");
    } finally {
      setAdding(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-semibold">Add Student to Batch</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search input */}
        <div className="px-5 py-3 border-b border-border flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students by name or email..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Results */}
        <div className="overflow-y-auto flex-1">
          {query.trim().length < 2 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Type at least 2 characters to search
            </div>
          ) : results.length === 0 && !searching ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No students found for &quot;{query}&quot;
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {results.map((student) => {
                const alreadyIn = student.studentProfile
                  ? existingIds.has(student.studentProfile.id)
                  : false;
                const isAdding = adding === student.id;

                return (
                  <div
                    key={student.id}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors"
                  >
                    {/* Avatar */}
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials(student.name || "S")}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">
                        {student.name ?? "—"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {student.email}
                      </div>
                    </div>

                    {/* Status + action */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {alreadyIn ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <Check className="w-3 h-3" /> Enrolled
                        </span>
                      ) : !student.studentProfile ? (
                        <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                          <AlertCircle className="w-3 h-3" /> No profile
                        </span>
                      ) : (
                        <button
                          onClick={() => addStudent(student)}
                          disabled={isAdding}
                          className="flex items-center gap-1.5 text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
                        >
                          {isAdding ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <UserPlus className="w-3 h-3" />
                          )}
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Main BatchDetailView ----
export default function BatchDetailView({
  batchId,
  backHref,
  role,
}: {
  batchId: string;
  backHref: string;
  role: "admin" | "trainer";
}) {
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [students, setStudents] = useState<BatchStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [removing, setRemoving] = useState<string | null>(null);

  useEffect(() => {
    // Fetch batch info and students independently.
    // A failure in the students route must never block the batch from rendering.
    const fetchBatch = fetch(`/api/admin/batches/${batchId}`)
      .then(async (r) => {
        const text = await r.text();
        const d = text ? JSON.parse(text) : {};
        setBatch(d.batch ?? null);
      })
      .catch(() => setBatch(null));

    const fetchStudents = fetch(`/api/admin/batches/${batchId}/students`)
      .then(async (r) => {
        if (!r.ok) return;
        const text = await r.text();
        const d = text ? JSON.parse(text) : {};
        setStudents(d.batchStudents ?? []);
      })
      .catch(() => setStudents([]));

    Promise.all([fetchBatch, fetchStudents]).finally(() => setLoading(false));
  }, [batchId]);

  async function removeStudent(studentId: string, name: string) {
    if (!confirm(`Remove ${name} from this batch?`)) return;
    setRemoving(studentId);
    try {
      const res = await fetch(`/api/admin/batches/${batchId}/students`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId }),
      });
      if (!res.ok) {
        const text = await res.text();
        const err = text ? JSON.parse(text) : {};
        throw new Error(String((err as Record<string,unknown>).error) || `Server error (${res.status})`);
      }
      setStudents((prev) => prev.filter((bs) => bs.student.id !== studentId));
      toast.success("Student removed from batch");
    } catch (err) {
      toast.error((err as Error).message || "Failed to remove student");
    } finally {
      setRemoving(null);
    }
  }

  const filtered = students.filter(
    (bs) =>
      bs.student.user.name?.toLowerCase().includes(search.toLowerCase()) ||
      bs.student.user.email.toLowerCase().includes(search.toLowerCase())
  );

  const enrolledStudentIds = new Set(students.map((bs) => bs.student.id));

  const fillPercent = batch
    ? Math.round((students.length / batch.capacity) * 100)
    : 0;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded-xl" />
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Batch not found</p>
        <Link href={backHref} className="mt-4 text-sm text-primary hover:underline">
          ← Back
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back nav */}
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to Batches
      </Link>

      {/* Batch info card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{batch.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{batch.course.title}</p>
          </div>
          <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", getBatchStatusColor(batch.status))}>
            {batch.status.charAt(0) + batch.status.slice(1).toLowerCase()}
          </span>
        </div>

        {batch.description && (
          <p className="text-sm text-muted-foreground mb-4">{batch.description}</p>
        )}

        <div className="grid sm:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4 flex-shrink-0" />
            <span>{batch.trainer.user.name ?? "Unassigned"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{formatDate(batch.startDate)} → {formatDate(batch.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span>{batch.course.title}</span>
          </div>
        </div>

        {/* Capacity bar */}
        <div>
          <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> Enrolled
            </span>
            <span className={cn(
              "font-medium",
              fillPercent >= 90 ? "text-red-500" : fillPercent >= 70 ? "text-amber-500" : "text-emerald-500"
            )}>
              {students.length} / {batch.capacity}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all",
                fillPercent >= 90 ? "bg-red-500" : fillPercent >= 70 ? "bg-amber-500" : "bg-emerald-500"
              )}
              style={{ width: `${Math.min(fillPercent, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Students section */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-muted-foreground" />
            Students
            <span className="text-xs text-muted-foreground font-normal">
              ({students.length})
            </span>
          </h2>
          <button
            onClick={() => setAddOpen(true)}
            disabled={students.length >= batch.capacity}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title={students.length >= batch.capacity ? "Batch is at full capacity" : ""}
          >
            <UserPlus className="w-3.5 h-3.5" /> Add Student
          </button>
        </div>

        {/* Search bar */}
        {students.length > 0 && (
          <div className="px-5 py-3 border-b border-border/50">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter students..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
              />
            </div>
          </div>
        )}

        {/* Student list */}
        {students.length === 0 ? (
          <div className="py-16 text-center">
            <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">No students enrolled yet</p>
            <button
              onClick={() => setAddOpen(true)}
              className="text-sm text-primary hover:underline"
            >
              + Add first student
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            No students match &quot;{search}&quot;
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Student</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Email</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Status</th>
                  <th className="w-16 px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((bs) => {
                  const isRemoving = removing === bs.student.id;
                  return (
                    <tr
                      key={bs.id}
                      className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                    >
                      {/* Name + avatar */}
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {initials(bs.student.user.name || "S")}
                          </div>
                          <span className="text-sm font-medium">
                            {bs.student.user.name ?? "—"}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-5 py-3 hidden sm:table-cell">
                        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Mail className="w-3.5 h-3.5" />
                          {bs.student.user.email}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {formatDate(bs.joinedAt)}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3 hidden md:table-cell">
                        <span className={cn(
                          "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium",
                          bs.student.user.status === "ACTIVE"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        )}>
                          {bs.student.user.status === "ACTIVE" && (
                            <BadgeCheck className="w-3 h-3" />
                          )}
                          {bs.student.user.status}
                        </span>
                      </td>

                      {/* Remove */}
                      <td className="px-5 py-3">
                        <button
                          onClick={() =>
                            removeStudent(
                              bs.student.id,
                              bs.student.user.name ?? bs.student.user.email
                            )
                          }
                          disabled={isRemoving}
                          className="p-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 text-muted-foreground transition-colors disabled:opacity-40"
                          title="Remove from batch"
                        >
                          {isRemoving ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Student Modal */}
      {addOpen && (
        <AddStudentModal
          batchId={batchId}
          existingIds={enrolledStudentIds}
          onClose={() => setAddOpen(false)}
          onAdd={(bs) => {
            setStudents((prev) => [bs, ...prev]);
            setAddOpen(false);
          }}
        />
      )}
    </div>
  );
}
