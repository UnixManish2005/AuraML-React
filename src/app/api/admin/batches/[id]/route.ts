// ============================================================
// BATCH [id] API  —  /api/admin/batches/[id]
// THIS FILE: src/app/api/admin/batches/[id]/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";

// GET  — fetch a single batch by id
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;

    const where =
      session.user.role === "TRAINER"
        ? { id, trainer: { userId: session.user.id } }
        : { id };

    const batch = await db.batch.findFirst({
      where,
      include: {
        course: { select: { id: true, title: true } },
        trainer: { include: { user: { select: { name: true } } } },
        _count: { select: { batchStudents: true } },
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ batch });
  } catch (error) {
    console.error("[BATCH GET]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH  — update batch fields
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await req.json();

    const batch = await db.batch.update({ where: { id }, data: body });
    return NextResponse.json({ batch });
  } catch (error) {
    console.error("[BATCH PATCH]", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// DELETE  — delete a batch
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (
      !session?.user ||
      !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    await db.batch.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BATCH DELETE]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
