// ============================================================
// COURSES API - src/app/api/admin/courses/route.ts
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { courseSchema } from "@/lib/validators";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const courses = await db.course.findMany({
      include: {
        _count: { select: { modules: true, batches: true } },
        trainers: { include: { trainer: { include: { user: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ courses });
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
    const parsed = courseSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const slug = slugify(parsed.data.title);
    const course = await db.course.create({
      data: { ...parsed.data, slug },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("[COURSE CREATE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
