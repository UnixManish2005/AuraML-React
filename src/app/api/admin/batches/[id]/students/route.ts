// ============================================================
// BATCH STUDENTS API  — /api/admin/batches/[id]/students
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

// GET  — list all students enrolled in this batch
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Trainers may only view their own batches
    const { id: batchId } = await params;
    if (session.user.role === "TRAINER") {
      const batch = await db.batch.findFirst({
        where: { id: batchId, trainer: { userId: session.user.id } },
      });
      if (!batch) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const batchStudents = await db.batchStudent.findMany({
      where: { batchId },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true, status: true, image: true } },
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json({ batchStudents });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST  — add a student (by studentId) to this batch
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN", "TRAINER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: batchId } = await params;

    // Trainers may only manage their own batches
    if (session.user.role === "TRAINER") {
      const batch = await db.batch.findFirst({
        where: { id: batchId, trainer: { userId: session.user.id } },
      });
      if (!batch) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    // Check batch capacity
    const [batch, currentCount] = await Promise.all([
      db.batch.findUnique({ where: { id: batchId } }),
      db.batchStudent.count({ where: { batchId } }),
    ]);

    if (!batch) return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    if (currentCount >= batch.capacity) {
      return NextResponse.json({ error: "Batch is at full capacity" }, { status: 400 });
    }

    // Upsert — handles both new enroll and re-activating a removed student
    const batchStudent = await db.batchStudent.upsert({
      where: { batchId_studentId: { batchId, studentId } },
      create: { batchId, studentId, isActive: true },
      update: { isActive: true },
      include: {
        student: {
          include: {
            user: { select: { id: true, name: true, email: true, status: true, image: true } },
          },
        },
      },
    });

    return NextResponse.json({ batchStudent }, { status: 201 });
  } catch (error) {
    console.error("[BATCH ADD STUDENT]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE  — remove a student (by studentId) from this batch
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN", "TRAINER"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: batchId } = await params;

    if (session.user.role === "TRAINER") {
      const batch = await db.batch.findFirst({
        where: { id: batchId, trainer: { userId: session.user.id } },
      });
      if (!batch) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { studentId } = await req.json();
    if (!studentId) {
      return NextResponse.json({ error: "studentId required" }, { status: 400 });
    }

    await db.batchStudent.delete({
      where: { batchId_studentId: { batchId, studentId } },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Remove failed" }, { status: 500 });
  }
}
