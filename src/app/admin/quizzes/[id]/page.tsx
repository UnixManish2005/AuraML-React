import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/helpers";
import { notFound } from "next/navigation";
import QuizEditor from "@/components/quiz/quiz-editor";

async function getQuiz(id: string) {
  return db.quiz.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { order: "asc" } },
      course: { select: { id: true, title: true } },
      batch: { select: { id: true, name: true } },
    },
  });
}

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const quiz = await getQuiz(id);
  if (!quiz) notFound();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Edit Quiz</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {quiz.title} — {quiz.questions.length} questions
        </p>
      </div>
      <QuizEditor quiz={quiz} />
    </div>
  );
}