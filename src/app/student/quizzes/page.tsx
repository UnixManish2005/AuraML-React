// ============================================================
// STUDENT QUIZZES PAGE
// ============================================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, Clock, Target, CheckCircle, XCircle, Lock, ChevronRight, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quiz {
  id: string;
  title: string;
  description?: string;
  duration: number;
  passingScore: number;
  totalMarks: number;
  maxAttempts: number;
  _count: { questions: number; attempts: number };
  course?: { title: string };
  userAttempt?: {
    status: string;
    percentage: number;
    passed: boolean;
  } | null;
}

const DIFF_LABELS = ["", "Easy", "Easy+", "Medium", "Hard", "Expert"];

export default function StudentQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "completed" | "passed">("all");

  useEffect(() => {
    fetch("/api/quizzes?published=true")
      .then((r) => r.json())
      .then((d) => { setQuizzes(d.quizzes || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = quizzes.filter((q) => {
    if (filter === "pending") return !q.userAttempt;
    if (filter === "completed") return !!q.userAttempt;
    if (filter === "passed") return q.userAttempt?.passed;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Quizzes</h1>
        <p className="text-muted-foreground text-sm mt-1">Test your knowledge and earn certificates</p>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        {(["all", "pending", "completed", "passed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm capitalize transition-colors",
              filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No quizzes found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((quiz) => {
            const attempted = !!quiz.userAttempt;
            const passed = quiz.userAttempt?.passed;

            return (
              <div
                key={quiz.id}
                className="bg-card border border-border rounded-xl p-5 flex flex-col hover:border-border/80 transition-all group"
              >
                {/* Status badge */}
                <div className="flex items-start justify-between mb-4">
                  <div className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                    passed ? "bg-emerald-500/10 text-emerald-600" :
                    attempted ? "bg-red-500/10 text-red-600" :
                    "bg-blue-500/10 text-blue-600"
                  )}>
                    {passed ? <><CheckCircle className="w-3 h-3" /> Passed</> :
                     attempted ? <><XCircle className="w-3 h-3" /> Failed</> :
                     <><HelpCircle className="w-3 h-3" /> New</>}
                  </div>
                  {quiz.course && (
                    <span className="text-xs text-muted-foreground truncate ml-2">{quiz.course.title}</span>
                  )}
                </div>

                <h3 className="font-semibold mb-2 line-clamp-2">{quiz.title}</h3>
                {quiz.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{quiz.description}</p>
                )}

                {/* Meta */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4 mt-auto">
                  <span className="flex items-center gap-1">
                    <HelpCircle className="w-3 h-3" /> {quiz._count.questions} Qs
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {quiz.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" /> Pass: {quiz.passingScore}%
                  </span>
                </div>

                {/* Score if attempted */}
                {quiz.userAttempt && (
                  <div className="mb-4 p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Score</span>
                      <span className={cn(
                        "font-bold",
                        passed ? "text-emerald-500" : "text-red-500"
                      )}>
                        {Math.round(quiz.userAttempt.percentage)}%
                      </span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5 mt-2">
                      <div
                        className={cn("h-1.5 rounded-full", passed ? "bg-emerald-500" : "bg-red-500")}
                        style={{ width: `${quiz.userAttempt.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* CTA */}
                <Link
                  href={`/student/quizzes/${quiz.id}/attempt`}
                  className={cn(
                    "flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all",
                    attempted
                      ? "border border-border hover:bg-muted"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  )}
                >
                  {attempted ? "Retake Quiz" : "Start Quiz"}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
