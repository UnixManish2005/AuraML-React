// ============================================================
// MODULES API  — /api/admin/modules
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { moduleSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const courseId = new URL(req.url).searchParams.get("courseId");
    if (!courseId) return NextResponse.json({ error: "courseId required" }, { status: 400 });

    const modules = await db.module.findMany({
      where: { courseId },
      include: { lessons: { orderBy: { order: "asc" } } },
      orderBy: { order: "asc" },
    });

    return NextResponse.json({ modules });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = moduleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data", details: parsed.error.flatten() }, { status: 400 });
    }

    // Auto-assign next order if not provided
    const { courseId, order, ...rest } = parsed.data;
    const count = await db.module.count({ where: { courseId } });
    const finalOrder = order ?? count + 1;

    const module = await db.module.create({
      data: { courseId, order: finalOrder, ...rest },
      include: { lessons: true },
    });

    return NextResponse.json({ module }, { status: 201 });
  } catch (error) {
    console.error("[MODULE CREATE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
