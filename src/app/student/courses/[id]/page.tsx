// ============================================================
// STUDENT COURSE DETAIL PAGE  — /student/courses/[id]
// ============================================================

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Play, Video, FileText, Link2, Code,
  ClipboardList, ChevronLeft, ChevronRight,
  CheckCircle, Clock, Layers, User, Lock, Award,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

// ---- data fetcher ----
async function getCourseDetail(courseId: string, userId: string) {
  const student = await db.student.findUnique({ where: { userId } });
  if (!student) return null;

  // Verify the student is actually enrolled
  const enrollment = await db.batchStudent.findFirst({
    where: {
      studentId: student.id,
      batch: { courseId },
      isActive: true,
    },
    include: {
      batch: {
        include: {
          trainer: { include: { user: { select: { name: true } } } },
        },
      },
    },
  });
  if (!enrollment) return null;

  const [course, completedLessons, courseProgress] = await Promise.all([
    db.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          include: {
            lessons: { orderBy: { order: "asc" } },
          },
          orderBy: { order: "asc" },
        },
      },
    }),
    db.studentProgress.findMany({
      where: { studentId: student.id, courseId, completed: true, lessonId: { not: null } },
      select: { lessonId: true },
    }),
    db.studentProgress.findFirst({
      where: { studentId: student.id, courseId, lessonId: null },
    }),
  ]);

  if (!course) return null;

  const completedSet = new Set(completedLessons.map((p) => p.lessonId));
  const totalLessons = course.modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedCount = completedSet.size;
  const progressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return {
    course,
    batch: enrollment.batch,
    trainerName: enrollment.batch.trainer?.user.name ?? null,
    completedLessonIds: completedSet,
    totalLessons,
    completedCount,
    progressPct: courseProgress?.percentage ?? progressPct,
    enrolledAt: enrollment.joinedAt,
  };
}

// ---- icon + colour maps ----
const LESSON_ICONS: Record<string, React.ElementType> = {
  VIDEO: Video,
  PDF: FileText,
  TEXT: FileText,
  LINK: Link2,
  CODING: Code,
  ASSIGNMENT: ClipboardList,
};

const LESSON_TYPE_COLORS: Record<string, string> = {
  VIDEO:      "text-blue-500 bg-blue-500/10",
  PDF:        "text-red-500 bg-red-500/10",
  TEXT:       "text-violet-500 bg-violet-500/10",
  LINK:       "text-cyan-500 bg-cyan-500/10",
  CODING:     "text-amber-500 bg-amber-500/10",
  ASSIGNMENT: "text-emerald-500 bg-emerald-500/10",
};

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER:     "bg-green-500/10 text-green-600",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-600",
  ADVANCED:     "bg-red-500/10 text-red-600",
};

// ---- page ----
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const course = await db.course.findUnique({
    where: { id },
    select: { title: true },
  });
  return { title: course?.title ?? "Course" };
}

export default async function StudentCourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const data = await getCourseDetail(id, session.user.id);
  if (!data) notFound();

  const {
    course,
    trainerName,
    completedLessonIds,
    totalLessons,
    completedCount,
    progressPct,
    enrolledAt,
  } = data;

  const isCompleted = progressPct >= 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back nav */}
      <Link
        href="/student/courses"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="w-4 h-4" /> Back to My Courses
      </Link>

      {/* Hero */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="h-40 bg-gradient-to-br from-blue-600/20 via-violet-500/20 to-purple-600/10 flex items-center justify-center relative">
          <BookOpen className="w-16 h-16 text-blue-400/40" />
          {isCompleted && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-emerald-500 text-white text-sm px-3 py-1 rounded-full font-medium">
              <Award className="w-4 h-4" /> Completed
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h1 className="text-xl font-bold">{course.title}</h1>
            <span className={cn("text-xs px-2.5 py-1 rounded-full flex-shrink-0", LEVEL_COLORS[course.level])}>
              {course.level.charAt(0) + course.level.slice(1).toLowerCase()}
            </span>
          </div>

          <p className="text-sm text-muted-foreground mb-5">{course.description}</p>

          {/* Meta strip */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground mb-6">
            {trainerName && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" /> {trainerName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Layers className="w-4 h-4" />
              {course.modules.length} modules · {totalLessons} lessons
            </span>
            {course.duration > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> {course.duration}h estimated
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Enrolled {formatDate(enrolledAt)}
            </span>
          </div>

          {/* Tags */}
          {course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {course.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-muted text-muted-foreground px-2.5 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">
                {completedCount} of {totalLessons} lessons completed
              </span>
              <span className={cn("font-semibold", isCompleted ? "text-emerald-500" : "text-primary")}>
                {Math.round(progressPct)}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div
                className={cn(
                  "h-2.5 rounded-full transition-all",
                  isCompleted ? "bg-emerald-500" : "progress-gradient"
                )}
                style={{ width: `${Math.min(Math.round(progressPct), 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Module / lesson list */}
      <div>
        <h2 className="font-semibold mb-3">Course Content</h2>

        {course.modules.length === 0 ? (
          <div className="text-center py-14 bg-card border border-border rounded-xl">
            <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">
              No modules have been added yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {course.modules.map((mod, modIdx) => {
              const modCompleted = mod.lessons.every((l) =>
                completedLessonIds.has(l.id)
              );
              const modCompletedCount = mod.lessons.filter((l) =>
                completedLessonIds.has(l.id)
              ).length;

              return (
                <div
                  key={mod.id}
                  className="bg-card border border-border rounded-xl overflow-hidden"
                >
                  {/* Module header */}
                  <div className="flex items-center gap-4 px-5 py-4 bg-muted/20 border-b border-border">
                    <div
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-sm font-bold",
                        modCompleted
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-primary/10 text-primary"
                      )}
                    >
                      {modCompleted ? <CheckCircle className="w-4 h-4" /> : modIdx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm">{mod.title}</div>
                      {mod.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {mod.description}
                        </p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex-shrink-0">
                      {modCompletedCount}/{mod.lessons.length} done
                    </div>
                  </div>

                  {/* Lessons */}
                  {mod.lessons.length === 0 ? (
                    <div className="px-5 py-5 text-xs text-muted-foreground">
                      No lessons yet
                    </div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {mod.lessons.map((lesson, lessonIdx) => {
                        const Icon = LESSON_ICONS[lesson.type] ?? FileText;
                        const iconColor = LESSON_TYPE_COLORS[lesson.type] ?? "text-muted-foreground bg-muted";
                        const done = completedLessonIds.has(lesson.id);
                        // Lock lessons after the first uncompleted one
                        const previousDone =
                          lessonIdx === 0
                            ? true
                            : completedLessonIds.has(mod.lessons[lessonIdx - 1].id);
                        const locked = !lesson.isFree && !done && !previousDone;

                        return (
                          <div
                            key={lesson.id}
                            className={cn(
                              "flex items-center gap-4 px-5 py-3.5 transition-colors",
                              locked
                                ? "opacity-50"
                                : "hover:bg-muted/30 cursor-pointer group"
                            )}
                          >
                            {/* Type icon */}
                            <div
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                                done ? "bg-emerald-500/10" : iconColor
                              )}
                            >
                              {done ? (
                                <CheckCircle className="w-4 h-4 text-emerald-500" />
                              ) : locked ? (
                                <Lock className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <Icon className="w-4 h-4" />
                              )}
                            </div>

                            {/* Title + meta */}
                            <div className="flex-1 min-w-0">
                              <div
                                className={cn(
                                  "text-sm font-medium",
                                  done && "line-through text-muted-foreground"
                                )}
                              >
                                {lesson.title}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-muted-foreground">
                                  {lesson.type.charAt(0) +
                                    lesson.type.slice(1).toLowerCase()}
                                </span>
                                {lesson.duration && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-2.5 h-2.5" />
                                    {lesson.duration} min
                                  </span>
                                )}
                                {lesson.isFree && (
                                  <span className="text-xs bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">
                                    Free
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Play/done indicator */}
                            {!locked && (
                              <div
                                className={cn(
                                  "flex-shrink-0",
                                  done
                                    ? "text-emerald-500"
                                    : "text-muted-foreground group-hover:text-primary transition-colors"
                                )}
                              >
                                {done ? (
                                  <CheckCircle className="w-4 h-4" />
                                ) : (
                                  <Play className="w-4 h-4" />
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
            })}
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/student/courses"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> All Courses
        </Link>
        {isCompleted ? (
          <Link
            href="/student/certificates"
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors"
          >
            <Award className="w-4 h-4" /> View Certificate
          </Link>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium">
            <Play className="w-4 h-4" /> Keep Learning
            <ChevronRight className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
}
