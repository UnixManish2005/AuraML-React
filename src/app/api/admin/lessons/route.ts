// ============================================================
// LESSONS API  — /api/admin/lessons
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { lessonSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = lessonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    const { moduleId, order, videoUrl, pdfUrl, ...rest } = parsed.data;
    const count = await db.lesson.count({ where: { moduleId } });
    const finalOrder = order ?? count + 1;

    const lesson = await db.lesson.create({
      data: {
        moduleId,
        order: finalOrder,
        videoUrl: videoUrl || null,
        pdfUrl: pdfUrl || null,
        ...rest,
      },
    });

    return NextResponse.json({ lesson }, { status: 201 });
  } catch (error) {
    console.error("[LESSON CREATE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
