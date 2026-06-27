// ============================================================
// STUDENT MY COURSES PAGE
// ============================================================

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, Play, Clock, Layers, ChevronRight,
  CheckCircle, User, Calendar,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

async function getEnrolledCourses(userId: string) {
  const student = await db.student.findUnique({ where: { userId } });
  if (!student) return [];

  const enrollments = await db.batchStudent.findMany({
    where: { studentId: student.id, isActive: true },
    include: {
      batch: {
        include: {
          course: {
            include: {
              modules: {
                include: {
                  _count: { select: { lessons: true } },
                },
              },
              _count: { select: { modules: true } },
            },
          },
          trainer: {
            include: { user: { select: { name: true } } },
          },
        },
      },
    },
    orderBy: { joinedAt: "desc" },
  });

  // Fetch real progress for each course
  const courseIds = enrollments.map((e) => e.batch.courseId);
  const progressRecords = await db.studentProgress.findMany({
    where: {
      studentId: student.id,
      courseId: { in: courseIds },
      lessonId: null, // course-level progress rows
    },
  });
  const progressMap = new Map(progressRecords.map((p) => [p.courseId, p]));

  // Calculate total lessons per course
  return enrollments.map(({ batch, joinedAt }) => {
    const totalLessons = batch.course.modules.reduce(
      (s, m) => s + m._count.lessons,
      0
    );
    const progress = progressMap.get(batch.courseId);
    const progressPct = progress?.percentage ?? 0;
    const isCompleted = progressPct >= 100;

    return {
      batchId: batch.id,
      courseId: batch.courseId,
      courseTitle: batch.course.title,
      courseDescription: batch.course.description,
      courseLevel: batch.course.level,
      courseDuration: batch.course.duration,
      courseTags: batch.course.tags,
      totalModules: batch.course._count.modules,
      totalLessons,
      batchName: batch.name,
      batchStatus: batch.status,
      trainerName: batch.trainer?.user.name ?? null,
      startDate: batch.startDate,
      endDate: batch.endDate,
      enrolledAt: joinedAt,
      progress: Math.round(progressPct),
      isCompleted,
    };
  });
}

const LEVEL_COLORS: Record<string, string> = {
  BEGINNER: "bg-green-500/10 text-green-600",
  INTERMEDIATE: "bg-yellow-500/10 text-yellow-600",
  ADVANCED: "bg-red-500/10 text-red-600",
};

const BATCH_STATUS_COLORS: Record<string, string> = {
  UPCOMING: "bg-blue-500/10 text-blue-600",
  ACTIVE: "bg-emerald-500/10 text-emerald-600",
  COMPLETED: "bg-muted text-muted-foreground",
  CANCELLED: "bg-red-500/10 text-red-600",
};

const LEVEL_EMOJI: Record<string, string> = {
  BEGINNER: "🌱",
  INTERMEDIATE: "⚡",
  ADVANCED: "🔥",
};

export const metadata = { title: "My Courses" };

export default async function StudentCoursesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const courses = await getEnrolledCourses(session.user.id);

  const inProgress = courses.filter((c) => c.progress > 0 && !c.isCompleted);
  const notStarted = courses.filter((c) => c.progress === 0);
  const completed = courses.filter((c) => c.isCompleted);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">My Courses</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your enrolled courses and learning progress
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Enrolled", value: courses.length, color: "text-blue-500" },
          { label: "In Progress", value: inProgress.length, color: "text-amber-500" },
          { label: "Completed", value: completed.length, color: "text-emerald-500" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-2xl">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-xl font-semibold mb-2">No courses yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            You haven&apos;t been enrolled in any courses. Contact your admin to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* In Progress */}
          {inProgress.length > 0 && (
            <section>
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Continue Learning
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {inProgress.map((c) => (
                  <CourseCard key={c.courseId} course={c} highlight />
                ))}
              </div>
            </section>
          )}

          {/* Not started */}
          {notStarted.length > 0 && (
            <section>
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Not Started
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {notStarted.map((c) => (
                  <CourseCard key={c.courseId} course={c} />
                ))}
              </div>
            </section>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <section>
              <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-3">
                Completed
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {completed.map((c) => (
                  <CourseCard key={c.courseId} course={c} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ---- Course Card Component ----
function CourseCard({
  course,
  highlight = false,
}: {
  course: Awaited<ReturnType<typeof getEnrolledCourses>>[number];
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-card border rounded-xl overflow-hidden hover:border-border/80 transition-all group",
        highlight ? "border-primary/30" : "border-border"
      )}
    >
      {/* Gradient thumbnail */}
      <div className="h-24 bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center relative">
        <span className="text-4xl">{LEVEL_EMOJI[course.courseLevel] ?? "📘"}</span>
        {course.isCompleted && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
            <CheckCircle className="w-3 h-3" /> Done
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Title + level */}
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-sm line-clamp-1 flex-1">
            {course.courseTitle}
          </h3>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full flex-shrink-0",
              LEVEL_COLORS[course.courseLevel]
            )}
          >
            {course.courseLevel.charAt(0) + course.courseLevel.slice(1).toLowerCase()}
          </span>
        </div>

        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {course.courseDescription}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3">
          {course.trainerName && (
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {course.trainerName}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {course.totalModules} modules · {course.totalLessons} lessons
          </span>
          {course.courseDuration > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course.courseDuration}h
            </span>
          )}
        </div>

        {/* Batch info */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              BATCH_STATUS_COLORS[course.batchStatus]
            )}
          >
            {course.batchName}
          </span>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Joined {formatDate(course.enrolledAt)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span
              className={cn(
                "font-medium",
                course.isCompleted
                  ? "text-emerald-500"
                  : course.progress > 0
                  ? "text-blue-500"
                  : ""
              )}
            >
              {course.progress}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className={cn(
                "h-1.5 rounded-full transition-all",
                course.isCompleted
                  ? "bg-emerald-500"
                  : "progress-gradient"
              )}
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/student/courses/${course.courseId}`}
          className={cn(
            "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium transition-all",
            course.isCompleted
              ? "border border-border hover:bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
        >
          {course.isCompleted ? (
            <>Review Course <ChevronRight className="w-4 h-4" /></>
          ) : course.progress > 0 ? (
            <>Continue <Play className="w-4 h-4" /></>
          ) : (
            <>Start Learning <Play className="w-4 h-4" /></>
          )}
        </Link>
      </div>
    </div>
  );
}
