import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/helpers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const trainer = await db.trainer.findUnique({
      where: { id },
      select: {
        userId: true,
        _count: { select: { batches: true } },
      },
    });

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found" }, { status: 404 });
    }

    if (trainer._count.batches > 0) {
      // Has batches — soft delete to preserve referential integrity
      await db.user.update({
        where: { id: trainer.userId },
        data: { status: "SUSPENDED" },
      });
    } else {
      // No batches — safe to hard delete (Cascade rule cleans up trainer profile)
      await db.user.delete({ where: { id: trainer.userId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TRAINER DELETE]", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}