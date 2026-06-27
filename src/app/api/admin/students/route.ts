// ============================================================
// STUDENTS API - GET (list/search) + POST (create)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/helpers";
import { studentSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    const where = {
      role: "STUDENT" as const,
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(status && status !== "ALL" && {
        status: status as "ACTIVE" | "INACTIVE" | "SUSPENDED" | "PENDING",
      }),
    };

    const [students, total] = await Promise.all([
      db.user.findMany({
        where,
        include: {
          studentProfile: {
            select: {
              id: true,
              college: true,
              totalPoints: true,
              batchStudents: {
                include: { batch: { select: { name: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.user.count({ where }),
    ]);

    // ── Shape results for both the students table AND the batch-search modal ──
    // The modal in batch-detail-view.tsx reads `data.users` and needs:
    //   { id, name, email, status, studentProfile: { id } | null }
    const users = students.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      status: u.status,
      createdAt: u.createdAt,
      // studentProfile.id is what gets sent to POST /batches/[id]/students
      studentProfile: u.studentProfile ? { id: u.studentProfile.id } : null,
      // keep extra fields the students table uses
      _studentProfile: u.studentProfile,
    }));

    return NextResponse.json({
      // "users" — key the modal reads
      users,
      // "data" — key the students table reads (keep for backward compat)
      data: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (err) {
    console.error("[STUDENTS GET]", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();
    const parsed = studentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { name, email, phone, college, degree, yearOfStudy } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash("Student@123", 12);

    const user = await db.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password: hashedPassword, phone, role: "STUDENT" },
      });
      await tx.student.create({
        data: { userId: newUser.id, college, degree, yearOfStudy },
      });
      await tx.userAnalytics.create({ data: { userId: newUser.id } });
      return newUser;
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("[STUDENTS POST]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
