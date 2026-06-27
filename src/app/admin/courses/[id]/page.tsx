// ============================================================
// ADMIN COURSE DETAIL PAGE — /admin/courses/[id]
// ============================================================

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, Plus, Trash2, Edit2, Check, X,
  Video, FileText, Link2, Code, ClipboardList,
  ChevronDown, ChevronRight, Layers, GripVertical,
  Eye, EyeOff, Loader2, Users, Search, UserPlus, UserMinus,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ---- Types ----
interface Lesson {
  id: string;
  title: string;
  type: string;
  content: string | null;
  videoUrl: string | null;
  pdfUrl: string | null;
  duration: number | null;
  order: number;
  isFree: boolean;
  description: string | null;
}

interface Module {
  id: string;
  title: string;
  description: string | null;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: number;
  isFree: boolean;
  isPublished: boolean;
  tags: string[];
  modules: Module[];
}

// ---- Student / Batch Types ----
interface EnrolledStudent {
  id: string; // BatchStudent.id
  studentId: string;
  joinedAt: string;
  student: {
    user: { id: string; name: string; email: string; image: string | null; status: string };
  };
}

interface CourseBatch {
  id: string;
  name: string;
  status: string;
  capacity: number;
  startDate: string;
  endDate: string;
  trainer: { user: { name: string } };
  batchStudents: EnrolledStudent[];
  _count: { batchStudents: number };
}

interface StudentSearchResult {
  id: string; // User.id
  name: string;
  email: string;
  studentProfile: { id: string } | null; // studentProfile.id is the Student table id
}

const LESSON_TYPES = ["VIDEO", "PDF", "TEXT", "LINK", "CODING", "ASSIGNMENT"] as const;

const LESSON_ICONS: Record<string, React.ElementType> = {
  VIDEO: Video, PDF: FileText, TEXT: FileText,
  LINK: Link2, CODING: Code, ASSIGNMENT: ClipboardList,
};

const LESSON_TYPE_COLORS: Record<string, string> = {
  VIDEO: "text-blue-500 bg-blue-500/10",
  PDF: "text-red-500 bg-red-500/10",
  TEXT: "text-violet-500 bg-violet-500/10",
  LINK: "text-cyan-500 bg-cyan-500/10",
  CODING: "text-amber-500 bg-amber-500/10",
  ASSIGNMENT: "text-emerald-500 bg-emerald-500/10",
};

// ---- Add Module Modal ----
function AddModuleModal({
  courseId,
  nextOrder,
  onClose,
  onAdd,
}: {
  courseId: string;
  nextOrder: number;
  onClose: () => void;
  onAdd: (mod: Module) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, title: title.trim(), description: description.trim() || undefined, order: nextOrder }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "Server error"));
      onAdd({ ...data.module, lessons: [] });
      toast.success("Module added!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to add module");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-base font-semibold mb-4">Add Module</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Title *</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="e.g. Introduction to Python"
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional description..."
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : "Add Module"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Add Lesson Modal ----
function AddLessonModal({
  moduleId,
  nextOrder,
  onClose,
  onAdd,
}: {
  moduleId: string;
  nextOrder: number;
  onClose: () => void;
  onAdd: (lesson: Lesson) => void;
}) {
  const [form, setForm] = useState({
    title: "", type: "VIDEO", content: "",
    videoUrl: "", pdfUrl: "", duration: "",
    isFree: false, description: "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    try {
      const payload = {
        moduleId,
        title: form.title.trim(),
        type: form.type,
        description: form.description.trim() || undefined,
        content: form.content.trim() || undefined,
        videoUrl: form.videoUrl.trim() || undefined,
        pdfUrl: form.pdfUrl.trim() || undefined,
        duration: form.duration ? parseInt(form.duration) : undefined,
        isFree: form.isFree,
        order: nextOrder,
      };
      const res = await fetch("/api/admin/lessons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "Server error"));
      onAdd(data.lesson);
      toast.success("Lesson added!");
    } catch (err) {
      toast.error((err as Error).message || "Failed to add lesson");
    } finally {
      setSaving(false);
    }
  }

  const needsUrl = form.type === "VIDEO" || form.type === "LINK" || form.type === "PDF";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-base font-semibold mb-4">Add Lesson</h2>
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Title *</label>
            <input
              autoFocus
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Variables and Data Types"
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium block mb-1.5">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none"
              >
                {LESSON_TYPES.map((t) => (
                  <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium block mb-1.5">Duration (min)</label>
              <input
                type="number"
                value={form.duration}
                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                min="1"
                placeholder="30"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium block mb-1.5">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional short description"
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none"
            />
          </div>

          {form.type === "VIDEO" && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Video URL</label>
              <input
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none font-mono text-xs"
              />
            </div>
          )}

          {form.type === "PDF" && (
            <div>
              <label className="text-sm font-medium block mb-1.5">PDF URL</label>
              <input
                value={form.pdfUrl}
                onChange={(e) => setForm({ ...form, pdfUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none font-mono text-xs"
              />
            </div>
          )}

          {form.type === "LINK" && (
            <div>
              <label className="text-sm font-medium block mb-1.5">Link URL</label>
              <input
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none font-mono text-xs"
              />
            </div>
          )}

          {(form.type === "TEXT" || form.type === "CODING" || form.type === "ASSIGNMENT") && (
            <div>
              <label className="text-sm font-medium block mb-1.5">
                {form.type === "TEXT" ? "Content" : form.type === "CODING" ? "Problem Statement" : "Assignment Brief"}
              </label>
              <textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={4}
                placeholder="Enter content here..."
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none resize-none"
              />
            </div>
          )}

          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFree}
              onChange={(e) => setForm({ ...form, isFree: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Free preview lesson (visible without enrollment)</span>
          </label>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            {saving ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : "Add Lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Enroll Student Modal ----
function EnrollStudentModal({
  courseId,
  batches,
  onClose,
  onEnrolled,
}: {
  courseId: string;
  batches: CourseBatch[];
  onClose: () => void;
  onEnrolled: (batchId: string, enrolled: EnrolledStudent) => void;
}) {
  const [selectedBatchId, setSelectedBatchId] = useState(batches[0]?.id ?? "");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<StudentSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId);
  const alreadyEnrolledIds = new Set(
    selectedBatch?.batchStudents.map((bs) => bs.student.user.id) ?? []
  );

  useEffect(() => {
    if (!search.trim()) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/admin/students?search=${encodeURIComponent(search)}&pageSize=10`);
        const data = await res.json();
        setResults(data.users ?? []);
      } catch { toast.error("Search failed"); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  async function handleEnroll(student: StudentSearchResult) {
    if (!student.studentProfile?.id) {
      toast.error("This user has no student profile yet");
      return;
    }
    setEnrolling(student.id);
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: student.studentProfile.id, batchId: selectedBatchId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "Server error"));
      onEnrolled(selectedBatchId, data.batchStudent);
      toast.success(`${student.name} enrolled in ${selectedBatch?.name}`);
    } catch (err) {
      toast.error((err as Error).message || "Enroll failed");
    } finally {
      setEnrolling(null);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold">Enroll Student</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Batch selector */}
        <div className="mb-4">
          <label className="text-sm font-medium block mb-1.5">Select Batch *</label>
          {batches.length === 0 ? (
            <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg px-3 py-2.5">
              No batches exist for this course yet. Create a batch first.
            </p>
          ) : (
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b._count.batchStudents}/{b.capacity} students
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Student search */}
        <div className="mb-2">
          <label className="text-sm font-medium block mb-1.5">Search Student</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50"
            />
            {searching && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Results list */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border/50 mt-2">
          {!search.trim() ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Type a name or email to search students
            </p>
          ) : results.length === 0 && !searching ? (
            <p className="text-xs text-muted-foreground text-center py-8">No students found</p>
          ) : (
            results.map((student) => {
              const enrolled = alreadyEnrolledIds.has(student.id);
              const isEnrolling = enrolling === student.id;
              return (
                <div key={student.id} className="flex items-center gap-3 px-3 py-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {student.name?.charAt(0)?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{student.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{student.email}</p>
                  </div>
                  {enrolled ? (
                    <span className="text-xs text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full flex-shrink-0">
                      Enrolled
                    </span>
                  ) : (
                    <button
                      onClick={() => handleEnroll(student)}
                      disabled={isEnrolling || !selectedBatchId || batches.length === 0}
                      className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex-shrink-0"
                    >
                      {isEnrolling ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      Enroll
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Main Page ----
export default function AdminCourseEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [addLessonFor, setAddLessonFor] = useState<string | null>(null);
  const [editingModule, setEditingModule] = useState<{ id: string; title: string } | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ id: string; title: string } | null>(null);

  // Students tab
  const [activeTab, setActiveTab] = useState<"modules" | "students">("modules");
  const [batches, setBatches] = useState<CourseBatch[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/courses/${courseId}`)
      .then((r) => r.json())
      .then((d) => {
        setCourse(d.course);
        if (d.course?.modules) {
          setExpandedModules(new Set(d.course.modules.map((m: Module) => m.id)));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [courseId]);

  useEffect(() => {
    if (activeTab !== "students") return;
    setBatchesLoading(true);
    fetch(`/api/admin/courses/${courseId}/students`)
      .then((r) => r.json())
      .then((d) => { setBatches(d.batches ?? []); })
      .catch(() => toast.error("Failed to load students"))
      .finally(() => setBatchesLoading(false));
  }, [courseId, activeTab]);

  async function togglePublish() {
    if (!course) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(String(data.error ?? "Server error"));
      setCourse((prev) => prev ? { ...prev, isPublished: !prev.isPublished } : prev);
      toast.success(course.isPublished ? "Course unpublished" : "Course is now live!");
    } catch { toast.error("Failed to update"); }
  }

  async function deleteModule(moduleId: string) {
    if (!confirm("Delete this module and all its lessons?")) return;
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCourse((prev) =>
        prev ? { ...prev, modules: prev.modules.filter((m) => m.id !== moduleId) } : prev
      );
      toast.success("Module deleted");
    } catch { toast.error("Failed to delete module"); }
  }

  async function deleteLesson(moduleId: string, lessonId: string) {
    if (!confirm("Delete this lesson?")) return;
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
              : m
          ),
        };
      });
      toast.success("Lesson deleted");
    } catch { toast.error("Failed to delete lesson"); }
  }

  async function saveModuleTitle(moduleId: string, title: string) {
    try {
      const res = await fetch(`/api/admin/modules/${moduleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      setCourse((prev) =>
        prev ? {
          ...prev,
          modules: prev.modules.map((m) => m.id === moduleId ? { ...m, title } : m),
        } : prev
      );
      setEditingModule(null);
      toast.success("Module renamed");
    } catch { toast.error("Failed to rename"); }
  }

  async function saveLessonTitle(moduleId: string, lessonId: string, title: string) {
    try {
      const res = await fetch(`/api/admin/lessons/${lessonId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error();
      setCourse((prev) =>
        prev ? {
          ...prev,
          modules: prev.modules.map((m) =>
            m.id === moduleId
              ? { ...m, lessons: m.lessons.map((l) => l.id === lessonId ? { ...l, title } : l) }
              : m
          ),
        } : prev
      );
      setEditingLesson(null);
      toast.success("Lesson renamed");
    } catch { toast.error("Failed to rename"); }
  }

  async function removeStudent(batchId: string, studentId: string, studentName: string) {
    if (!confirm(`Remove ${studentName} from this batch?`)) return;
    try {
      const res = await fetch(`/api/admin/courses/${courseId}/students`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batchId, studentId }),
      });
      if (!res.ok) throw new Error();
      setBatches((prev) =>
        prev.map((b) =>
          b.id === batchId
            ? { ...b, batchStudents: b.batchStudents.filter((bs) => bs.studentId !== studentId) }
            : b
        )
      );
      toast.success(`${studentName} removed`);
    } catch { toast.error("Failed to remove student"); }
  }

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-28 bg-muted animate-pulse rounded-xl" />
        {[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Course not found</p>
        <Link href="/admin/courses" className="mt-4 text-sm text-primary hover:underline">
          ← Back to courses
        </Link>
      </div>
    );
  }

  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">{course.title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {course.modules.length} modules · {totalLessons} lessons
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={togglePublish}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border transition-colors",
              course.isPublished
                ? "border-emerald-300 text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                : "border-border text-muted-foreground hover:bg-muted"
            )}
          >
            {course.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {course.isPublished ? "Published" : "Draft"}
          </button>
        </div>
      </div>

      {/* Course meta card */}
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="grid sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Level</div>
            <div className="font-medium">{course.level.charAt(0) + course.level.slice(1).toLowerCase()}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Duration</div>
            <div className="font-medium">{course.duration}h</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Pricing</div>
            <div className="font-medium">{course.isFree ? "Free" : "Paid"}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Tags</div>
            <div className="flex flex-wrap gap-1">
              {course.tags.length > 0
                ? course.tags.map((t) => (
                    <span key={t} className="text-xs bg-muted px-2 py-0.5 rounded-full">{t}</span>
                  ))
                : <span className="text-xs text-muted-foreground">None</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 border-b border-border">
        {(["modules", "students"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors capitalize",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "modules" ? <Layers className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Students tab */}
      {activeTab === "students" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Students enrolled across all batches of this course
            </p>
            <button
              onClick={() => setEnrollModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Enroll Student
            </button>
          </div>

          {batchesLoading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
              ))}
            </div>
          ) : batches.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-14 text-center">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No batches found for this course. Create a batch first, then enroll students.
              </p>
            </div>
          ) : (
            batches.map((batch) => {
              const BATCH_STATUS_COLORS: Record<string, string> = {
                UPCOMING: "bg-blue-500/10 text-blue-600",
                ONGOING: "bg-emerald-500/10 text-emerald-600",
                COMPLETED: "bg-muted text-muted-foreground",
              };
              return (
                <div key={batch.id} className="bg-card border border-border rounded-xl overflow-hidden">
                  {/* Batch header */}
                  <div className="flex items-center justify-between px-4 py-3 bg-muted/20 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm font-semibold">{batch.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Trainer: {batch.trainer.user.name} · {batch.batchStudents.length}/{batch.capacity} students
                        </p>
                      </div>
                    </div>
                    <span className={cn("text-xs px-2 py-1 rounded-full font-medium", BATCH_STATUS_COLORS[batch.status] ?? "bg-muted text-muted-foreground")}>
                      {batch.status.charAt(0) + batch.status.slice(1).toLowerCase()}
                    </span>
                  </div>

                  {/* Enrolled students */}
                  {batch.batchStudents.length === 0 ? (
                    <div className="px-4 py-8 text-center">
                      <p className="text-xs text-muted-foreground">No students enrolled in this batch yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {batch.batchStudents.map((bs) => (
                        <div key={bs.id} className="flex items-center gap-3 px-4 py-3 group hover:bg-muted/20 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {bs.student.user.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{bs.student.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{bs.student.user.email}</p>
                          </div>
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
                            bs.student.user.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground"
                          )}>
                            {bs.student.user.status.charAt(0) + bs.student.user.status.slice(1).toLowerCase()}
                          </span>
                          <button
                            onClick={() => removeStudent(batch.id, bs.studentId, bs.student.user.name)}
                            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-muted opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            title="Remove from batch"
                          >
                            <UserMinus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}

          {enrollModalOpen && (
            <EnrollStudentModal
              courseId={courseId}
              batches={batches}
              onClose={() => setEnrollModalOpen(false)}
              onEnrolled={(batchId, enrolled) => {
                setBatches((prev) =>
                  prev.map((b) =>
                    b.id === batchId
                      ? {
                          ...b,
                          batchStudents: [...b.batchStudents, enrolled],
                          _count: { batchStudents: b._count.batchStudents + 1 },
                        }
                      : b
                  )
                );
              }}
            />
          )}
        </div>
      )}

      {/* Modules section */}
      {activeTab === "modules" && <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-muted-foreground" /> Modules
          </h2>
          <button
            onClick={() => setAddModuleOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Module
          </button>
        </div>

        {course.modules.length === 0 ? (
          <div className="border-2 border-dashed border-border rounded-xl p-14 text-center">
            <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">No modules yet. Add your first module to start building the course.</p>
            <button
              onClick={() => setAddModuleOpen(true)}
              className="text-sm text-primary hover:underline"
            >
              + Add first module
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {course.modules
              .sort((a, b) => a.order - b.order)
              .map((mod, modIdx) => {
                const isExpanded = expandedModules.has(mod.id);
                const isEditingThis = editingModule?.id === mod.id;

                return (
                  <div
                    key={mod.id}
                    className="bg-card border border-border rounded-xl overflow-hidden"
                  >
                    {/* Module header */}
                    <div className="flex items-center gap-3 px-4 py-3.5 bg-muted/20">
                      <GripVertical className="w-4 h-4 text-muted-foreground/40 flex-shrink-0 cursor-grab" />
                      <div
                        className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 cursor-pointer"
                        onClick={() => toggleModule(mod.id)}
                      >
                        {modIdx + 1}
                      </div>

                      {/* Inline title edit */}
                      <div className="flex-1 min-w-0">
                        {isEditingThis ? (
                          <div className="flex items-center gap-2">
                            <input
                              autoFocus
                              value={editingModule.title}
                              onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") saveModuleTitle(mod.id, editingModule.title);
                                if (e.key === "Escape") setEditingModule(null);
                              }}
                              className="flex-1 px-2 py-1 text-sm bg-background border border-primary/50 rounded-lg focus:outline-none"
                            />
                            <button onClick={() => saveModuleTitle(mod.id, editingModule.title)} className="p-1 text-emerald-500 hover:text-emerald-600">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEditingModule(null)} className="p-1 text-muted-foreground hover:text-foreground">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="text-left w-full"
                          >
                            <span className="font-semibold text-sm">{mod.title}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
                            </span>
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setAddLessonFor(mod.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                          title="Add lesson"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setEditingModule({ id: mod.id, title: mod.title })}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteModule(mod.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500"
                          title="Delete module"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => toggleModule(mod.id)} className="p-1.5 text-muted-foreground">
                          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Lessons */}
                    {isExpanded && (
                      <div className="border-t border-border">
                        {mod.lessons.length === 0 ? (
                          <div className="px-5 py-6 text-center">
                            <p className="text-xs text-muted-foreground mb-2">No lessons in this module</p>
                            <button
                              onClick={() => setAddLessonFor(mod.id)}
                              className="text-xs text-primary hover:underline"
                            >
                              + Add first lesson
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-border/50">
                            {mod.lessons
                              .sort((a, b) => a.order - b.order)
                              .map((lesson, lessonIdx) => {
                                const Icon = LESSON_ICONS[lesson.type] ?? FileText;
                                const iconColor = LESSON_TYPE_COLORS[lesson.type] ?? "text-muted-foreground bg-muted";
                                const isEditingLesson = editingLesson?.id === lesson.id;

                                return (
                                  <div
                                    key={lesson.id}
                                    className="flex items-center gap-3 px-5 py-3 hover:bg-muted/20 transition-colors group"
                                  >
                                    <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground w-5 flex-shrink-0">
                                      {lessonIdx + 1}
                                    </span>
                                    <div className={cn("w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0", iconColor)}>
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>

                                    {/* Inline lesson title edit */}
                                    <div className="flex-1 min-w-0">
                                      {isEditingLesson ? (
                                        <div className="flex items-center gap-2">
                                          <input
                                            autoFocus
                                            value={editingLesson.title}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                            onKeyDown={(e) => {
                                              if (e.key === "Enter") saveLessonTitle(mod.id, lesson.id, editingLesson.title);
                                              if (e.key === "Escape") setEditingLesson(null);
                                            }}
                                            className="flex-1 px-2 py-1 text-sm bg-background border border-primary/50 rounded-lg focus:outline-none"
                                          />
                                          <button onClick={() => saveLessonTitle(mod.id, lesson.id, editingLesson.title)} className="p-1 text-emerald-500">
                                            <Check className="w-3.5 h-3.5" />
                                          </button>
                                          <button onClick={() => setEditingLesson(null)} className="p-1 text-muted-foreground">
                                            <X className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ) : (
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-sm">{lesson.title}</span>
                                          {lesson.isFree && (
                                            <span className="text-xs bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">Free</span>
                                          )}
                                          {lesson.duration && (
                                            <span className="text-xs text-muted-foreground">{lesson.duration} min</span>
                                          )}
                                        </div>
                                      )}
                                    </div>

                                    {/* Lesson actions - visible on hover */}
                                    {!isEditingLesson && (
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button
                                          onClick={() => setEditingLesson({ id: lesson.id, title: lesson.title })}
                                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => deleteLesson(mod.id, lesson.id)}
                                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        )}

                        {/* Add lesson button at bottom of module */}
                        <div className="px-5 py-3 border-t border-border/50">
                          <button
                            onClick={() => setAddLessonFor(mod.id)}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add lesson to this module
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      

      {/* Modals */}
      {addModuleOpen && (
        <AddModuleModal
          courseId={courseId}
          nextOrder={course.modules.length + 1}
          onClose={() => setAddModuleOpen(false)}
          onAdd={(mod) => {
            setCourse((prev) =>
              prev ? { ...prev, modules: [...prev.modules, mod] } : prev
            );
            setExpandedModules((prev) => new Set([...prev, mod.id]));
            setAddModuleOpen(false);
          }}
        />
      )}

      {addLessonFor && (
        <AddLessonModal
          moduleId={addLessonFor}
          nextOrder={
            (course.modules.find((m) => m.id === addLessonFor)?.lessons.length ?? 0) + 1
          }
          onClose={() => setAddLessonFor(null)}
          onAdd={(lesson) => {
            setCourse((prev) =>
              prev
                ? {
                    ...prev,
                    modules: prev.modules.map((m) =>
                      m.id === addLessonFor
                        ? { ...m, lessons: [...m.lessons, lesson] }
                        : m
                    ),
                  }
                : prev
            );
            setAddLessonFor(null);
          }}
        />
      )}
      </div>
      }
    </div>
  );
}
