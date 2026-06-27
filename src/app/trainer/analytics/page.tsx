// ============================================================
// TRAINER ANALYTICS PAGE
// ============================================================

import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { BarChart3, Users, HelpCircle, Trophy, TrendingUp, Award } from "lucide-react";
import { cn } from "@/lib/utils";

async function getTrainerAnalytics(userId: string) {
  const trainer = await db.trainer.findUnique({
    where: { userId },
    include: {
      batches: {
        include: { _count: { select: { batchStudents: true } } },
      },
      quizzes: {
        include: { _count: { select: { attempts: true, questions: true } } },
      },
    },
  });

  if (!trainer) return null;

  const [totalAttempts, passedAttempts, avgScoreResult] = await Promise.all([
    db.quizAttempt.count({
      where: { quiz: { trainerId: trainer.id }, status: "COMPLETED" },
    }),
    db.quizAttempt.count({
      where: { quiz: { trainerId: trainer.id }, status: "COMPLETED", passed: true },
    }),
    db.quizAttempt.aggregate({
      where: { quiz: { trainerId: trainer.id }, status: "COMPLETED" },
      _avg: { percentage: true },
    }),
  ]);

  const totalStudents = trainer.batches.reduce(
    (s, b) => s + b._count.batchStudents,
    0
  );
  const passRate =
    totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;
  const avgScore = Math.round(avgScoreResult._avg.percentage ?? 0);

  return { trainer, totalStudents, totalAttempts, passRate, avgScore };
}

export const metadata = { title: "My Analytics" };

export default async function TrainerAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const data = await getTrainerAnalytics(session.user.id);
  if (!data) redirect("/auth/login");

  const { trainer, totalStudents, totalAttempts, passRate, avgScore } = data;

  const statCards = [
    {
      label: "Total Batches",
      value: trainer.batches.length,
      icon: Users,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "text-violet-500 bg-violet-500/10",
    },
    {
      label: "Quiz Attempts",
      value: totalAttempts,
      icon: HelpCircle,
      color: "text-amber-500 bg-amber-500/10",
    },
    {
      label: "Pass Rate",
      value: `${passRate}%`,
      icon: Trophy,
      color: "text-emerald-500 bg-emerald-500/10",
    },
    {
      label: "Avg Score",
      value: `${avgScore}%`,
      icon: TrendingUp,
      color: "text-cyan-500 bg-cyan-500/10",
    },
    {
      label: "Total Quizzes",
      value: trainer.quizzes.length,
      icon: Award,
      color: "text-pink-500 bg-pink-500/10",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your teaching performance at a glance
        </p>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5">
            <div
              className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center mb-3",
                s.color
              )}
            >
              <s.icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Per-quiz breakdown */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold">Quiz Breakdown</h2>
          </div>
          {trainer.quizzes.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No quizzes created yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {trainer.quizzes.map((quiz) => (
                <div key={quiz.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                    <HelpCircle className="w-4 h-4 text-violet-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{quiz.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {quiz._count.questions} questions
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold">{quiz._count.attempts}</div>
                    <div className="text-xs text-muted-foreground">attempts</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Per-batch breakdown */}
        <div className="bg-card border border-border rounded-xl">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold">Batch Breakdown</h2>
          </div>
          {trainer.batches.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No batches assigned yet
            </div>
          ) : (
            <div className="divide-y divide-border">
              {trainer.batches.map((batch) => (
                <div key={batch.id} className="flex items-center gap-4 px-5 py-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{batch.name}</div>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        batch.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : batch.status === "UPCOMING"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {batch.status.charAt(0) + batch.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-semibold">
                      {batch._count.batchStudents}
                    </div>
                    <div className="text-xs text-muted-foreground">students</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pass rate progress bar */}
      {totalAttempts > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Overall Pass Rate</h2>
            <span className="text-2xl font-bold text-emerald-500">{passRate}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className={cn(
                "h-3 rounded-full transition-all",
                passRate >= 70
                  ? "bg-emerald-500"
                  : passRate >= 50
                  ? "bg-amber-500"
                  : "bg-red-500"
              )}
              style={{ width: `${passRate}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Based on {totalAttempts} completed quiz attempt
            {totalAttempts !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
