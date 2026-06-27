// ============================================================
// QUIZ ATTEMPT PAGE - Full timed quiz engine
// ============================================================

"use client";

import { useState, useEffect, useCallback, use } from "react";
import { Timer, ChevronLeft, ChevronRight, Flag, Send, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn, formatSeconds } from "@/lib/utils";

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  marks: number;
  order: number;
}

interface QuizData {
  id: string;
  title: string;
  duration: number;
  passingScore: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeValue: number;
  questions: Question[];
  instructions?: string;
}

interface QuizResult {
  score: number;
  percentage: number;
  passed: boolean;
  totalMarks: number;
  correct: number;
  wrong: number;
  skipped: number;
}

export default function QuizAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<"loading" | "instructions" | "active" | "review" | "results">("loading");
  const [result, setResult] = useState<QuizResult | null>(null);
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  // Load quiz
  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setQuiz(data.quiz);
        setTimeLeft(data.quiz.duration * 60);
        setPhase("instructions");
      })
      .catch(() => toast.error("Failed to load quiz"));
  }, [id]);

  // Timer
  useEffect(() => {
    if (phase !== "active" || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [phase, timeLeft]);

  const submitQuiz = useCallback(async () => {
    if (submitting || !quiz) return;
    setSubmitting(true);
    setPhase("review");

    try {
      const res = await fetch(`/api/quizzes/${id}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, timeTaken: quiz.duration * 60 - timeLeft }),
      });
      const data = await res.json();
      setResult(data.result);
      setPhase("results");
    } catch {
      toast.error("Submission failed. Please try again.");
      setPhase("active");
    } finally {
      setSubmitting(false);
    }
  }, [id, answers, quiz, timeLeft, submitting]);

  function handleAnswer(questionId: string, value: string, multi = false) {
    setAnswers((prev) => {
      if (multi) {
        const current = (prev[questionId] as string[]) || [];
        const updated = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [questionId]: updated };
      }
      return { ...prev, [questionId]: value };
    });
  }

  function toggleFlag(qId: string) {
    setFlagged((prev) => {
      const next = new Set(prev);
      next.has(qId) ? next.delete(qId) : next.add(qId);
      return next;
    });
  }

  if (phase === "loading") {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (phase === "instructions" && quiz) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-card border border-border rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{quiz.title}</h1>
            <p className="text-muted-foreground">Read the instructions carefully before starting</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Questions", value: quiz.questions.length },
              { label: "Duration", value: `${quiz.duration} min` },
              { label: "Passing Score", value: `${quiz.passingScore}%` },
            ].map((s) => (
              <div key={s.label} className="text-center p-4 bg-muted/50 rounded-xl">
                <div className="text-2xl font-bold text-primary">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-3 mb-8 text-sm text-muted-foreground">
            {[
              "Once started, the timer cannot be paused.",
              quiz.negativeMarking ? `Wrong answers deduct ${quiz.negativeValue} marks.` : "No negative marking.",
              "You can navigate between questions freely.",
              "Flag questions to review them later.",
              "Submit before time runs out — auto-submitted at 0:00.",
              quiz.instructions,
            ].filter(Boolean).map((rule, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                <div className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">
                  {i + 1}
                </div>
                <span>{rule}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase("active")}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
          >
            Start Quiz →
          </button>
        </div>
      </div>
    );
  }

  if (phase === "results" && result) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-slide-up">
        <div className={cn(
          "bg-card border-2 rounded-2xl p-8 text-center",
          result.passed ? "border-emerald-500/30" : "border-red-500/30"
        )}>
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4",
            result.passed ? "bg-emerald-500/10" : "bg-red-500/10"
          )}>
            {result.passed
              ? <CheckCircle className="w-10 h-10 text-emerald-500" />
              : <XCircle className="w-10 h-10 text-red-500" />}
          </div>
          <h1 className="text-2xl font-bold mb-1">{result.passed ? "Quiz Passed! 🎉" : "Better luck next time"}</h1>
          <p className="text-muted-foreground mb-6">
            {result.passed ? "Excellent work! Keep up the momentum." : "Review the material and try again."}
          </p>

          <div className="text-6xl font-bold mb-2 text-primary">{Math.round(result.percentage)}%</div>
          <div className="text-muted-foreground text-sm">
            {result.score} / {result.totalMarks} marks
          </div>

          <div className="grid grid-cols-3 gap-4 mt-8">
            {[
              { label: "Correct", value: result.correct, color: "text-emerald-500" },
              { label: "Wrong", value: result.wrong, color: "text-red-500" },
              { label: "Skipped", value: result.skipped, color: "text-muted-foreground" },
            ].map((s) => (
              <div key={s.label} className="bg-muted/50 rounded-xl p-4">
                <div className={cn("text-3xl font-bold", s.color)}>{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push("/student/quizzes")}
            className="flex-1 py-3 border border-border rounded-xl hover:bg-muted transition-colors text-sm"
          >
            Back to Quizzes
          </button>
          <button
            onClick={() => router.push("/student")}
            className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const currentQuestion = quiz.questions[currentQ];
  const answered = Object.keys(answers).length;
  const timerDanger = timeLeft < 60;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      {/* Quiz header */}
      <div className="flex items-center justify-between bg-card border border-border rounded-xl px-5 py-3">
        <div>
          <h2 className="font-semibold text-sm">{quiz.title}</h2>
          <p className="text-xs text-muted-foreground">
            Q {currentQ + 1} of {quiz.questions.length} • {answered} answered
          </p>
        </div>

        <div className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg",
          timerDanger ? "bg-red-500/10 text-red-500 animate-pulse" : "bg-muted"
        )}>
          <Timer className="w-4 h-4" />
          {formatSeconds(timeLeft)}
        </div>

        <button
          onClick={() => {
            if (confirm("Submit quiz now?")) submitQuiz();
          }}
          disabled={submitting}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <Send className="w-4 h-4" />
          {submitting ? "Submitting..." : "Submit"}
        </button>
      </div>

      <div className="grid lg:grid-cols-4 gap-4">
        {/* Question panel */}
        <div className="lg:col-span-3 bg-card border border-border rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded">
                  {currentQuestion.type.replace(/_/g, " ")}
                </span>
                <span className="text-xs text-muted-foreground">{currentQuestion.marks} mark{currentQuestion.marks !== 1 ? "s" : ""}</span>
              </div>
              <p className="text-base font-medium leading-relaxed">{currentQuestion.question}</p>
            </div>
            <button
              onClick={() => toggleFlag(currentQuestion.id)}
              className={cn(
                "p-2 rounded-lg transition-colors flex-shrink-0 ml-4",
                flagged.has(currentQuestion.id) ? "bg-amber-500/10 text-amber-500" : "hover:bg-muted text-muted-foreground"
              )}
            >
              <Flag className="w-4 h-4" />
            </button>
          </div>

          {/* MCQ / SCENARIO */}
          {(currentQuestion.type === "MCQ" || currentQuestion.type === "SCENARIO") && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((opt, i) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(currentQuestion.id, opt)}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                    answers[currentQuestion.id] === opt
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/80 hover:bg-muted/50"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium flex-shrink-0",
                    answers[currentQuestion.id] === opt ? "border-primary bg-primary text-primary-foreground" : "border-border"
                  )}>
                    {String.fromCharCode(65 + i)}
                  </div>
                  <span className="text-sm">{opt}</span>
                </button>
              ))}
            </div>
          )}

          {/* MULTIPLE SELECT */}
          {currentQuestion.type === "MULTIPLE_SELECT" && currentQuestion.options && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground mb-3">Select all that apply</p>
              {currentQuestion.options.map((opt, i) => {
                const selected = ((answers[currentQuestion.id] as string[]) || []).includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(currentQuestion.id, opt, true)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                      selected ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                      selected ? "border-primary bg-primary" : "border-border"
                    )}>
                      {selected && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="text-sm">{opt}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TRUE / FALSE */}
          {currentQuestion.type === "TRUE_FALSE" && (
            <div className="flex gap-4">
              {["True", "False"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(currentQuestion.id, opt)}
                  className={cn(
                    "flex-1 py-5 rounded-xl border-2 text-lg font-semibold transition-all",
                    answers[currentQuestion.id] === opt
                      ? opt === "True" ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : "border-red-500 bg-red-500/10 text-red-500"
                      : "border-border hover:bg-muted"
                  )}
                >
                  {opt === "True" ? "✓ True" : "✗ False"}
                </button>
              ))}
            </div>
          )}

          {/* FILL_BLANK / CODING */}
          {(currentQuestion.type === "FILL_BLANK" || currentQuestion.type === "CODING") && (
            <div>
              {currentQuestion.type === "CODING" && (
                <div className="bg-muted/30 rounded-lg p-3 mb-3 text-xs text-muted-foreground font-mono">
                  # Write your answer below
                </div>
              )}
              <textarea
                value={(answers[currentQuestion.id] as string) || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                rows={currentQuestion.type === "CODING" ? 8 : 2}
                placeholder={currentQuestion.type === "CODING" ? "# Write your code here..." : "Type your answer..."}
                className={cn(
                  "w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:border-primary/50 resize-none text-sm",
                  currentQuestion.type === "CODING" && "font-mono"
                )}
              />
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              className="flex items-center gap-2 px-5 py-2.5 border border-border rounded-xl hover:bg-muted text-sm disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <button
              onClick={() => setCurrentQ((q) => Math.min(quiz.questions.length - 1, q + 1))}
              disabled={currentQ === quiz.questions.length - 1}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 text-sm disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Question navigator */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Questions</h3>
          <div className="grid grid-cols-5 lg:grid-cols-4 gap-1.5">
            {quiz.questions.map((q, i) => {
              const isAnswered = !!answers[q.id];
              const isFlagged = flagged.has(q.id);
              const isCurrent = i === currentQ;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentQ(i)}
                  className={cn(
                    "aspect-square rounded-lg text-xs font-medium transition-all",
                    isCurrent ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1" :
                    isFlagged ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                    isAnswered ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30" :
                    "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-4 space-y-1.5 text-xs">
            {[
              { color: "bg-emerald-500/20 border-emerald-500/30", label: "Answered" },
              { color: "bg-amber-500/20 border-amber-500/30", label: "Flagged" },
              { color: "bg-muted", label: "Not answered" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2 text-muted-foreground">
                <div className={cn("w-4 h-4 rounded border", l.color)} />
                {l.label}
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground mb-1">Progress</div>
            <div className="w-full bg-muted rounded-full h-1.5 mb-1">
              <div
                className="bg-primary h-1.5 rounded-full transition-all"
                style={{ width: `${(answered / quiz.questions.length) * 100}%` }}
              />
            </div>
            <div className="text-xs text-muted-foreground">{answered}/{quiz.questions.length} answered</div>
          </div>
        </div>
      </div>
    </div>
  );
}
