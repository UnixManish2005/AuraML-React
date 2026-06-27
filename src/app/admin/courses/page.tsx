// ============================================================
// ADMIN COURSES PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import { Plus, BookOpen, Edit, Trash2, Eye, EyeOff, Layers, Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

interface Course {
  id: string;
  title: string;
  slug: string;
  level: string;
  duration: number;
  isFree: boolean;
  isPublished: boolean;
  tags: string[];
  createdAt: string;
  _count: { modules: number; batches: number };
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-600",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-600",
  ADVANCED: "bg-red-500/10 text-red-600",
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((d) => { setCourses(d.courses || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function togglePublish(id: string, isPublished: boolean) {
    try {
      await fetch(`/api/admin/courses/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      setCourses((prev) => prev.map((c) => c.id === id ? { ...c, isPublished: !isPublished } : c));
      toast.success(isPublished ? "Course unpublished" : "Course published!");
    } catch { toast.error("Update failed"); }
  }

  async function deleteCourse(id: string) {
    if (!confirm("Delete this course and all its content?")) return;
    try {
      await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      setCourses((prev) => prev.filter((c) => c.id !== id));
      toast.success("Course deleted");
    } catch { toast.error("Delete failed"); }
  }

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Courses</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your learning content</p>
        </div>
        <Link
          href="/admin/courses/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Course
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Courses", value: courses.length },
          { label: "Published", value: courses.filter((c) => c.isPublished).length },
          { label: "Drafts", value: courses.filter((c) => !c.isPublished).length },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
        />
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-muted animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((course) => (
            <div key={course.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-border/80 transition-all">
              {/* Thumbnail placeholder */}
              <div className="h-28 bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                <BookOpen className="w-10 h-10 text-blue-400/60" />
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-sm line-clamp-1 flex-1">{course.title}</h3>
                  <div className={cn(
                    "text-xs px-2 py-0.5 rounded-full ml-2 flex-shrink-0",
                    course.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                  )}>
                    {course.isPublished ? "Live" : "Draft"}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full", LEVEL_COLORS[course.level])}>
                    {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                  </span>
                  <span className="text-xs text-muted-foreground">{course.duration}h</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{course.isFree ? "Free" : "Paid"}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{course._count.modules} modules</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course._count.batches} batches</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/admin/courses/${course.id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-border rounded-lg text-xs hover:bg-muted transition-colors"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </Link>
                  <button
                    onClick={() => togglePublish(course.id, course.isPublished)}
                    className="p-2 border border-border rounded-lg text-xs hover:bg-muted transition-colors text-muted-foreground"
                    title={course.isPublished ? "Unpublish" : "Publish"}
                  >
                    {course.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => deleteCourse(course.id)}
                    className="p-2 border border-border rounded-lg text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors text-muted-foreground"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-16">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">No courses found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
