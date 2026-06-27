// ============================================================
// QUIZ ATTEMPT SUBMISSION + GRADING ENGINE
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { answers, timeTaken } = await req.json();

    // Get quiz with correct answers
    const quiz = await db.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          select: {
            id: true,
            type: true,
            correctAnswer: true,
            marks: true,
          },
        },
      },
    });

    if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

    // Find in-progress attempt
    const attempt = await db.quizAttempt.findFirst({
      where: {
        userId: session.user.id,
        quizId: id,
        status: "IN_PROGRESS",
      },
      orderBy: { startedAt: "desc" },
    });

    if (!attempt) return NextResponse.json({ error: "No active attempt found" }, { status: 400 });

    // ---- GRADING ENGINE ----
    let totalScore = 0;
    let correct = 0;
    let wrong = 0;
    let skipped = 0;

    const answerRecords = quiz.questions.map((question) => {
      const userAnswer = answers[question.id];

      // Skipped
      if (userAnswer === undefined || userAnswer === null || userAnswer === "" ||
          (Array.isArray(userAnswer) && userAnswer.length === 0)) {
        skipped++;
        return {
          attemptId: attempt.id,
          questionId: question.id,
          userAnswer: { value: null },
          isCorrect: false,
          marksObtained: 0,
        };
      }

      // Grade based on type
      let isCorrect = false;
      const correctAnswer = question.correctAnswer as string | string[];

      if (question.type === "MULTIPLE_SELECT") {
        const userArr = Array.isArray(userAnswer) ? userAnswer.sort() : [];
        const correctArr = (Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer]).sort();
        isCorrect = JSON.stringify(userArr) === JSON.stringify(correctArr);
      } else {
        const userStr = String(userAnswer).trim().toLowerCase();
        const correctStr = String(Array.isArray(correctAnswer) ? correctAnswer[0] : correctAnswer).trim().toLowerCase();
        isCorrect = userStr === correctStr;
      }

      let marksObtained = 0;
      if (isCorrect) {
        marksObtained = question.marks;
        totalScore += question.marks;
        correct++;
      } else {
        wrong++;
        if (quiz.negativeMarking) {
          marksObtained = -(question.marks * quiz.negativeValue);
          totalScore += marksObtained;
        }
      }

      return {
        attemptId: attempt.id,
        questionId: question.id,
        userAnswer: { value: userAnswer },
        isCorrect,
        marksObtained,
      };
    });

    // Clamp score to 0
    totalScore = Math.max(0, totalScore);
    const percentage = (totalScore / quiz.totalMarks) * 100;
    const passed = percentage >= quiz.passingScore;

    // Save answers and update attempt
    await db.$transaction([
      db.answer.createMany({ data: answerRecords }),
      db.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          status: "COMPLETED",
          score: totalScore,
          percentage,
          passed,
          completedAt: new Date(),
          timeTaken,
        },
      }),
    ]);

    // Update student analytics
    await db.userAnalytics.upsert({
      where: { userId: session.user.id },
      update: {
        quizzesTaken: { increment: 1 },
        avgQuizScore: percentage, // Simplified; production would average properly
      },
      create: {
        userId: session.user.id,
        quizzesTaken: 1,
        avgQuizScore: percentage,
      },
    }).catch(console.error);

    // Award points to student
    if (passed) {
      await db.student.updateMany({
        where: { userId: session.user.id },
        data: { totalPoints: { increment: Math.round(percentage) } },
      }).catch(console.error);
    }

    // Auto-issue certificate if passed and quiz linked to course
    if (passed && quiz.courseId) {
      const existing = await db.certificate.findFirst({
        where: { userId: session.user.id, courseId: quiz.courseId, type: "QUIZ_COMPLETION" },
      });
      if (!existing) {
        await db.certificate.create({
          data: {
            userId: session.user.id,
            courseId: quiz.courseId,
            type: "QUIZ_COMPLETION",
            title: `${quiz.title} - Completion Certificate`,
            certificateId: `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
          },
        }).catch(console.error);
      }
    }

    return NextResponse.json({
      result: {
        score: totalScore,
        percentage: Math.round(percentage * 10) / 10,
        passed,
        totalMarks: quiz.totalMarks,
        correct,
        wrong,
        skipped,
        attemptId: attempt.id,
      },
    });
  } catch (error) {
    console.error("[QUIZ SUBMIT]", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
