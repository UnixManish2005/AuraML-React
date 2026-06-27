// ============================================================
// QUIZZES API - List + Create
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { quizSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    const batchId = searchParams.get("batchId");
    const published = searchParams.get("published");

    const where = {
      ...(courseId && { courseId }),
      ...(batchId && { batchId }),
      ...(published === "true" && { isPublished: true }),
      ...(session.user.role === "STUDENT" && { isPublished: true }),
    };

    const quizzes = await db.quiz.findMany({
      where,
      include: {
        _count: { select: { questions: true, attempts: true } },
        course: { select: { title: true } },
        trainer: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    // For students, attach their attempt info
    if (session.user.role === "STUDENT") {
      const userAttempts = await db.quizAttempt.findMany({
        where: { userId: session.user.id },
        select: { quizId: true, status: true, percentage: true, passed: true },
      });

      const attemptMap = new Map(userAttempts.map((a) => [a.quizId, a]));
      const quizzesWithAttempts = quizzes.map((q) => ({
        ...q,
        userAttempt: attemptMap.get(q.id) || null,
      }));

      return NextResponse.json({ quizzes: quizzesWithAttempts });
    }

    return NextResponse.json({ quizzes });
  } catch (error) {
    console.error("[QUIZZES GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN", "TRAINER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { questions, ...quizData } = body;

    const parsed = quizSchema.safeParse(quizData);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid quiz data", details: parsed.error.flatten() }, { status: 400 });
    }

    // Find trainer profile if TRAINER role
    let trainerId: string | undefined;
    if (session.user.role === "TRAINER") {
      const trainer = await db.trainer.findUnique({ where: { userId: session.user.id } });
      trainerId = trainer?.id;
    }

    const quiz = await db.$transaction(async (tx) => {
      const newQuiz = await tx.quiz.create({
        data: {
          ...parsed.data,
          trainerId,
        },
      });

      if (questions && Array.isArray(questions) && questions.length > 0) {
        await tx.question.createMany({
          data: questions.map((q: {
            type: string;
            question: string;
            options?: string[];
            correctAnswer: string | string[];
            explanation?: string;
            marks?: number;
            difficulty?: number;
          }, i: number) => ({
            quizId: newQuiz.id,
            type: q.type,
            question: q.question,
            options: q.options || null,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation || null,
            marks: q.marks || 1,
            difficulty: q.difficulty || 1,
            order: i + 1,
          })),
        });
      }

      return newQuiz;
    });

    return NextResponse.json({ success: true, quiz }, { status: 201 });
  } catch (error) {
    console.error("[QUIZ CREATE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
