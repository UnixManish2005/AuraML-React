"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Save, Eye, EyeOff, Plus, Trash2, ChevronDown, ChevronUp,
  Timer, Target, ArrowLeft, CheckCircle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface QuestionData {
  id?: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  difficulty: number;
}

interface QuizData {
  id: string;
  title: string;
  description: string | null;
  courseId: string | null;
  batchId: string | null;
  duration: number;
  passingScore: number;
  totalMarks: number;
  negativeMarking: boolean;
  negativeValue: number;
  randomize: boolean;
  maxAttempts: number;
  isPublished: boolean;
  instructions: string | null;
  questions: Array<{
    id: string;
    type: string;
    question: string;
    options: unknown;
    correctAnswer: unknown;
    explanation: string | null;
    marks: number;
    difficulty: number;
    order: number;
  }>;
  course: { id: string; title: string } | null;
  batch: { id: string; name: string } | null;
}

const QUESTION_TYPES = [
  { value: "MCQ", label: "Multiple Choice (Single)" },
  { value: "MULTIPLE_SELECT", label: "Multiple Choice (Multi)" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "FILL_BLANK", label: "Fill in the Blank" },
  { value: "SCENARIO", label: "Scenario Based" },
  { value: "CODING", label: "Coding Question" },
];

function normalizeQuestion(q: QuizData["questions"][0]): QuestionData {
  const options = Array.isArray(q.options)
    ? (q.options as string[])
    : q.type === "TRUE_FALSE"
    ? ["True", "False"]
    : ["", "", "", ""];

  const correctAnswer =
    typeof q.correctAnswer === "string"
      ? q.correctAnswer
      : Array.isArray(q.correctAnswer)
      ? (q.correctAnswer as string[]).join(",")
      : String(q.correctAnswer ?? "");

  return {
    id: q.id,
    type: q.type,
    question: q.question,
    options,
    correctAnswer,
    explanation: q.explanation ?? "",
    marks: q.marks,
    difficulty: q.difficulty,
  };
}

export default function QuizEditor({ quiz }: { quiz: QuizData }) {
  const router = useRouter();

  const [title, setTitle] = useState(quiz.title);
  const [description, setDescription] = useState(quiz.description ?? "");
  const [duration, setDuration] = useState(quiz.duration);
  const [passingScore, setPassingScore] = useState(quiz.passingScore);
  const [totalMarks, setTotalMarks] = useState(quiz.totalMarks);
  const [negativeMarking, setNegativeMarking] = useState(quiz.negativeMarking);
  const [negativeValue, setNegativeValue] = useState(quiz.negativeValue);
  const [randomize, setRandomize] = useState(quiz.randomize);
  const [maxAttempts, setMaxAttempts] = useState(quiz.maxAttempts);
  const [instructions, setInstructions] = useState(quiz.instructions ?? "");
  const [isPublished, setIsPublished] = useState(quiz.isPublished);
  const [questions, setQuestions] = useState<QuestionData[]>(
    quiz.questions.map(normalizeQuestion)
  );
  const [expandedQ, setExpandedQ] = useState<number | null>(
    quiz.questions.length === 0 ? null : 0
  );
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "questions">("settings");

  function addQuestion() {
    const newQ: QuestionData = {
      type: "MCQ",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "",
      explanation: "",
      marks: 1,
      difficulty: 1,
    };
    setQuestions((prev) => [...prev, newQ]);
    setExpandedQ(questions.length);
    setActiveTab("questions");
  }

  function removeQuestion(i: number) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
    setExpandedQ(null);
  }

  function updateQuestion(i: number, field: keyof QuestionData, value: unknown) {
    setQuestions((prev) =>
      prev.map((q, idx) => (idx === i ? { ...q, [field]: value } : q))
    );
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx !== qi) return q;
        const options = [...q.options];
        options[oi] = value;
        return { ...q, options };
      })
    );
  }

  async function saveQuiz() {
    if (!title.trim()) { toast.error("Quiz title is required"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, description: description || null, duration,
          passingScore, totalMarks, negativeMarking, negativeValue,
          randomize, maxAttempts, instructions: instructions || null,
          questions,
        }),
      });
      if (!res.ok) throw new Error(String((await res.json()).error ?? "Save failed"));
      toast.success("Quiz saved successfully!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish() {
    setPublishing(true);
    const next = !isPublished;
    try {
      const res = await fetch(`/api/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: next }),
      });
      if (!res.ok) throw new Error("Failed");
      setIsPublished(next);
      toast.success(next ? "Quiz is now live!" : "Quiz moved to draft");
    } catch {
      toast.error("Failed to update publish status");
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center gap-3 bg-card border border-border rounded-xl px-5 py-3">
        <button
          onClick={() => router.push("/admin/quizzes")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="h-5 w-px bg-border" />
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
          isPublished
            ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
            : "bg-muted text-muted-foreground border border-border"
        )}>
          {isPublished
            ? <><CheckCircle className="w-3 h-3" /> Live</>
            : <><AlertCircle className="w-3 h-3" /> Draft</>}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={togglePublish}
            disabled={publishing}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all disabled:opacity-50",
              isPublished
                ? "border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                : "border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
            )}
          >
            {publishing ? "Updating..." : isPublished
              ? <><EyeOff className="w-4 h-4" /> Unpublish</>
              : <><Eye className="w-4 h-4" /> Publish</>}
          </button>
          <button
            onClick={saveQuiz}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {(["settings", "questions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors",
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab === "questions" ? `Questions (${questions.length})` : "Settings"}
          </button>
        ))}
      </div>

      {/* SETTINGS */}
      {activeTab === "settings" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-5">
          <h2 className="font-semibold">Quiz Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)}
                rows={2} className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 resize-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5"><Timer className="inline w-3.5 h-3.5 mr-1" />Duration (minutes)</label>
              <input type="number" value={duration} min={1} onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5"><Target className="inline w-3.5 h-3.5 mr-1" />Passing Score (%)</label>
              <input type="number" value={passingScore} min={1} max={100} onChange={(e) => setPassingScore(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Total Marks</label>
              <input type="number" value={totalMarks} min={1} onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Max Attempts</label>
              <input type="number" value={maxAttempts} min={1} onChange={(e) => setMaxAttempts(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>
            <div className="md:col-span-2 flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={randomize} onChange={(e) => setRandomize(e.target.checked)} className="rounded" />
                <span className="text-sm">Randomize question order</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={negativeMarking} onChange={(e) => setNegativeMarking(e.target.checked)} className="rounded" />
                <span className="text-sm">Negative marking</span>
              </label>
            </div>
            {negativeMarking && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Deduction per wrong answer</label>
                <input type="number" value={negativeValue} step={0.25} min={0} max={1} onChange={(e) => setNegativeValue(Number(e.target.value))}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Instructions</label>
              <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)}
                rows={3} placeholder="Any special instructions for students..."
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 resize-none" />
            </div>
          </div>
          {(quiz.course || quiz.batch) && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Linked to</p>
              <div className="flex gap-3">
                {quiz.course && <div className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-lg text-sm border border-blue-500/20">📚 {quiz.course.title}</div>}
                {quiz.batch && <div className="px-3 py-1.5 bg-violet-500/10 text-violet-600 rounded-lg text-sm border border-violet-500/20">👥 {quiz.batch.name}</div>}
              </div>
            </div>
          )}
        </div>
      )}

      {/* QUESTIONS */}
      {activeTab === "questions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {questions.length === 0
                ? "No questions yet"
                : `${questions.length} question${questions.length !== 1 ? "s" : ""} • ${questions.reduce((s, q) => s + q.marks, 0)} total marks`}
            </p>
            <button onClick={addQuestion}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-16 text-center">
              <p className="text-muted-foreground mb-3">No questions yet</p>
              <button onClick={addQuestion} className="text-sm text-primary hover:underline">Add your first question</button>
            </div>
          ) : (
            questions.map((q, i) => (
              <div key={q.id ?? i} className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedQ(expandedQ === i ? null : i)}>
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{q.question || "Untitled Question"}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {QUESTION_TYPES.find((t) => t.value === q.type)?.label} • {q.marks} mark{q.marks !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeQuestion(i); }}
                      className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedQ === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {expandedQ === i && (
                  <div className="p-4 border-t border-border space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Question Type</label>
                        <select value={q.type} onChange={(e) => updateQuestion(i, "type", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none">
                          {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Marks</label>
                        <input type="number" value={q.marks} min={1}
                          onChange={(e) => updateQuestion(i, "marks", parseInt(e.target.value))}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Question Text *</label>
                      <textarea value={q.question} onChange={(e) => updateQuestion(i, "question", e.target.value)}
                        rows={3} placeholder="Enter the question..."
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none resize-none" />
                    </div>

                    {(q.type === "MCQ" || q.type === "MULTIPLE_SELECT" || q.type === "SCENARIO") && (
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">
                          Options — {q.type === "MULTIPLE_SELECT" ? "check ALL correct answers" : "check the ONE correct answer"}
                        </label>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => {
                            const isCorrect = q.type === "MULTIPLE_SELECT"
                              ? q.correctAnswer.split(",").includes(opt)
                              : q.correctAnswer === opt;
                            return (
                              <div key={oi} className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded bg-muted text-xs flex items-center justify-center font-medium flex-shrink-0">
                                  {String.fromCharCode(65 + oi)}
                                </span>
                                <input value={opt} onChange={(e) => updateOption(i, oi, e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                  className="flex-1 px-3 py-1.5 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                                <input
                                  type={q.type === "MULTIPLE_SELECT" ? "checkbox" : "radio"}
                                  name={`correct-${i}`}
                                  checked={isCorrect}
                                  onChange={() => {
                                    if (q.type === "MULTIPLE_SELECT") {
                                      const answers = q.correctAnswer ? q.correctAnswer.split(",").filter(Boolean) : [];
                                      const idx = answers.indexOf(opt);
                                      if (idx > -1) answers.splice(idx, 1); else answers.push(opt);
                                      updateQuestion(i, "correctAnswer", answers.join(","));
                                    } else {
                                      updateQuestion(i, "correctAnswer", opt);
                                    }
                                  }}
                                  className="rounded" title="Mark as correct" />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {q.type === "TRUE_FALSE" && (
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Correct Answer</label>
                        <div className="flex gap-3">
                          {["True", "False"].map((opt) => (
                            <button key={opt} type="button" onClick={() => updateQuestion(i, "correctAnswer", opt)}
                              className={cn("flex-1 py-2 text-sm rounded-lg border transition-colors",
                                q.correctAnswer === opt ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {(q.type === "FILL_BLANK" || q.type === "CODING") && (
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          {q.type === "CODING" ? "Expected Output" : "Correct Answer"}
                        </label>
                        <input value={q.correctAnswer} onChange={(e) => updateQuestion(i, "correctAnswer", e.target.value)}
                          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none font-mono" />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Explanation (shown after attempt)</label>
                      <textarea value={q.explanation} onChange={(e) => updateQuestion(i, "explanation", e.target.value)}
                        rows={2} placeholder="Explain the correct answer..."
                        className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none resize-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Difficulty</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((d) => (
                          <button key={d} type="button" onClick={() => updateQuestion(i, "difficulty", d)}
                            className={cn("flex-1 py-1.5 text-xs rounded-lg border transition-colors",
                              q.difficulty === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
                            {["Easy", "Easy+", "Medium", "Hard", "Expert"][d - 1]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}

          {questions.length > 0 && (
            <div className="flex justify-end pt-2">
              <button onClick={saveQuiz} disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors">
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save All Changes"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}