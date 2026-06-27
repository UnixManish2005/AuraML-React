// ============================================================
// COURSE STUDENTS API — /api/admin/courses/[id]/students
// GET  — all batches for this course, each with their enrolled students
// POST — enroll a student into a specific batch of this course
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/helpers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: courseId } = await params;

    const batches = await db.batch.findMany({
      where: { courseId },
      include: {
        trainer: {
          include: { user: { select: { name: true } } },
        },
        batchStudents: {
          where: { isActive: true },
          include: {
            student: {
              include: {
                user: {
                  select: { id: true, name: true, email: true, image: true, status: true },
                },
              },
            },
          },
          orderBy: { joinedAt: "desc" },
        },
        _count: { select: { batchStudents: true } },
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ batches });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: courseId } = await params;
    const { studentId, batchId } = await req.json();

    if (!studentId || !batchId) {
      return NextResponse.json(
        { error: "studentId and batchId are required" },
        { status: 400 }
      );
    }

    // Make sure the batch belongs to this course
    const batch = await db.batch.findFirst({
      where: { id: batchId, courseId },
    });
    if (!batch) {
      return NextResponse.json(
        { error: "Batch not found in this course" },
        { status: 404 }
      );
    }

    // Check capacity
    const currentCount = await db.batchStudent.count({
      where: { batchId, isActive: true },
    });
    if (currentCount >= batch.capacity) {
      return NextResponse.json(
        { error: `Batch "${batch.name}" is at full capacity (${batch.capacity})` },
        { status: 400 }
      );
    }

    // Upsert handles re-enrolling a previously removed student
    const batchStudent = await db.batchStudent.upsert({
      where: { batchId_studentId: { batchId, studentId } },
      create: { batchId, studentId, isActive: true },
      update: { isActive: true },
      include: {
        student: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true, status: true },
            },
          },
        },
      },
    });

    return NextResponse.json({ batchStudent }, { status: 201 });
  } catch (error) {
    console.error("[COURSE ENROLL STUDENT]", error);
    return NextResponse.json({ error: "Enroll failed" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id: courseId } = await params;
    const { studentId, batchId } = await req.json();

    if (!studentId || !batchId) {
      return NextResponse.json(
        { error: "studentId and batchId are required" },
        { status: 400 }
      );
    }

    // Verify batch belongs to this course
    const batch = await db.batch.findFirst({ where: { id: batchId, courseId } });
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    await db.batchStudent.update({
      where: { batchId_studentId: { batchId, studentId } },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[COURSE REMOVE STUDENT]", error);
    return NextResponse.json({ error: "Remove failed" }, { status: 500 });
  }
}