// ============================================================
// ADMIN QUIZZES PAGE
// ============================================================

import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/helpers";
import Link from "next/link";
import { Plus, HelpCircle, Users, CheckCircle, Eye, Edit, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import QuizListActions from "@/components/quiz/quiz-list-actions";

export const metadata = { title: "Quizzes" };

async function getQuizzes() {
  return db.quiz.findMany({
    include: {
      _count: { select: { questions: true, attempts: true } },
      course: { select: { title: true } },
      batch: { select: { name: true } },
      trainer: { include: { user: { select: { name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminQuizzesPage() {
  await requireAdmin();
  const quizzes = await getQuizzes();

  const stats = {
    total: quizzes.length,
    published: quizzes.filter((q) => q.isPublished).length,
    totalAttempts: quizzes.reduce((s, q) => s + q._count.attempts, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quizzes</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage assessments</p>
        </div>
        <Link
          href="/admin/quizzes/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Create Quiz
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Quizzes", value: stats.total, icon: HelpCircle, color: "text-blue-500 bg-blue-500/10" },
          { label: "Published", value: stats.published, icon: Eye, color: "text-emerald-500 bg-emerald-500/10" },
          { label: "Total Attempts", value: stats.totalAttempts, icon: Users, color: "text-violet-500 bg-violet-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-5 flex items-center gap-4">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", s.color)}>
              <s.icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quizzes table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="font-medium">All Quizzes</h2>
          <span className="text-sm text-muted-foreground">{quizzes.length} quizzes</span>
        </div>

        {quizzes.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">No quizzes created yet</p>
            <Link href="/admin/quizzes/create" className="text-sm text-primary hover:underline">
              Create your first quiz
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Quiz</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Course/Batch</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Questions</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Attempts</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Created</th>
                <th className="w-24 px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-sm">{quiz.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {quiz.duration} min • {quiz.passingScore}% pass • {quiz.totalMarks} marks
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {quiz.course?.title || quiz.batch?.name || "—"}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm">
                      <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                      {quiz._count.questions}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm">
                      <Users className="w-3.5 h-3.5 text-muted-foreground" />
                      {quiz._count.attempts}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                      quiz.isPublished ? "bg-emerald-500/10 text-emerald-600" : "bg-muted text-muted-foreground"
                    )}>
                      {quiz.isPublished ? <><CheckCircle className="w-3 h-3" /> Published</> : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                    {formatDate(quiz.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                      <QuizListActions quizId={quiz.id} isPublished={quiz.isPublished} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
