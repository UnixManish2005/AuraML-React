import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { id } = await params;

    // Admins/Trainers get full data including correct answers
    if (["ADMIN", "SUPER_ADMIN", "TRAINER"].includes(session.user.role)) {
      const quiz = await db.quiz.findUnique({
        where: { id },
        include: {
          questions: { orderBy: { order: "asc" } },
          course: { select: { id: true, title: true } },
          batch: { select: { id: true, name: true } },
        },
      });
      if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ quiz });
    }

    // Students — check publish status and attempt limits
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          orderBy: { order: "asc" },
          select: {
            id: true, type: true, question: true,
            options: true, marks: true, difficulty: true, order: true,
          },
        },
      },
    });

    if (!quiz) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (!quiz.isPublished) return NextResponse.json({ error: "Quiz not available" }, { status: 403 });

    const attemptCount = await db.quizAttempt.count({
      where: { userId: session.user.id, quizId: id },
    });
    if (attemptCount >= quiz.maxAttempts) {
      return NextResponse.json({ error: "Maximum attempts reached" }, { status: 403 });
    }

    let questions = quiz.questions;
    if (quiz.randomize) questions = [...questions].sort(() => Math.random() - 0.5);

    const attempt = await db.quizAttempt.create({
      data: { userId: session.user.id, quizId: id, status: "IN_PROGRESS", totalMarks: quiz.totalMarks },
    });

    return NextResponse.json({
      quiz: { ...quiz, questions, attemptId: attempt.id, attemptNumber: attemptCount + 1 },
    });
  } catch (error) {
    console.error("[QUIZ GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN", "TRAINER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();
    const { questions, ...quizFields } = body;

    const quiz = await db.quiz.update({ where: { id }, data: quizFields });

    if (questions && Array.isArray(questions)) {
      await db.question.deleteMany({ where: { quizId: id } });
      if (questions.length > 0) {
        await db.question.createMany({
          data: questions.map((q: {
            type: string; question: string; options?: string[];
            correctAnswer: string; explanation?: string; marks?: number; difficulty?: number;
          }, i: number) => ({
            quizId: id,
            type: q.type,
            question: q.question,
            options: q.options && q.options.length > 0 ? q.options : null,
            correctAnswer: q.type === "MULTIPLE_SELECT" && typeof q.correctAnswer === "string"
              ? q.correctAnswer.split(",").filter(Boolean)
              : q.correctAnswer,
            explanation: q.explanation || null,
            marks: q.marks || 1,
            difficulty: q.difficulty || 1,
            order: i + 1,
          })),
        });
      }
    }

    return NextResponse.json({ success: true, quiz });
  } catch (error) {
    console.error("[QUIZ PATCH]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN", "TRAINER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await db.question.deleteMany({ where: { quizId: id } });
    await db.quiz.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[QUIZ DELETE]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}