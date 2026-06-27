// ============================================================
// TRAINER CONTENT PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import {
  BookOpen, ChevronDown, ChevronRight, Layers,
  Video, FileText, Link2, Code, ClipboardList, File,
  Search, Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration: number | null;
  isFree: boolean;
  order: number;
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
  isPublished: boolean;
  tags: string[];
  _count: { modules: number; batches: number };
  modules: Module[];
}

const LESSON_ICONS: Record<string, React.ElementType> = {
  VIDEO: Video,
  PDF: FileText,
  TEXT: FileText,
  LINK: Link2,
  CODING: Code,
  ASSIGNMENT: ClipboardList,
};

const LESSON_COLORS: Record<string, string> = {
  VIDEO: "text-blue-500 bg-blue-500/10",
  PDF: "text-red-500 bg-red-500/10",
  TEXT: "text-violet-500 bg-violet-500/10",
  LINK: "text-cyan-500 bg-cyan-500/10",
  CODING: "text-amber-500 bg-amber-500/10",
  ASSIGNMENT: "text-emerald-500 bg-emerald-500/10",
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-600",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-600",
  ADVANCED: "bg-red-500/10 text-red-600",
};

export default function TrainerContentPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch all courses — the API returns courses for this trainer via TrainerCourse join
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then(async (d) => {
        const courseList: Course[] = d.courses || [];
        // Fetch module + lesson details for each course
        const detailed = await Promise.all(
          courseList.map(async (c) => {
            try {
              const res = await fetch(`/api/admin/courses/${c.id}`);
              if (!res.ok) return { ...c, modules: [] };
              const data = await res.json();
              return { ...c, modules: data.course?.modules || [] };
            } catch {
              return { ...c, modules: [] };
            }
          })
        );
        setCourses(detailed);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(moduleId) ? next.delete(moduleId) : next.add(moduleId);
      return next;
    });
  }

  const filtered = courses.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  const totalLessons = courses.reduce(
    (s, c) => s + c.modules.reduce((ms, m) => ms + m.lessons.length, 0),
    0
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Browse course materials assigned to you
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Courses", value: courses.length },
          { label: "Modules", value: courses.reduce((s, c) => s + c._count.modules, 0) },
          { label: "Lessons", value: totalLessons },
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
          placeholder="Search courses or tags..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Course accordion list */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border rounded-xl">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            {search ? "No courses match your search" : "No courses assigned yet"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((course) => {
            const isOpen = expandedCourse === course.id;
            return (
              <div
                key={course.id}
                className="bg-card border border-border rounded-xl overflow-hidden"
              >
                {/* Course header row */}
                <button
                  onClick={() =>
                    setExpandedCourse(isOpen ? null : course.id)
                  }
                  className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{course.title}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", LEVEL_COLORS[course.level])}>
                        {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-full flex items-center gap-1",
                        course.isPublished
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      )}>
                        {course.isPublished ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        {course._count.modules} modules
                      </span>
                      <span className="flex items-center gap-1">
                        <File className="w-3 h-3" />
                        {course._count.batches} batches
                      </span>
                    </div>
                  </div>
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </button>

                {/* Modules accordion */}
                {isOpen && (
                  <div className="border-t border-border divide-y divide-border/50">
                    {course.modules.length === 0 ? (
                      <div className="px-5 py-6 text-center text-sm text-muted-foreground">
                        No modules added yet for this course
                      </div>
                    ) : (
                      course.modules
                        .sort((a, b) => a.order - b.order)
                        .map((mod) => {
                          const modOpen = expandedModules.has(mod.id);
                          return (
                            <div key={mod.id}>
                              {/* Module row */}
                              <button
                                onClick={() => toggleModule(mod.id)}
                                className="w-full flex items-center gap-3 px-5 py-3.5 text-left bg-muted/20 hover:bg-muted/40 transition-colors"
                              >
                                <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-bold text-primary">
                                    {mod.order}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium">{mod.title}</span>
                                  {mod.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                      {mod.description}
                                    </p>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground mr-2">
                                  {mod.lessons.length} lesson{mod.lessons.length !== 1 ? "s" : ""}
                                </span>
                                {modOpen ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                                )}
                              </button>

                              {/* Lesson rows */}
                              {modOpen && (
                                <div className="divide-y divide-border/30">
                                  {mod.lessons.length === 0 ? (
                                    <div className="px-12 py-4 text-xs text-muted-foreground">
                                      No lessons in this module
                                    </div>
                                  ) : (
                                    mod.lessons
                                      .sort((a, b) => a.order - b.order)
                                      .map((lesson) => {
                                        const Icon = LESSON_ICONS[lesson.type] ?? FileText;
                                        const color = LESSON_COLORS[lesson.type] ?? "text-muted-foreground bg-muted";
                                        return (
                                          <div
                                            key={lesson.id}
                                            className="flex items-center gap-3 px-12 py-3 hover:bg-muted/20 transition-colors"
                                          >
                                            <div
                                              className={cn(
                                                "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0",
                                                color
                                              )}
                                            >
                                              <Icon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <span className="text-sm">{lesson.title}</span>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                              {lesson.duration && (
                                                <span className="text-xs text-muted-foreground">
                                                  {lesson.duration} min
                                                </span>
                                              )}
                                              <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground">
                                                {lesson.type.charAt(0) + lesson.type.slice(1).toLowerCase()}
                                              </span>
                                              {lesson.isFree && (
                                                <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-600 rounded-full">
                                                  Free
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
