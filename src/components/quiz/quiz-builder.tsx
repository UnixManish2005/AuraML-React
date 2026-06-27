// ============================================================
// QUIZ BUILDER - Full Quiz Creator with Questions
// ============================================================

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, ChevronDown, ChevronUp, Save, Eye, Timer, Target } from "lucide-react";
import { toast } from "sonner";
import { quizSchema, type QuizInput } from "@/lib/validators";
import { cn } from "@/lib/utils";

const QUESTION_TYPES = [
  { value: "MCQ", label: "Multiple Choice (Single)" },
  { value: "MULTIPLE_SELECT", label: "Multiple Choice (Multi)" },
  { value: "TRUE_FALSE", label: "True / False" },
  { value: "FILL_BLANK", label: "Fill in the Blank" },
  { value: "SCENARIO", label: "Scenario Based" },
  { value: "CODING", label: "Coding Question" },
];

interface QuestionForm {
  type: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  marks: number;
  difficulty: number;
}

export default function QuizBuilder({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [questions, setQuestions] = useState<QuestionForm[]>([]);
  const [expandedQ, setExpandedQ] = useState<number | null>(0);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<QuizInput>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      duration: 30,
      passingScore: 60,
      totalMarks: 100,
      maxAttempts: 3,
      randomize: true,
      negativeMarking: false,
    },
  });

  function addQuestion() {
    setQuestions((prev) => [
      ...prev,
      { type: "MCQ", question: "", options: ["", "", "", ""], correctAnswer: "", explanation: "", marks: 1, difficulty: 1 },
    ]);
    setExpandedQ(questions.length);
  }

  function removeQuestion(i: number) {
    setQuestions((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateQuestion(i: number, field: string, value: unknown) {
    setQuestions((prev) => prev.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  }

  function updateOption(qi: number, oi: number, value: string) {
    setQuestions((prev) => prev.map((q, idx) => {
      if (idx !== qi) return q;
      const options = [...q.options];
      options[oi] = value;
      return { ...q, options };
    }));
  }

  async function onSubmit(data: QuizInput) {
    if (questions.length === 0) {
      toast.error("Add at least one question");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, questions }),
      });
      if (!res.ok) throw new Error();
      toast.success("Quiz created successfully!");
      router.push(redirectTo ?? "/admin/quizzes");
    } catch {
      toast.error("Failed to create quiz");
    } finally {
      setLoading(false);
    }
  }

  const negMarking = watch("negativeMarking");

  return (
    <div className="max-w-4xl space-y-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Quiz Settings */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold mb-5">Quiz Settings</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Quiz Title *</label>
              <input {...register("title")} placeholder="e.g. Python Basics Assessment" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
              {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1.5">Description</label>
              <textarea {...register("description")} rows={2} placeholder="Brief description of the quiz" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50 resize-none" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                <Timer className="inline w-3.5 h-3.5 mr-1" />Duration (minutes) *
              </label>
              <input {...register("duration", { valueAsNumber: true })} type="number" min="1" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">
                <Target className="inline w-3.5 h-3.5 mr-1" />Passing Score (%)
              </label>
              <input {...register("passingScore", { valueAsNumber: true })} type="number" min="1" max="100" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Total Marks</label>
              <input {...register("totalMarks", { valueAsNumber: true })} type="number" min="1" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Max Attempts</label>
              <input {...register("maxAttempts", { valueAsNumber: true })} type="number" min="1" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register("randomize")} type="checkbox" className="rounded" />
                <span className="text-sm">Randomize Questions</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register("negativeMarking")} type="checkbox" className="rounded" />
                <span className="text-sm">Negative Marking</span>
              </label>
            </div>

            {negMarking && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Negative Value per Wrong Answer</label>
                <input {...register("negativeValue", { valueAsNumber: true })} type="number" step="0.25" min="0" max="1" className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:border-primary/50" />
              </div>
            )}
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Questions <span className="text-muted-foreground text-sm font-normal">({questions.length})</span>
            </h2>
            <button type="button" onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          {questions.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
              <p className="text-muted-foreground mb-4">No questions yet</p>
              <button type="button" onClick={addQuestion} className="text-sm text-blue-500 hover:text-blue-400">Click to add your first question</button>
            </div>
          ) : (
            questions.map((q, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                {/* Question header */}
                <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => setExpandedQ(expandedQ === i ? null : i)}>
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{q.question || "Untitled Question"}</div>
                    <div className="text-xs text-muted-foreground">{QUESTION_TYPES.find((t) => t.value === q.type)?.label} • {q.marks} mark{q.marks > 1 ? "s" : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={(e) => { e.stopPropagation(); removeQuestion(i); }} className="p-1 rounded hover:text-red-500 text-muted-foreground transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {expandedQ === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>

                {/* Question body */}
                {expandedQ === i && (
                  <div className="p-4 border-t border-border space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Question Type</label>
                        <select value={q.type} onChange={(e) => updateQuestion(i, "type", e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none">
                          {QUESTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">Marks</label>
                        <input type="number" value={q.marks} onChange={(e) => updateQuestion(i, "marks", parseInt(e.target.value))} min="1" className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Question Text *</label>
                      <textarea value={q.question} onChange={(e) => updateQuestion(i, "question", e.target.value)} rows={3} placeholder="Enter the question..." className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none resize-none" />
                    </div>

                    {/* Options for MCQ/Multi */}
                    {(q.type === "MCQ" || q.type === "MULTIPLE_SELECT" || q.type === "SCENARIO") && (
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Options</label>
                        <div className="space-y-2">
                          {q.options.map((opt, oi) => (
                            <div key={oi} className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded bg-muted text-xs flex items-center justify-center font-medium">
                                {String.fromCharCode(65 + oi)}
                              </span>
                              <input value={opt} onChange={(e) => updateOption(i, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`} className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none" />
                              <input type={q.type === "MULTIPLE_SELECT" ? "checkbox" : "radio"} name={`correct-${i}`} checked={q.type === "MULTIPLE_SELECT" ? q.correctAnswer.includes(opt) : q.correctAnswer === opt} onChange={() => {
                                if (q.type === "MULTIPLE_SELECT") {
                                  const answers = q.correctAnswer ? q.correctAnswer.split(",") : [];
                                  const idx = answers.indexOf(opt);
                                  if (idx > -1) answers.splice(idx, 1); else answers.push(opt);
                                  updateQuestion(i, "correctAnswer", answers.join(","));
                                } else {
                                  updateQuestion(i, "correctAnswer", opt);
                                }
                              }} className="rounded" title="Mark as correct" />
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Check the correct answer(s)</p>
                      </div>
                    )}

                    {/* True/False */}
                    {q.type === "TRUE_FALSE" && (
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Correct Answer</label>
                        <div className="flex gap-3">
                          {["True", "False"].map((opt) => (
                            <button key={opt} type="button" onClick={() => updateQuestion(i, "correctAnswer", opt)} className={cn("flex-1 py-2 text-sm rounded-lg border transition-colors", q.correctAnswer === opt ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
                              {opt}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Fill blank / Coding */}
                    {(q.type === "FILL_BLANK" || q.type === "CODING") && (
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-1">
                          {q.type === "CODING" ? "Expected Output" : "Correct Answer"}
                        </label>
                        <input value={q.correctAnswer} onChange={(e) => updateQuestion(i, "correctAnswer", e.target.value)} placeholder={q.type === "CODING" ? "Expected output or test cases..." : "The correct answer..."} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none font-mono" />
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Explanation (shown after attempt)</label>
                      <textarea value={q.explanation} onChange={(e) => updateQuestion(i, "explanation", e.target.value)} rows={2} placeholder="Explain the correct answer..." className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none resize-none" />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Difficulty</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((d) => (
                          <button key={d} type="button" onClick={() => updateQuestion(i, "difficulty", d)} className={cn("flex-1 py-1.5 text-xs rounded-lg border transition-colors", q.difficulty === d ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
                            {["Easy", "Easy+", "Mid", "Hard", "Expert"][d - 1]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-4">
          <button type="button" className="flex items-center gap-2 px-6 py-2.5 text-sm border border-border rounded-lg hover:bg-muted transition-colors">
            <Eye className="w-4 h-4" /> Preview
          </button>
          <button type="submit" disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Quiz"}
          </button>
        </div>
      </form>
    </div>
  );
}
