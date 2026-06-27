// ============================================================
// ADMIN CREATE QUIZ PAGE
// ============================================================

import { requireAdmin } from "@/lib/auth/helpers";
import QuizBuilder from "@/components/quiz/quiz-builder";

export const metadata = { title: "Create Quiz" };

export default async function CreateQuizPage() {
  await requireAdmin();
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Create Quiz</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build a new assessment with multiple question types
        </p>
      </div>
      <QuizBuilder />
    </div>
  );
}
