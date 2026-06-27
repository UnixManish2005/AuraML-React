// ============================================================
// TRAINERS API
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { trainerSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const trainers = await db.trainer.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, status: true, image: true } },
        courses: { include: { course: { select: { title: true } } } },
        _count: { select: { batches: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ trainers });
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
    const parsed = trainerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { name, email, phone, bio, expertise, experience } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

    const hashedPassword = await bcrypt.hash("Trainer@123", 12);

    const trainer = await db.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role: "TRAINER",
          mustChangePassword: true,  // force password change on first login
        },
      });
      const trainerProfile = await tx.trainer.create({
        data: { userId: user.id, bio, expertise: expertise || [], experience: experience || 0 },
        include: {
    user: { select: { id: true, name: true, email: true, status: true, image: true } },
    courses: { include: { course: { select: { title: true } } } },
    _count: { select: { batches: true } },
  },
      });
      return trainerProfile;
    });

    return NextResponse.json({ trainer }, { status: 201 });
  } catch (error) {
    console.error("[TRAINER CREATE]", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}