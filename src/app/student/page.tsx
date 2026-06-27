// ============================================================
// STUDENT DASHBOARD
// ============================================================

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BookOpen, HelpCircle, Award, Flame, Star, TrendingUp, Clock, ChevronRight, Play, Target, Bell, Pin } from "lucide-react";
import Link from "next/link";
import { formatDate, formatDuration, percentage, getScoreColor, cn } from "@/lib/utils";

async function getStudentData(userId: string) {
  const [student, enrolledBatches, recentAttempts, certificates, analytics,announcements] = await Promise.all([
    db.student.findUnique({
      where: { userId },
      include: { user: true },
    }),
    db.batchStudent.findMany({
      where: { studentId: (await db.student.findUnique({ where: { userId } }))?.id || "" },
      include: {
        batch: {
          include: {
            course: { select: { id: true, title: true, thumbnail: true, modules: { select: { _count: { select: { lessons: true } } } } } },
            trainer: { include: { user: { select: { name: true } } } },
          },
        },
      },
      take: 5,
    }),
    db.quizAttempt.findMany({
      where: { userId, status: "COMPLETED" },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: { quiz: { select: { title: true, passingScore: true } } },
    }),
    db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: "desc" },
      take: 3,
    }),
    db.userAnalytics.findUnique({ where: { userId } }),
    db.announcement.findMany({
      where: {
        isPublished: true,
        targetRoles: { has: "STUDENT" },
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      include: { author: { select: { name: true } } },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      take: 5,
    }),
  ]);

  return { student, enrolledBatches, recentAttempts, certificates, analytics, announcements };
}

export default async function StudentDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { student, enrolledBatches, recentAttempts, certificates, analytics, announcements } = await getStudentData(session.user.id);

  const avgScore = recentAttempts.length
    ? Math.round(recentAttempts.reduce((s, a) => s + a.percentage, 0) / recentAttempts.length)
    : 0;

  const stats = [
    { label: "Courses Enrolled", value: enrolledBatches.length, icon: BookOpen, color: "text-blue-500 bg-blue-500/10" },
    { label: "Quizzes Taken", value: recentAttempts.length, icon: HelpCircle, color: "text-violet-500 bg-violet-500/10" },
    { label: "Certificates", value: certificates.length, icon: Award, color: "text-amber-500 bg-amber-500/10" },
    { label: "Avg Quiz Score", value: `${avgScore}%`, icon: Target, color: "text-emerald-500 bg-emerald-500/10" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Welcome back, {student?.user.name?.split(" ")[0] || "Student"}! 👋
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-3 py-1.5 rounded-full text-sm">
            <Flame className="w-4 h-4" />
            <span className="font-medium">{student?.streak || 0} day streak</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-3 py-1.5 rounded-full text-sm">
            <Star className="w-4 h-4" />
            <span className="font-medium">{student?.totalPoints || 0} pts</span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-xl p-5">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ── Announcements ── */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Bell className="w-4 h-4 text-muted-foreground" /> Announcements
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {announcements.map((ann) => {
              const TYPE_COLORS: Record<string, string> = {
                NOTICE: "bg-blue-500/10 text-blue-600 border-blue-200/50",
                EVENT: "bg-emerald-500/10 text-emerald-600 border-emerald-200/50",
                WORKSHOP: "bg-violet-500/10 text-violet-600 border-violet-200/50",
                HACKATHON: "bg-amber-500/10 text-amber-600 border-amber-200/50",
                PLACEMENT: "bg-cyan-500/10 text-cyan-600 border-cyan-200/50",
                GENERAL: "bg-muted text-muted-foreground border-border",
              };
              const TYPE_EMOJI: Record<string, string> = {
                NOTICE: "📋", EVENT: "🎉", WORKSHOP: "🔧",
                HACKATHON: "🏆", PLACEMENT: "💼", GENERAL: "📢",
              };
              const colorClass = TYPE_COLORS[ann.type] ?? TYPE_COLORS.GENERAL;
              return (
                <div
                  key={ann.id}
                  className={cn(
                    "bg-card border rounded-xl p-4 flex items-start gap-3",
                    ann.pinned ? "border-primary/30" : "border-border"
                  )}
                >
                  <span className="text-xl flex-shrink-0">{TYPE_EMOJI[ann.type] ?? "📢"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm">{ann.title}</span>
                      {ann.pinned && (
                        <span className="flex items-center gap-0.5 text-xs text-primary">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", colorClass)}>
                        {ann.type.charAt(0) + ann.type.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{ann.content}</p>
                    <p className="text-xs text-muted-foreground mt-1.5">By {ann.author.name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">My Courses</h2>
            <Link href="/student/courses" className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {enrolledBatches.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-10 text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">You are not enrolled in any courses yet</p>
              <Link href="/student/courses" className="mt-3 inline-flex items-center gap-1 text-sm text-blue-500 hover:text-blue-400">
                Browse courses <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {enrolledBatches.map(({ batch }) => {
                const totalLessons = batch.course.modules.reduce((sum, m) => sum + (m._count?.lessons || 0), 0);
                const progress = Math.floor(Math.random() * 80) + 10; // placeholder - replace with real progress

                return (
                  <div key={batch.id} className="bg-card border border-border rounded-xl p-4 hover:border-border/80 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                        🎓
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-sm truncate">{batch.course.title}</h3>
                          <span className="text-xs text-muted-foreground ml-2">{progress}%</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">
                          {batch.name} • {batch.trainer.user.name}
                        </p>
                        <div className="w-full bg-muted rounded-full h-1.5">
                          <div
                            className="progress-gradient h-1.5 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                      <Link
                        href={`/student/courses/${batch.courseId}`}
                        className="p-2 rounded-lg bg-primary/10 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Play className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent Quiz Results */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">Recent Quiz Results</h3>
              <Link href="/student/quizzes" className="text-xs text-blue-500 hover:text-blue-400">
                View all
              </Link>
            </div>

            {recentAttempts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No quizzes attempted yet</p>
            ) : (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div key={attempt.id} className="flex items-center gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0",
                      attempt.passed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                    )}>
                      {Math.round(attempt.percentage)}%
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{attempt.quiz.title}</div>
                      <div className={cn("text-xs", attempt.passed ? "text-emerald-500" : "text-red-500")}>
                        {attempt.passed ? "✓ Passed" : "✗ Failed"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Learning streak calendar (simplified) */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-4">This Week&apos;s Progress</h3>
            <div className="grid grid-cols-7 gap-1 mb-3">
              {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                <div key={i} className="text-center">
                  <div className="text-xs text-muted-foreground mb-1">{d}</div>
                  <div className={cn(
                    "w-full aspect-square rounded-md",
                    i < 5 ? "bg-blue-500/60" : i === 5 ? "bg-blue-500/20" : "bg-muted"
                  )} />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>5 days active this week</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-card border border-border rounded-xl p-5">
            <h3 className="font-semibold text-sm mb-3">Quick Access</h3>
            <div className="space-y-1">
              {[
                { label: "AI Tutor", href: "/student/ai-tutor", emoji: "🤖" },
                { label: "ML Lab", href: "/student/lab", emoji: "🔬" },
                { label: "Resume Builder", href: "/student/resume", emoji: "📄" },
                { label: "Project Generator", href: "/student/projects", emoji: "💡" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
                >
                  <span className="text-base">{link.emoji}</span>
                  <span className="text-sm font-medium">{link.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
