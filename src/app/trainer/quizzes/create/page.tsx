// ============================================================
// TRAINER CREATE QUIZ PAGE
// ============================================================

import { requireTrainer } from "@/lib/auth/helpers";
import QuizBuilder from "@/components/quiz/quiz-builder";

export const metadata = { title: "Create Quiz" };

export default async function TrainerCreateQuizPage() {
  await requireTrainer();
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Create Quiz</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Build an assessment with multiple question types for your batch
        </p>
      </div>
      <QuizBuilder redirectTo="/trainer/quizzes" />
    </div>
  );
}
