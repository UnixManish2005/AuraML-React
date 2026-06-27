// ============================================================
// TRAINER DASHBOARD
// ============================================================

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { Users, HelpCircle, BarChart3, Trophy, TrendingUp, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";

async function getTrainerData(userId: string) {
  const trainer = await db.trainer.findUnique({
    where: { userId },
    include: {
      batches: {
        include: {
          course: { select: { title: true } },
          _count: { select: { batchStudents: true } },
        },
        where: { status: { in: ["ACTIVE", "UPCOMING"] } },
        take: 5,
      },
      quizzes: {
        include: { _count: { select: { attempts: true, questions: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!trainer) return null;

  // Get quiz statistics for this trainer
  const [totalAttempts, passedAttempts] = await Promise.all([
    db.quizAttempt.count({
      where: { quiz: { trainerId: trainer.id }, status: "COMPLETED" },
    }),
    db.quizAttempt.count({
      where: { quiz: { trainerId: trainer.id }, status: "COMPLETED", passed: true },
    }),
  ]);

  const totalStudents = trainer.batches.reduce((s, b) => s + b._count.batchStudents, 0);

  return { trainer, totalStudents, totalAttempts, passedAttempts };
}

export default async function TrainerDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const data = await getTrainerData(session.user.id);
  if (!data) redirect("/auth/login");

  const { trainer, totalStudents, totalAttempts, passedAttempts } = data;
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome, {session.user.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Here&apos;s an overview of your training activity</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Batches", value: trainer.batches.length, icon: Users, color: "text-blue-500 bg-blue-500/10" },
          { label: "My Students", value: totalStudents, icon: Users, color: "text-violet-500 bg-violet-500/10" },
          { label: "Quiz Attempts", value: totalAttempts, icon: HelpCircle, color: "text-amber-500 bg-amber-500/10" },
          { label: "Pass Rate", value: `${passRate}%`, icon: Trophy, color: "text-emerald-500 bg-emerald-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Batches */}
        <div className="bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">My Batches</h2>
            <Link href="/trainer/batches" className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {trainer.batches.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">No active batches</div>
          ) : (
            <div className="divide-y divide-border">
              {trainer.batches.map((batch) => (
                <div key={batch.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{batch.name}</div>
                    <div className="text-xs text-muted-foreground">{batch.course.title}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-medium">{batch._count.batchStudents}</div>
                    <div className="text-xs text-muted-foreground">students</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="bg-card border border-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">My Quizzes</h2>
            <Link href="/trainer/quizzes" className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {trainer.quizzes.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-muted-foreground text-sm mb-3">No quizzes created yet</p>
              <Link href="/trainer/quizzes/create" className="text-sm text-primary hover:underline">
                Create your first quiz
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {trainer.quizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-5 h-5 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{quiz.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {quiz._count.questions} questions • {quiz._count.attempts} attempts
                    </div>
                  </div>
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    quiz.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                  )}>
                    {quiz.isPublished ? "Live" : "Draft"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
