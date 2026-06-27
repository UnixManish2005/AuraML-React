// ============================================================
// BATCHES BASE API  —  /api/admin/batches
// THIS FILE: src/app/api/admin/batches/route.ts  (NOT [id])
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { batchSchema } from "@/lib/validators";

// GET  — list all batches (scoped to trainer's own if role === TRAINER)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const where =
      session.user.role === "TRAINER"
        ? { trainer: { userId: session.user.id } }
        : {};

    const batches = await db.batch.findMany({
      where,
      include: {
        course: { select: { title: true } },
        trainer: { include: { user: { select: { name: true } } } },
        _count: { select: { batchStudents: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ batches });
  } catch (error) {
    console.error("[BATCH LIST]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST  — create a new batch  (ADMIN / SUPER_ADMIN only)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = batchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const batch = await db.batch.create({
      data: {
        name: parsed.data.name,
        courseId: parsed.data.courseId,
        trainerId: parsed.data.trainerId,
        capacity: parsed.data.capacity,
        status: parsed.data.status,
        description: parsed.data.description ?? null,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
      },
      include: {
        course: { select: { title: true } },
        trainer: { include: { user: { select: { name: true } } } },
        _count: { select: { batchStudents: true } },
      },
    });

    return NextResponse.json({ batch }, { status: 201 });
  } catch (error) {
    console.error("[BATCH CREATE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
