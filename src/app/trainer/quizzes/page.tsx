// ============================================================
// TRAINER QUIZZES PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import {
  Plus, HelpCircle, Users, Eye, Edit2, Trash2,
  ToggleLeft, ToggleRight, Search, CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { formatDate, cn } from "@/lib/utils";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  passingScore: number;
  totalMarks: number;
  isPublished: boolean;
  createdAt: string;
  course: { title: string } | null;
  batch: { name: string } | null;
  _count: { questions: number; attempts: number };
}

export default function TrainerQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/quizzes")
      .then((r) => r.json())
      .then((d) => {
        setQuizzes(d.quizzes || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function togglePublish(id: string, current: boolean) {
    try {
      const res = await fetch(`/api/quizzes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !current }),
      });
      if (!res.ok) throw new Error();
      setQuizzes((prev) =>
        prev.map((q) => (q.id === id ? { ...q, isPublished: !current } : q))
      );
      toast.success(current ? "Quiz unpublished" : "Quiz is now live!");
    } catch {
      toast.error("Failed to update quiz");
    }
  }

  async function deleteQuiz(id: string) {
    if (!confirm("Delete this quiz? All student attempts will also be removed.")) return;
    try {
      const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setQuizzes((prev) => prev.filter((q) => q.id !== id));
      toast.success("Quiz deleted");
    } catch {
      toast.error("Failed to delete quiz");
    }
  }

  const filtered = quizzes.filter(
    (q) =>
      q.title.toLowerCase().includes(search.toLowerCase()) ||
      q.course?.title.toLowerCase().includes(search.toLowerCase()) ||
      q.batch?.name.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: quizzes.length,
    published: quizzes.filter((q) => q.isPublished).length,
    attempts: quizzes.reduce((s, q) => s + q._count.attempts, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Quizzes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create and manage your assessments
          </p>
        </div>
        <Link
          href="/trainer/quizzes/create"
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
          { label: "Total Attempts", value: stats.attempts, icon: Users, color: "text-violet-500 bg-violet-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0", s.color)}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xl font-bold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search quizzes..."
          className="w-full pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl focus:outline-none focus:border-primary/50"
        />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-medium text-sm">All Quizzes</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} quizzes</span>
        </div>

        {loading ? (
          <div className="space-y-3 p-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm mb-4">No quizzes yet</p>
            <Link
              href="/trainer/quizzes/create"
              className="text-sm text-primary hover:underline"
            >
              Create your first quiz
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Quiz</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Linked To
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Questions
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">
                    Attempts
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">
                    Created
                  </th>
                  <th className="w-28 px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((quiz) => (
                  <tr
                    key={quiz.id}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-sm">{quiz.title}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {quiz.duration} min · {quiz.passingScore}% pass · {quiz.totalMarks} marks
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {quiz.course?.title || quiz.batch?.name || "—"}
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1.5 text-sm">
                        <HelpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                        {quiz._count.questions}
                      </span>
                    </td>
                    <td className="px-5 py-3 hidden lg:table-cell">
                      <span className="flex items-center gap-1.5 text-sm">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        {quiz._count.attempts}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                          quiz.isPublished
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {quiz.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Live
                          </>
                        ) : (
                          "Draft"
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-muted-foreground hidden md:table-cell">
                      {formatDate(quiz.createdAt)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/trainer/quizzes/${quiz.id}/edit`}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => togglePublish(quiz.id, quiz.isPublished)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-blue-500"
                          title={quiz.isPublished ? "Unpublish" : "Publish"}
                        >
                          {quiz.isPublished ? (
                            <ToggleRight className="w-3.5 h-3.5" />
                          ) : (
                            <ToggleLeft className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteQuiz(quiz.id)}
                          className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-red-500"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
